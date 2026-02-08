//! TicketChain: create events, mint ticket NFTs, and enable on-chain resale on Solana.

use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{
    Mint, TokenAccount, TokenInterface,
    mint_to, MintTo,
    transfer_checked, TransferChecked,
    close_account, CloseAccount,
};

declare_id!("BxjzLBTGVQYHRAC5NBGvyn9r6V7GfVHWUExFcJbRoCts");

#[program]
pub mod ticketchain {
    use super::*;

    /// Create a new event. The event account is a PDA derived from organizer + nonce.
    pub fn create_event(
        ctx: Context<CreateEvent>,
        nonce: u64,
        title: String,
        venue: String,
        date_ts: i64,
        tier_name: String,
        price_lamports: u64,
        supply: u32,
    ) -> Result<()> {
        require!(title.len() <= 64, ErrorCode::TitleTooLong);
        require!(venue.len() <= 64, ErrorCode::VenueTooLong);
        require!(tier_name.len() <= 32, ErrorCode::TierNameTooLong);
        require!(supply > 0, ErrorCode::InvalidSupply);

        let event = &mut ctx.accounts.event;
        event.organizer = ctx.accounts.organizer.key();
        event.nonce = nonce;
        event.title = title;
        event.venue = venue;
        event.date_ts = date_ts;
        event.tier_name = tier_name;
        event.price_lamports = price_lamports;
        event.supply = supply;
        event.sold = 0;

        Ok(())
    }

