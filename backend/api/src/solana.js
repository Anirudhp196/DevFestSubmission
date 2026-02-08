/**
 * Build Anchor transactions for TicketChain program.
 * Buyer/organizer must sign on the frontend; we return serialized unsigned tx.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import anchor from '@coral-xyz/anchor';
const { BN } = anchor;

const __dirname = dirname(fileURLToPath(import.meta.url));
const idl = JSON.parse(readFileSync(join(__dirname, 'idl', 'ticketchain.json'), 'utf8'));

const PROGRAM_ID = new PublicKey(idl.address);
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
const SYSTEM_PROGRAM_ID = new PublicKey('11111111111111111111111111111111');

// Platform wallet receives 20% of resale proceeds
const PLATFORM_WALLET = new PublicKey(process.env.PLATFORM_WALLET ?? 'GFxY452qfw5nwA4N9KQ28zZTmJL9CD1eenydHY9kEE32');

// Account discriminators (first 8 bytes of sha256("account:<Name>"))
const EVENT_DISCRIMINATOR = Buffer.from([125, 192, 125, 158, 9, 115, 152, 233]);
const LISTING_DISCRIMINATOR = Buffer.from([218, 32, 50, 73, 43, 134, 26, 58]);

function getConnection() {
  const rpc = process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';
  return new Connection(rpc);
}

/**
 * Create Anchor Program instance (read-only, for building txs).
 */
function getProgram(connection) {
  const provider = new anchor.AnchorProvider(
    connection,
    { publicKey: PublicKey.default, signer: {} },
    { commitment: 'confirmed' }
  );
  return new anchor.Program(idl, provider);
}

/**
 * Fetch Event account and parse organizer + sold.
 */
async function fetchEvent(connection, eventPubkey) {
  const accountInfo = await connection.getAccountInfo(eventPubkey);
  if (!accountInfo || !accountInfo.data) return null;
  const data = accountInfo.data;
  if (data.length < 8) return null;
  const discriminator = data.slice(0, 8);
  const organizer = new PublicKey(data.slice(8, 40));
  let offset = 40;
  // skip nonce (u64 = 8 bytes)
  offset += 8;
  const titleLen = data.readUInt32LE(offset);
  offset += 4;
  const title = data.slice(offset, offset + titleLen).toString('utf8');
  offset += titleLen;
  const venueLen = data.readUInt32LE(offset);
  offset += 4;
  offset += venueLen;
  const dateTs = data.readBigInt64LE(offset);
  offset += 8;
  const tierNameLen = data.readUInt32LE(offset);
  offset += 4;
  offset += tierNameLen;
  const priceLamports = data.readBigUInt64LE(offset);
  offset += 8;
  const supply = data.readUInt32LE(offset);
  offset += 4;
  const sold = data.readUInt32LE(offset);
  return { organizer, sold, supply, priceLamports };
}

function findPda(seeds, programId) {
  const [pubkey] = PublicKey.findProgramAddressSync(seeds, programId);
  return pubkey;
}

/**
 * Build unsigned buy_ticket transaction. Returns base64 serialized tx.
 */
export async function buildBuyTicketTransaction(eventPubkey, buyerPubkey) {
  const connection = getConnection();
  const eventPk = new PublicKey(eventPubkey);
  const buyerPk = new PublicKey(buyerPubkey);

  const eventData = await fetchEvent(connection, eventPk);
  if (!eventData) throw new Error('Event account not found');
  if (eventData.sold >= eventData.supply) throw new Error('Event is sold out');

  const soldBuf = Buffer.alloc(4);
  soldBuf.writeUInt32LE(eventData.sold, 0);

  const ticketAuthority = findPda(
    [Buffer.from('ticket_authority'), eventPk.toBuffer(), soldBuf],
    PROGRAM_ID
  );
  const ticketMint = findPda(
    [Buffer.from('ticket_mint'), eventPk.toBuffer(), soldBuf],
    PROGRAM_ID
  );

  const buyerAta = getAssociatedTokenAddressSync(ticketMint, buyerPk);

  const program = getProgram(connection);
  const tx = await program.methods
    .buyTicket()
    .accounts({
      buyer: buyerPk,
      organizer: eventData.organizer,
      event: eventPk,
      ticketAuthority,
      ticketMint,
      buyerTokenAccount: buyerAta,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SYSTEM_PROGRAM_ID,
    })
    .transaction();

  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = buyerPk;

  const serialized = tx.serialize({ requireAllSignatures: false });
  return serialized.toString('base64');
}

/**
 * Build create_event transaction using PDA for event account.
 * Only the organizer wallet needs to sign — no extra keypair.
 */
