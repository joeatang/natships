#!/usr/bin/env node
// -----------------------------------------------------------------------------
// pull-series0-headers.mjs
// Fetches the block headers for UNATOMS Series 0 (Bitcoin blocks 1..10,080)
// from blockstream.info's esplora API and writes a compact JSON snapshot.
//
// This is the offline-forever data the field-driven renderer reads from.
// Run once; commit `series0-headers.json` to the repo.
//
// Uses the /blocks/<height> bulk endpoint which returns 10 blocks per call,
// so total requests = 1,008. Rate-limited to be polite (~5 req/s).
//
// Usage:  node design/pull-series0-headers.mjs
// -----------------------------------------------------------------------------
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH  = join(__dirname, 'series0-headers.json');
// mempool.space is drop-in compatible with blockstream/esplora but with
// separate rate limits; we use it as primary to avoid the blockstream ban.
const API_BASE  = 'https://mempool.space/api';
const SERIES_SIZE = 10080;
const RATE_MS   = 400;   // ~2.5 req/s — very polite
const MAX_RETRY = 6;
const CHECKPOINT_EVERY = 100;  // write partial JSON every 100 batches (~1000 blocks)

// -----------------------------------------------------------------------------
async function fetchWithRetry(url, retriesLeft = MAX_RETRY) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'unatoms-header-puller/1.0' } });
    if (res.status === 429) {
      // rate-limited — long backoff (blockstream cooldown ~30-60s)
      throw Object.assign(new Error(`HTTP 429 on ${url}`), { rateLimited: true });
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
    return await res.json();
  } catch (err) {
    if (retriesLeft > 0) {
      // exponential backoff for 429; short for other errors
      const attempt = MAX_RETRY - retriesLeft + 1;
      const wait = err.rateLimited
        ? Math.min(60000, 15000 * Math.pow(1.5, attempt - 1))
        : attempt * 1000;
      process.stderr.write(`  retry (${retriesLeft} left) after ${(wait/1000).toFixed(0)}s: ${err.message}\n`);
      await new Promise(r => setTimeout(r, wait));
      return fetchWithRetry(url, retriesLeft - 1);
    }
    throw err;
  }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// keep only the fields we actually consume — smaller JSON, cleaner intent
function compact(b) {
  return {
    h:    b.height,
    hash: b.id,               // block_hash (field 0)
    mr:   b.merkle_root,      // merkleroot (field 7)
    t:    b.timestamp,        // time      (field 8)
    n:    b.nonce,            // nonce     (field 10)
    bits: b.bits,             // bits      (field 11) — dormant for S0 but keep for completeness
    prev: b.previousblockhash,// convenience for future series
  };
}

// -----------------------------------------------------------------------------
async function main() {
  // resume-friendly: load any existing snapshot first
  let byHeight = new Array(SERIES_SIZE + 1); // index 0 unused, 1..10080
  let resumedCount = 0;
  if (existsSync(OUT_PATH)) {
    const existing = JSON.parse(readFileSync(OUT_PATH, 'utf8'));
    for (const b of existing) {
      if (b.h >= 1 && b.h <= SERIES_SIZE) {
        byHeight[b.h] = b;
        resumedCount++;
      }
    }
    console.log(`  resumed: found ${resumedCount} existing headers`);
  }

  const START_TS = Date.now();
  let fetched = 0;
  let batchesSinceCheckpoint = 0;

  function checkpoint() {
    const dense = [];
    for (let h = 1; h <= SERIES_SIZE; h++) {
      if (byHeight[h]) dense.push(byHeight[h]);
    }
    writeFileSync(OUT_PATH, JSON.stringify(dense, null, 0));
  }

  // fetch in batches of 10; endpoint returns [height, height-1, ..., height-9]
  // so batch starts must be 10, 20, 30, ..., 10080
  for (let batchTop = 10; batchTop <= SERIES_SIZE; batchTop += 10) {
    // skip if all 10 in this batch already present
    let allPresent = true;
    for (let h = batchTop; h > batchTop - 10 && h >= 1; h--) {
      if (!byHeight[h]) { allPresent = false; break; }
    }
    if (allPresent) continue;

    const url = `${API_BASE}/blocks/${batchTop}`;
    const blocks = await fetchWithRetry(url);
    for (const b of blocks) {
      if (b.height >= 1 && b.height <= SERIES_SIZE) {
        byHeight[b.height] = compact(b);
        fetched++;
      }
    }
    batchesSinceCheckpoint++;

    // progress every 50 batches (~500 blocks)
    if (batchTop % 500 === 0 || batchTop === SERIES_SIZE) {
      const done = byHeight.filter(Boolean).length;
      const pct  = (done / SERIES_SIZE * 100).toFixed(1);
      const elapsed = ((Date.now() - START_TS) / 1000).toFixed(1);
      process.stdout.write(`  ${done.toString().padStart(5)} / ${SERIES_SIZE}  (${pct}%)  elapsed ${elapsed}s\n`);
    }

    // periodic checkpoint so a crash doesn't lose everything
    if (batchesSinceCheckpoint >= CHECKPOINT_EVERY) {
      checkpoint();
      batchesSinceCheckpoint = 0;
    }

    await sleep(RATE_MS);
  }

  // finalize: dense array, ordered 1..SERIES_SIZE
  const out = [];
  const missing = [];
  for (let h = 1; h <= SERIES_SIZE; h++) {
    if (byHeight[h]) out.push(byHeight[h]);
    else missing.push(h);
  }

  if (missing.length) {
    console.error(`\n  WARNING: ${missing.length} blocks missing — first few: ${missing.slice(0, 10).join(',')}`);
    process.exitCode = 2;
  }

  writeFileSync(OUT_PATH, JSON.stringify(out, null, 0));
  const bytes = Buffer.byteLength(readFileSync(OUT_PATH, 'utf8'));
  console.log(`\n  wrote ${out.length} headers → ${OUT_PATH}`);
  console.log(`  size: ${(bytes / 1024).toFixed(1)} KB (${(bytes / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`  new: ${fetched}, resumed: ${resumedCount}, total: ${out.length}`);
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