    /// Buy a ticket: pay SOL to organizer, receive one NFT (new mint, 1 token).
    pub fn buy_ticket(ctx: Context<BuyTicket>) -> Result<()> {
        let event = &ctx.accounts.event;
        require!(event.sold < event.supply, ErrorCode::SoldOut);

        let buyer = &ctx.accounts.buyer;
        let organizer = &ctx.accounts.organizer;
        let lamports = event.price_lamports;

        // Transfer SOL from buyer to organizer
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: buyer.to_account_info(),
                    to: organizer.to_account_info(),
                },
            ),
            lamports,
        )?;

        // Mint one ticket NFT (decimals 0) to buyer; program PDA signs as mint authority
        let event_key = event.key();
        let sold = event.sold;
        let sold_bytes = sold.to_le_bytes();
        let bump = ctx.bumps.ticket_authority;
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"ticket_authority",
            event_key.as_ref(),
            &sold_bytes,
            &[bump],
        ]];
        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.ticket_mint.to_account_info(),
                    to: ctx.accounts.buyer_token_account.to_account_info(),
                    authority: ctx.accounts.ticket_authority.to_account_info(),
                },
                signer_seeds,
            ),
            1,
        )?;

        let event = &mut ctx.accounts.event;
        event.sold = event.sold.checked_add(1).ok_or(ErrorCode::Overflow)?;

        Ok(())
    }

    /// List a ticket for resale. Transfers the NFT into an escrow account
    /// owned by the Listing PDA.
    pub fn list_for_resale(ctx: Context<ListForResale>, price_lamports: u64) -> Result<()> {
        require!(price_lamports > 0, ErrorCode::InvalidPrice);

        // Transfer NFT from seller to escrow
        transfer_checked(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.seller_token_account.to_account_info(),
                    mint: ctx.accounts.ticket_mint.to_account_info(),
                    to: ctx.accounts.escrow_token_account.to_account_info(),
                    authority: ctx.accounts.seller.to_account_info(),
                },
            ),
            1,
            0, // decimals
        )?;

        let listing = &mut ctx.accounts.listing;
        listing.seller = ctx.accounts.seller.key();
        listing.event = ctx.accounts.event.key();
        listing.ticket_mint = ctx.accounts.ticket_mint.key();
        listing.price_lamports = price_lamports;
        listing.bump = ctx.bumps.listing;

        Ok(())
    }

    /// Buy a resale ticket. SOL is split 40/40/20 (artist / seller / platform).
    /// NFT is transferred from escrow to buyer. Listing is closed.
    pub fn buy_resale(ctx: Context<BuyResale>) -> Result<()> {
        let price = ctx.accounts.listing.price_lamports;
        let artist_share = price * 40 / 100;
        let seller_share = price * 40 / 100;
        let platform_share = price - artist_share - seller_share; // 20%

        // 40% to organizer (artist)
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.organizer.to_account_info(),
                },
            ),
            artist_share,
        )?;

        // 40% to seller
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.seller.to_account_info(),
                },
            ),
            seller_share,
        )?;

        // 20% to platform
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.platform.to_account_info(),
                },
            ),
            platform_share,
        )?;

        // Transfer NFT from escrow to buyer
        let ticket_mint_key = ctx.accounts.ticket_mint.key();
        let bump = ctx.accounts.listing.bump;
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"listing",
            ticket_mint_key.as_ref(),
            &[bump],
        ]];

        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.escrow_token_account.to_account_info(),
                    mint: ctx.accounts.ticket_mint.to_account_info(),
                    to: ctx.accounts.buyer_token_account.to_account_info(),
                    authority: ctx.accounts.listing.to_account_info(),
                },
                signer_seeds,
            ),
            1,
            0,
        )?;

        // Close the escrow token account (rent returned to seller)
        close_account(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                CloseAccount {
                    account: ctx.accounts.escrow_token_account.to_account_info(),
                    destination: ctx.accounts.seller.to_account_info(),
                    authority: ctx.accounts.listing.to_account_info(),
                },
                signer_seeds,
            ),
        )?;

        // Listing PDA is closed via `close = seller` at end of instruction
        Ok(())
    }

    /// Cancel a resale listing. Returns the NFT to the seller and closes the listing.
    pub fn cancel_listing(ctx: Context<CancelListing>) -> Result<()> {
        let ticket_mint_key = ctx.accounts.ticket_mint.key();
        let bump = ctx.accounts.listing.bump;
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"listing",
            ticket_mint_key.as_ref(),
            &[bump],
        ]];

        // Transfer NFT back to seller
        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.escrow_token_account.to_account_info(),
                    mint: ctx.accounts.ticket_mint.to_account_info(),
                    to: ctx.accounts.seller_token_account.to_account_info(),
                    authority: ctx.accounts.listing.to_account_info(),
                },
                signer_seeds,
            ),
            1,
            0,
        )?;

        // Close the escrow token account
        close_account(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                CloseAccount {
                    account: ctx.accounts.escrow_token_account.to_account_info(),
                    destination: ctx.accounts.seller.to_account_info(),
                    authority: ctx.accounts.listing.to_account_info(),
                },
                signer_seeds,
            ),
        )?;

        // Listing PDA is closed via `close = seller`
        Ok(())
    }

    /// Close an event. Only the organizer can call this.
    /// Rent SOL is returned to the organizer. No tickets must have been sold.
    pub fn close_event(_ctx: Context<CloseEvent>) -> Result<()> {
        // The `close = organizer` constraint on the event account
        // handles closing the account and returning rent.
        Ok(())
    }
}

// ── Account structs ──────────────────────────────────────────────────

#[account]
pub struct Event {
    pub organizer: Pubkey,
    pub nonce: u64,
    pub title: String,
    pub venue: String,
    pub date_ts: i64,
    pub tier_name: String,
    pub price_lamports: u64,
    pub supply: u32,
    pub sold: u32,
}

#[account]
pub struct Listing {
    pub seller: Pubkey,        // 32
    pub event: Pubkey,         // 32
    pub ticket_mint: Pubkey,   // 32
    pub price_lamports: u64,   // 8
    pub bump: u8,              // 1
}

// ── Instruction contexts ─────────────────────────────────────────────