export async function buildCreateEventTransaction(organizerPubkey, args) {
  const connection = getConnection();
  const program = getProgram(connection);
  const organizerPk = new PublicKey(organizerPubkey);

  // Generate a random nonce for PDA uniqueness
  const nonce = new BN(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
  const nonceBuf = nonce.toArrayLike(Buffer, 'le', 8);

  // Derive the event PDA: seeds = ["event", organizer, nonce_le_bytes]
  const [eventPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('event'), organizerPk.toBuffer(), nonceBuf],
    PROGRAM_ID
  );

  const tx = await program.methods
    .createEvent(
      nonce,
      args.title,
      args.venue,
      new BN(args.dateTs),
      args.tierName,
      new BN(args.priceLamports),
      args.supply
    )
    .accounts({
      organizer: organizerPk,
      event: eventPda,
      systemProgram: SYSTEM_PROGRAM_ID,
    })
    .transaction();

  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = organizerPk;

  const serialized = tx.serialize({ requireAllSignatures: false });
  return {
    transaction: serialized.toString('base64'),
    eventPubkey: eventPda.toBase58(),
  };
}

/**
 * Build close_event transaction. Only the organizer can close their event.
 * Returns base64 serialized tx for the organizer to sign.
 */
export async function buildCloseEventTransaction(organizerPubkey, eventPubkey) {
  const connection = getConnection();
  const program = getProgram(connection);
  const organizerPk = new PublicKey(organizerPubkey);
  const eventPk = new PublicKey(eventPubkey);

  const tx = await program.methods
    .closeEvent()
    .accounts({
      organizer: organizerPk,
      event: eventPk,
      systemProgram: SYSTEM_PROGRAM_ID,
    })
    .transaction();

  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = organizerPk;

  const serialized = tx.serialize({ requireAllSignatures: false });
  return serialized.toString('base64');
}

// ── Resale functions ────────────────────────────────────────────────

/**
 * Build list_for_resale transaction. Seller lists a ticket NFT on-chain.
 */
export async function buildListForResaleTransaction(sellerPubkey, eventPubkey, ticketMintPubkey, priceLamports) {
  const connection = getConnection();
  const program = getProgram(connection);
  const sellerPk = new PublicKey(sellerPubkey);
  const eventPk = new PublicKey(eventPubkey);
  const ticketMintPk = new PublicKey(ticketMintPubkey);

  const [listingPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('listing'), ticketMintPk.toBuffer()],
    PROGRAM_ID
  );
  const [escrowPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('escrow'), ticketMintPk.toBuffer()],
    PROGRAM_ID
  );
  const sellerAta = getAssociatedTokenAddressSync(ticketMintPk, sellerPk);

  const tx = await program.methods
    .listForResale(new BN(priceLamports))
    .accounts({
      seller: sellerPk,
      event: eventPk,
      ticketMint: ticketMintPk,
      listing: listingPda,
      sellerTokenAccount: sellerAta,
      escrowTokenAccount: escrowPda,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SYSTEM_PROGRAM_ID,
    })
    .transaction();

  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = sellerPk;

  const serialized = tx.serialize({ requireAllSignatures: false });
  return {
    transaction: serialized.toString('base64'),
    listingPubkey: listingPda.toBase58(),
  };
}

/**
 * Build buy_resale transaction. Buyer purchases a listed resale ticket.
 * SOL is split 40/40/20 (organizer / seller / platform) on-chain.
 */
export async function buildBuyResaleTransaction(buyerPubkey, ticketMintPubkey) {
  const connection = getConnection();
  const program = getProgram(connection);
  const buyerPk = new PublicKey(buyerPubkey);
  const ticketMintPk = new PublicKey(ticketMintPubkey);

  // Derive listing & escrow PDAs
  const [listingPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('listing'), ticketMintPk.toBuffer()],
    PROGRAM_ID
  );
  const [escrowPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('escrow'), ticketMintPk.toBuffer()],
    PROGRAM_ID
  );

  // Fetch listing to get seller + event
  const listingInfo = await connection.getAccountInfo(listingPda);
  if (!listingInfo) throw new Error('Listing not found on-chain');
  const listingData = listingInfo.data;
  const seller = new PublicKey(listingData.slice(8, 40));
  const eventPk = new PublicKey(listingData.slice(40, 72));

  // Fetch event to get organizer
  const eventData = await fetchEvent(connection, eventPk);
  if (!eventData) throw new Error('Event account not found for this listing');

  const buyerAta = getAssociatedTokenAddressSync(ticketMintPk, buyerPk);

  const tx = await program.methods
    .buyResale()
    .accounts({
      buyer: buyerPk,
      seller,
      organizer: eventData.organizer,
      platform: PLATFORM_WALLET,
      event: eventPk,
      ticketMint: ticketMintPk,
      listing: listingPda,
      escrowTokenAccount: escrowPda,
      buyerTokenAccount: buyerAta,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SYSTEM_PROGRAM_ID,
    })
    .transaction();

  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = buyerPk;

  const serialized = tx.serialize({ requireAllSignatures: false });
  return serialized.toString('base64');
}

