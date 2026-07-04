#!/usr/bin/env node
// NAT DRIP — Step 8 payout tool (offline, treasury-key stays in Tap Wallet).
//
// Reads the D1 claim ledger through wrangler, produces a bulk-transfer batch you
// paste into Tap Wallet, then records the txid so nobody is ever paid twice.
// This script NEVER touches your wallet or private key — it only reads/writes
// the ledger and writes plain files. You sign the actual sends in Tap Wallet.
//
// Ledger status flow:  queued  ->  sent (exported, awaiting broadcast)  ->  paid
//
// USAGE (run from the worker/ folder):
//   node payout.mjs status                 # how many are queued / sent / paid + pool used
//   node payout.mjs export                 # pull all 'queued', write a batch, mark them 'sent'
//   node payout.mjs paid <manifest> <txid> # after you broadcast: mark that batch 'paid'
//   node payout.mjs revert <manifest>      # abandon a batch: put it back to 'queued'
//
// Batches are written to worker/batches/ (git-ignored — they contain payout addresses).

import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DB = 'natdrip';
const REMOTE = process.env.NATDRIP_LOCAL === '1' ? '' : '--remote';
const HERE = dirname(fileURLToPath(import.meta.url));
const BATCH_DIR = join(HERE, 'batches');

const PUBKEY_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;   // base58, no 0/O/I/l
const TXID_RE = /^[0-9a-fA-F]{64}$/;

// --- run a SQL statement through wrangler and return parsed rows ------------
function sql(query) {
  const cmd = `npx wrangler d1 execute ${DB} ${REMOTE} --json --command ${JSON.stringify(query)}`;
  let out;
  try {
    out = execSync(cmd, { cwd: HERE, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    console.error('\n✘ wrangler command failed. Are you in the worker/ folder and logged in?\n');
    console.error(e.stdout || e.message);
    process.exit(1);
  }
  // wrangler prints the JSON payload to stdout; find the first array/object.
  const start = out.indexOf('[');
  if (start === -1) return [];
  let parsed;
  try { parsed = JSON.parse(out.slice(start)); } catch { return []; }
  const first = Array.isArray(parsed) ? parsed[0] : parsed;
  return (first && first.results) || [];
}

function money(n) { return Number(n).toLocaleString('en-US'); }

// --- commands ---------------------------------------------------------------
function cmdStatus() {
  const rows = sql("SELECT status, COUNT(*) AS n, COALESCE(SUM(amount),0) AS total FROM claims GROUP BY status");
  const pool = sql("SELECT COALESCE(SUM(amount),0) AS committed FROM claims");
  console.log('\nNAT DRIP ledger status\n----------------------');
  if (!rows.length) { console.log('(no claims yet)'); }
  for (const r of rows) console.log(`  ${String(r.status).padEnd(8)} ${String(r.n).padStart(5)} claims   ${money(r.total)} NAT`);
  console.log('----------------------');
  console.log(`  committed total: ${money(pool[0]?.committed || 0)} NAT (pool ceiling 5,000,000,000)\n`);
}

function cmdExport() {
  const rows = sql("SELECT pubkey, btc, amount, tier FROM claims WHERE status = 'queued' ORDER BY created_at ASC");
  if (!rows.length) { console.log('\nNothing to pay out — no claims are queued.\n'); return; }

  const clean = rows.filter(r => PUBKEY_RE.test(r.pubkey));
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const batchId = 'batch_' + ts;
  mkdirSync(BATCH_DIR, { recursive: true });

  const total = clean.reduce((s, r) => s + Number(r.amount), 0);
  const csv = 'address,amount\n' + clean.map(r => `${r.btc},${r.amount}`).join('\n') + '\n';
  const txt = clean.map(r => `${r.btc} ${r.amount}`).join('\n') + '\n';
  const manifest = {
    batchId, createdAt: Date.now(), count: clean.length, totalAmount: total,
    pubkeys: clean.map(r => r.pubkey),
    rows: clean.map(r => ({ pubkey: r.pubkey, btc: r.btc, amount: Number(r.amount), tier: r.tier })),
  };

  const base = join(BATCH_DIR, batchId);
  writeFileSync(base + '.csv', csv);
  writeFileSync(base + '.txt', txt);
  writeFileSync(base + '.manifest.json', JSON.stringify(manifest, null, 2));

  // mark these rows 'sent' so the next export never re-includes them
  const inList = clean.map(r => `'${r.pubkey}'`).join(',');
  sql(`UPDATE claims SET status = 'sent' WHERE status = 'queued' AND pubkey IN (${inList})`);

  console.log(`\n✅ Batch ${batchId} — ${clean.length} payouts, ${money(total)} NAT total`);
  console.log(`   CSV : batches/${batchId}.csv   (address,amount)`);
  console.log(`   TXT : batches/${batchId}.txt   (address amount per line)`);
  console.log(`   These rows are now marked 'sent'.`);
  console.log(`\n   Next: paste one of those files into Tap Wallet's bulk/batch send, sign, broadcast.`);
  console.log(`   Then run:  node payout.mjs paid batches/${batchId}.manifest.json <txid>`);
  console.log(`   (double-check the token's decimals in Tap Wallet — amounts above are whole NAT units)\n`);
}

function cmdPaid(manifestPath, txid) {
  if (!manifestPath || !txid) { console.error('usage: node payout.mjs paid <manifest.json> <txid>'); process.exit(1); }
  if (!TXID_RE.test(txid)) { console.error('✘ that does not look like a 64-char Bitcoin txid.'); process.exit(1); }
  const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const inList = m.pubkeys.filter(p => PUBKEY_RE.test(p)).map(p => `'${p}'`).join(',');
  sql(`UPDATE claims SET status = 'paid', txid = '${txid}' WHERE status = 'sent' AND pubkey IN (${inList})`);
  console.log(`\n✅ Marked ${m.count} payouts as PAID (txid ${txid.slice(0, 12)}…).\n`);
}

function cmdRevert(manifestPath) {
  if (!manifestPath) { console.error('usage: node payout.mjs revert <manifest.json>'); process.exit(1); }
  const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const inList = m.pubkeys.filter(p => PUBKEY_RE.test(p)).map(p => `'${p}'`).join(',');
  sql(`UPDATE claims SET status = 'queued' WHERE status = 'sent' AND pubkey IN (${inList})`);
  console.log(`\n↩︎ Reverted ${m.count} payouts back to 'queued' (batch abandoned).\n`);
}

// --- dispatch ---------------------------------------------------------------
const [cmd, a, b] = process.argv.slice(2);
switch (cmd) {
  case 'status': cmdStatus(); break;
  case 'export': cmdExport(); break;
  case 'paid':   cmdPaid(a, b); break;
  case 'revert': cmdRevert(a); break;
  default:
    console.log('NAT DRIP payout tool — commands: status | export | paid <manifest> <txid> | revert <manifest>');
}