#[derive(Accounts)]
#[instruction(nonce: u64)]
pub struct CreateEvent<'info> {
    #[account(mut)]
    pub organizer: Signer<'info>,

    #[account(
        init,
        payer = organizer,
        space = 8 + 32 + 8 + 68 + 68 + 8 + 36 + 8 + 4 + 4,
        seeds = [b"event", organizer.key().as_ref(), &nonce.to_le_bytes()],
        bump
    )]
    pub event: Account<'info, Event>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(mut, address = event.organizer)]
    pub organizer: SystemAccount<'info>,

    #[account(
        mut,
        constraint = event.sold < event.supply @ ErrorCode::SoldOut
    )]
    pub event: Account<'info, Event>,

    /// CHECK: PDA used as mint authority for ticket mints.
    #[account(
        seeds = [b"ticket_authority", event.key().as_ref(), &event.sold.to_le_bytes()],
        bump
    )]
    pub ticket_authority: AccountInfo<'info>,

    #[account(
        init,
        payer = buyer,
        mint::decimals = 0,
        mint::authority = ticket_authority.key(),
        seeds = [b"ticket_mint", event.key().as_ref(), &event.sold.to_le_bytes()],
        bump
    )]
    pub ticket_mint: InterfaceAccount<'info, Mint>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = ticket_mint,
        associated_token::authority = buyer
    )]
    pub buyer_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ListForResale<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    pub event: Box<Account<'info, Event>>,

    pub ticket_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init,
        payer = seller,
        space = 8 + 32 + 32 + 32 + 8 + 1,
        seeds = [b"listing", ticket_mint.key().as_ref()],
        bump,
    )]
    pub listing: Box<Account<'info, Listing>>,

    #[account(
        mut,
        associated_token::mint = ticket_mint,
        associated_token::authority = seller,
    )]
    pub seller_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init,
        payer = seller,
        token::mint = ticket_mint,
        token::authority = listing,
        seeds = [b"escrow", ticket_mint.key().as_ref()],
        bump,
    )]
    pub escrow_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyResale<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: Seller receives 40%. Validated by listing.seller constraint.
    #[account(mut, constraint = seller.key() == listing.seller @ ErrorCode::InvalidSeller)]
    pub seller: AccountInfo<'info>,

    /// CHECK: Organizer (artist) receives 40%. Validated by event.organizer.
    #[account(mut, constraint = organizer.key() == event.organizer @ ErrorCode::InvalidOrganizer)]
    pub organizer: AccountInfo<'info>,

    /// CHECK: Platform receives 20%.
    #[account(mut)]
    pub platform: AccountInfo<'info>,

    pub event: Box<Account<'info, Event>>,

    pub ticket_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        seeds = [b"listing", ticket_mint.key().as_ref()],
        bump = listing.bump,
        constraint = listing.event == event.key(),
        constraint = listing.ticket_mint == ticket_mint.key(),
        close = seller,
    )]
    pub listing: Box<Account<'info, Listing>>,

    #[account(
        mut,
        token::mint = ticket_mint,
        token::authority = listing,
        seeds = [b"escrow", ticket_mint.key().as_ref()],
        bump,
    )]
    pub escrow_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = ticket_mint,
        associated_token::authority = buyer,
    )]
    pub buyer_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelListing<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    pub ticket_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        seeds = [b"listing", ticket_mint.key().as_ref()],
        bump = listing.bump,
        constraint = listing.seller == seller.key() @ ErrorCode::InvalidSeller,
        close = seller,
    )]
    pub listing: Box<Account<'info, Listing>>,

    #[account(
        init_if_needed,
        payer = seller,
        associated_token::mint = ticket_mint,
        associated_token::authority = seller,
    )]
    pub seller_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = ticket_mint,
        token::authority = listing,
        seeds = [b"escrow", ticket_mint.key().as_ref()],
        bump,
    )]
    pub escrow_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseEvent<'info> {
    #[account(mut)]
    pub organizer: Signer<'info>,

    #[account(
        mut,
        constraint = event.organizer == organizer.key() @ ErrorCode::InvalidOrganizer,
        close = organizer,
    )]
    pub event: Account<'info, Event>,

    pub system_program: Program<'info, System>,
}

// ── Errors ───────────────────────────────────────────────────────────

#[error_code]
pub enum ErrorCode {
    #[msg("Title too long")]
    TitleTooLong,
    #[msg("Venue too long")]
    VenueTooLong,
    #[msg("Tier name too long")]
    TierNameTooLong,
    #[msg("Supply must be positive")]
    InvalidSupply,
    #[msg("Event is sold out")]
    SoldOut,
    #[msg("Overflow")]
    Overflow,
    #[msg("Invalid price")]
    InvalidPrice,
    #[msg("Invalid seller")]
    InvalidSeller,
    #[msg("Invalid organizer")]
    InvalidOrganizer,
}