/**
 * Build cancel_listing transaction. Seller cancels and recovers their NFT.
 */
export async function buildCancelListingTransaction(sellerPubkey, ticketMintPubkey) {
  const connection = getConnection();
  const program = getProgram(connection);
  const sellerPk = new PublicKey(sellerPubkey);
  const ticketMintPk = new PublicKey(ticketMintPubkey);

  const [listingPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('listing'), ticketMintPk.toBuffer()],
    PROGRAM_ID
  );
  const [escrowPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('escrow'), ticketMintPk.toBuffer()],
    PROGRAM_ID
  );
  const sellerAta = getAssociatedTokenAddressSync(ticketMintPk, sellerPk);

  const tx = await program.methods
    .cancelListing()
    .accounts({
      seller: sellerPk,
      ticketMint: ticketMintPk,
      listing: listingPda,
      sellerTokenAccount: sellerAta,
      escrowTokenAccount: escrowPda,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SYSTEM_PROGRAM_ID,
    })
    .transaction();

  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = sellerPk;

  const serialized = tx.serialize({ requireAllSignatures: false });
  return serialized.toString('base64');
}

/**
 * Fetch all on-chain Event accounts using getProgramAccounts.
 * Returns parsed event objects with all fields from the chain.
 */
export async function fetchAllEvents() {
  const connection = getConnection();
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [
      { memcmp: { offset: 0, bytes: EVENT_DISCRIMINATOR.toString('base64'), encoding: 'base64' } },
    ],
  });

  return accounts.map(({ pubkey, account }) => {
    const data = account.data;
    try {
      const organizer = new PublicKey(data.slice(8, 40));
      let offset = 40;
      // nonce (u64)
      offset += 8;
      // title (String: 4-byte len prefix + utf8)
      const titleLen = data.readUInt32LE(offset);
      offset += 4;
      const title = data.slice(offset, offset + titleLen).toString('utf8');
      offset += titleLen;
      // venue (String)
      const venueLen = data.readUInt32LE(offset);
      offset += 4;
      const venue = data.slice(offset, offset + venueLen).toString('utf8');
      offset += venueLen;
      // date_ts (i64)
      const dateTs = Number(data.readBigInt64LE(offset));
      offset += 8;
      // tier_name (String)
      const tierNameLen = data.readUInt32LE(offset);
      offset += 4;
      const tierName = data.slice(offset, offset + tierNameLen).toString('utf8');
      offset += tierNameLen;
      // price_lamports (u64)
      const priceLamports = Number(data.readBigUInt64LE(offset));
      offset += 8;
      // supply (u32)
      const supply = data.readUInt32LE(offset);
      offset += 4;
      // sold (u32)
      const sold = data.readUInt32LE(offset);

      const dateStr = new Date(dateTs * 1000).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });

      return {
        eventPubkey: pubkey.toBase58(),
        organizerPubkey: organizer.toBase58(),
        title,
        venue,
        dateTs,
        tierName,
        priceLamports,
        priceSol: priceLamports / 1e9,
        supply,
        sold,
        available: supply - sold,
        date: dateStr,
        location: venue,
      };
    } catch (e) {
      console.error('Failed to parse event account', pubkey.toBase58(), e);
      return null;
    }
  }).filter(Boolean);
}

/**
 * Fetch all on-chain Listing accounts using getProgramAccounts.
 * Returns parsed listing objects.
 */
export async function fetchAllListings() {
  const connection = getConnection();
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [
      { memcmp: { offset: 0, bytes: LISTING_DISCRIMINATOR.toString('base64'), encoding: 'base64' } },
    ],
  });

  return accounts.map(({ pubkey, account }) => {
    const data = account.data;
    const seller = new PublicKey(data.slice(8, 40));
    const event = new PublicKey(data.slice(40, 72));
    const ticketMint = new PublicKey(data.slice(72, 104));
    const priceLamports = data.readBigUInt64LE(104);
    const bump = data[112];
    return {
      pubkey: pubkey.toBase58(),
      seller: seller.toBase58(),
      event: event.toBase58(),
      ticketMint: ticketMint.toBase58(),
      priceLamports: Number(priceLamports),
      priceSol: Number(priceLamports) / 1e9,
      bump,
    };
  });
}
