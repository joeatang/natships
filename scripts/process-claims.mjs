/**
 * process-claims.mjs — executes pending DMT-NAT token transfers
 *
 * Run this on your machine (or a cron job) after claims queue up in KV.
 * Requires Node.js 18+ and these packages:
 *   npm install @solana/web3.js @solana/spl-token @cloudflare/cloudflare bs58
 *
 * Usage:
 *   export FAUCET_PRIVATE_KEY="your_base58_private_key"
 *   export DMT_MINT_ADDRESS="your_spl_token_mint_address"
 *   export CF_API_TOKEN="your_cloudflare_api_token"
 *   export CF_ACCOUNT_ID="your_cloudflare_account_id"
 *   export CF_KV_CLAIMS_ID="your_claims_kv_namespace_id"
 *   node scripts/process-claims.mjs
 */

import {
  Connection, Keypair, PublicKey, sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount, createTransferInstruction, TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import bs58 from 'bs58';

const SOLANA_RPC  = 'https://api.mainnet-beta.solana.com';
const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

const {
  FAUCET_PRIVATE_KEY,
  DMT_MINT_ADDRESS,
  CF_API_TOKEN,
  CF_ACCOUNT_ID,
  CF_KV_CLAIMS_ID,
} = process.env;

if (!FAUCET_PRIVATE_KEY || !DMT_MINT_ADDRESS || !CF_API_TOKEN || !CF_ACCOUNT_ID || !CF_KV_CLAIMS_ID) {
  console.error('Missing required environment variables. See comments at top of file.');
  process.exit(1);
}

async function main() {
  const connection  = new Connection(SOLANA_RPC, 'confirmed');
  const faucetKp    = Keypair.fromSecretKey(bs58.decode(FAUCET_PRIVATE_KEY));
  const mintPubkey  = new PublicKey(DMT_MINT_ADDRESS);

  console.log('Faucet wallet:', faucetKp.publicKey.toBase58());

  // List all pending:* keys from KV
  const pending = await listPendingClaims();
  console.log(`Found ${pending.length} pending claim(s).`);

  for (const { kvKey, claim } of pending) {
    if (claim.transferred) {
      console.log(`SKIP (already transferred): ${claim.wallet}`);
      await deletePendingKey(kvKey);
      continue;
    }

    console.log(`Processing: ${claim.wallet} — ${claim.amount.toLocaleString()} DMT-NAT`);

    try {
      const txSig = await sendTokens(connection, faucetKp, mintPubkey, claim.wallet, claim.amount);
      console.log(`  ✓ TX: ${txSig}`);

      // Mark transferred in KV
      claim.transferred = true;
      claim.txSig = txSig;
      await updateClaim(claim);
      await deletePendingKey(kvKey);
    } catch (e) {
      console.error(`  ✗ Failed for ${claim.wallet}:`, e.message);
      // Leave in pending queue for retry
    }

    // Small delay between transfers to avoid RPC rate limits
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log('Done.');
}

async function sendTokens(connection, fromKp, mint, toAddress, amount) {
  const toPubkey = new PublicKey(toAddress);

  const fromATA = await getOrCreateAssociatedTokenAccount(
    connection, fromKp, mint, fromKp.publicKey
  );
  const toATA = await getOrCreateAssociatedTokenAccount(
    connection, fromKp, mint, toPubkey
  );

  const ix = createTransferInstruction(
    fromATA.address, toATA.address, fromKp.publicKey,
    BigInt(amount), [], TOKEN_PROGRAM_ID
  );

  const { Transaction, sendAndConfirmTransaction: sAC } = await import('@solana/web3.js');
  const tx = new Transaction().add(ix);
  return await sendAndConfirmTransaction(connection, tx, [fromKp]);
}

async function listPendingClaims() {
  const url = `${CF_API_BASE}/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_CLAIMS_ID}/keys?prefix=pending:`;
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
  });
  const data = await resp.json();
  if (!data.success) throw new Error('KV list failed: ' + JSON.stringify(data.errors));

  const keys = (data.result || []).map(k => k.name);
  const claims = await Promise.all(keys.map(async k => {
    const val = await getClaim(k);
    return val ? { kvKey: k, claim: val } : null;
  }));
  return claims.filter(Boolean);
}

async function getClaim(key) {
  const url = `${CF_API_BASE}/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_CLAIMS_ID}/values/${encodeURIComponent(key)}`;
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${CF_API_TOKEN}` } });
  if (!resp.ok) return null;
  try { return await resp.json(); } catch { return null; }
}

async function updateClaim(claim) {
  // Update the wallet: and handle: keys with transferred=true
  for (const key of ['wallet:' + claim.wallet, 'handle:' + claim.handle.toLowerCase()]) {
    const url = `${CF_API_BASE}/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_CLAIMS_ID}/values/${encodeURIComponent(key)}`;
    await fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${CF_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(claim),
    });
  }
}

async function deletePendingKey(key) {
  const url = `${CF_API_BASE}/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_CLAIMS_ID}/values/${encodeURIComponent(key)}`;
  await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
  });
}

main().catch(e => { console.error(e); process.exit(1); });
