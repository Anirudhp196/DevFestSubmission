//! TicketChain: create events and mint ticket NFTs on Solana.

use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, mint_to, MintTo};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod ticketchain {
    use super::*;

    /// Create a new event. Organizer passes a new keypair for the event account.
    pub fn create_event(
        ctx: Context<CreateEvent>,
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
}

#[account]
pub struct Event {
    pub organizer: Pubkey,
    pub title: String,
    pub venue: String,
    pub date_ts: i64,
    pub tier_name: String,
    pub price_lamports: u64,
    pub supply: u32,
    pub sold: u32,
}

#[derive(Accounts)]
pub struct CreateEvent<'info> {
    #[account(mut)]
    pub organizer: Signer<'info>,

    #[account(
        init,
        payer = organizer,
        space = 8 + 32 + 64 + 64 + 8 + 32 + 8 + 4 + 4
    )]
    pub event: Account<'info, Event>,

    pub system_program: Program<'info, System>,
}

/// Program PDA that signs as mint authority for ticket mints.
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

    /// PDA that signs for minting (mint authority for ticket_mint).
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
}
