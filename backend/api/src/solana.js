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
