// ============================================================================
// NAT DRIP claim worker (Cloudflare)
//
// Responsibilities (and NOTHING more):
//   1. /status  — is the claim window open? (drives the frontend banner)
//   2. /verify  — prove a Solana wallet controls itself (ed25519 signature) AND
//                 holds enough TakeDMT; return the wallet's drip amount.
//   3. /claim   — re-verify everything server-side, recompute the amount from the
//                 wallet (never trust the client), enforce one-claim-per-wallet
//                 and the hard pool ceiling, then record the claim to D1.
//
// This worker does NOT hold the DMT-NAT (Bitcoin TAP) treasury key. A separate
// offline signer reads the D1 ledger and inscribes the TAP payouts. If this
// worker is ever compromised, no tokens can move — only ledger rows.
//
// The drip amount MUST match the browser exactly. We use a frozen parity table
// (TIER_MAP, generated from the live game engine) + the identical cyrb128 hash.
// ============================================================================

import { TIER_MAP } from './tiermap.js';

const TIER_AMOUNT = { common: 5000000, uncommon: 15000000, rare: 50000000, legendary: 200000000 };
const TIER_NAME   = { c: 'common', u: 'uncommon', r: 'rare', l: 'legendary' };
const SIG_MAX_AGE_MS = 10 * 60 * 1000;   // signed message must be < 10 min old
const RL_MAX = 40;                        // requests per IP per minute

// ---------------------------------------------------------------------------
// Parity hash — byte-for-byte identical to unatom-render.js::cyrb128.
// ---------------------------------------------------------------------------
function cyrb128(str) {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}

// Wallet -> series index -> tier -> amount. Mirrors index.html::walletDripIndex.
function walletDrip(pubkey, seriesSize) {
  const [a] = cyrb128('UNATOM/DRIP/WALLET/v1/' + pubkey);
  const idx = 1 + ((a >>> 0) % seriesSize);          // 1..seriesSize
  const letter = TIER_MAP[idx - 1] || 'c';           // frozen parity table
  const tier = TIER_NAME[letter] || 'common';
  return { idx, tier, amount: TIER_AMOUNT[tier] };
}

// ---------------------------------------------------------------------------
// Encoding helpers.
// ---------------------------------------------------------------------------
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function bs58decode(s) {
  const map = {}; for (let i = 0; i < B58.length; i++) map[B58[i]] = i;
  let bytes = [0];
  for (const ch of s) {
    const val = map[ch];
    if (val === undefined) throw new Error('bad base58');
    let carry = val;
    for (let j = 0; j < bytes.length; j++) { carry += bytes[j] * 58; bytes[j] = carry & 0xff; carry >>= 8; }
    while (carry) { bytes.push(carry & 0xff); carry >>= 8; }
  }
  for (let k = 0; k < s.length && s[k] === '1'; k++) bytes.push(0);
  return new Uint8Array(bytes.reverse());
}
function b64decode(s) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ---------------------------------------------------------------------------
// Bitcoin address format validation (mirror of index.html::validBtcAddress).
// ---------------------------------------------------------------------------
function validBtcAddress(a) {
  if (!a) return false;
  a = a.trim();
  if (/^bc1[a-z0-9]{25,87}$/i.test(a)) return true;
  if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(a)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Ed25519 signature check. `message` must embed the same pubkey + a fresh ts.
// Fails closed on any error.
// ---------------------------------------------------------------------------
async function verifySignature(pubkey, message, signatureB64) {
  try {
    if (!pubkey || !message || !signatureB64) return false;
    // bind: the signed text must reference THIS wallet and a recent timestamp
    const mWallet = /wallet:\s*([1-9A-HJ-NP-Za-km-z]{32,44})/.exec(message);
    const mTs = /ts:\s*(\d{10,16})/.exec(message);
    if (!mWallet || mWallet[1] !== pubkey) return false;
    if (!mTs) return false;
    const age = Date.now() - Number(mTs[1]);
    if (!(age >= -60000 && age <= SIG_MAX_AGE_MS)) return false;   // ~1 min clock skew tolerated
    const pub = bs58decode(pubkey);
    if (pub.length !== 32) return false;
    const sig = b64decode(signatureB64);
    if (sig.length !== 64) return false;
    const key = await crypto.subtle.importKey('raw', pub, { name: 'Ed25519' }, false, ['verify']);
    return await crypto.subtle.verify({ name: 'Ed25519' }, key, sig, new TextEncoder().encode(message));
  } catch (e) {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Holdings check via Solana RPC. Sums the wallet's balance of MINT.
// Returns { balance (UI units), ok } or throws on RPC failure.
// ---------------------------------------------------------------------------
async function tokenBalance(rpc, owner, mint) {
  const body = {
    jsonrpc: '2.0', id: 1, method: 'getTokenAccountsByOwner',
    params: [owner, { mint }, { encoding: 'jsonParsed' }],
  };
  const r = await fetch(rpc, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error('rpc ' + r.status);
  const j = await r.json();
  if (j.error) throw new Error('rpc error');
  let bal = 0;
  for (const acc of (j.result && j.result.value) || []) {
    const amt = acc.account?.data?.parsed?.info?.tokenAmount;
    if (amt) bal += Number(amt.uiAmount || 0);
  }
  return bal;
}

// ---------------------------------------------------------------------------
// HTTP helpers.
// ---------------------------------------------------------------------------
function cors(env) {
  return {
    'access-control-allow-origin': env.ALLOW_ORIGIN || '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
  };
}
function json(data, env, code = 200) {
  return new Response(JSON.stringify(data), { status: code, headers: { 'content-type': 'application/json', ...cors(env) } });
}

function windowOpen(env, now = Date.now()) {
  if ((env.ACTIVE || 'false') !== 'true') return false;
  const s = env.WINDOW_STARTS_AT ? Date.parse(env.WINDOW_STARTS_AT) : NaN;
  const e = env.WINDOW_ENDS_AT ? Date.parse(env.WINDOW_ENDS_AT) : NaN;
  if (!isNaN(s) && now < s) return false;
  if (!isNaN(e) && now > e) return false;
  return true;
}

async function rateLimited(env, ip) {
  if (!env.RL || !ip) return false;
  const key = 'rl:' + ip + ':' + Math.floor(Date.now() / 60000);
  const cur = Number((await env.RL.get(key)) || 0);
  if (cur >= RL_MAX) return true;
  await env.RL.put(key, String(cur + 1), { expirationTtl: 120 });
  return false;
}

// ---------------------------------------------------------------------------
// Bitcoin block-height launch gate. The drip "drops" at a chosen BTC height
// (LAUNCH_BLOCK). We read the current tip from mempool.space and cache it in
// KV for 30s so we don't hammer the API. If LAUNCH_BLOCK is unset, there is no
// height gate. Fails CLOSED (not launched) if the chain can't be read.
// ---------------------------------------------------------------------------
async function tipHeight(env) {
  try {
    if (env.RL) {
      const cached = await env.RL.get('btc:tip');
      if (cached) return Number(cached);
    }
    // Try multiple sources — mempool.space sometimes rejects edge requests, so
    // fall back to blockstream.info. Send a UA so we aren't filtered as a bot.
    const urls = [
      'https://mempool.space/api/blocks/tip/height',
      'https://blockstream.info/api/blocks/tip/height',
    ];
    for (const u of urls) {
      try {
        const r = await fetch(u, { headers: { 'User-Agent': 'natdrip-worker/1.0', 'Accept': 'text/plain' } });
        if (!r.ok) continue;
        const h = Number((await r.text()).trim());
        if (!Number.isFinite(h)) continue;
        if (env.RL) await env.RL.put('btc:tip', String(h), { expirationTtl: 60 });
        return h;
      } catch (e) { /* try next source */ }
    }
    return null;
  } catch (e) { return null; }
}

async function launchReached(env) {
  const lb = Number(env.LAUNCH_BLOCK || 0);
  if (!lb) return true;             // no height gate configured
  const h = await tipHeight(env);
  if (h == null) return false;      // fail closed if the chain is unreadable
  return h >= lb;
}

// ---------------------------------------------------------------------------
// Router.
// ---------------------------------------------------------------------------
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '');
    const ip = request.headers.get('cf-connecting-ip') || '';

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(env) });

    // ---- /status ----
    // Run-until-depleted: there is no fixed end time. The drip is 'live' while
    // the window is open AND the pool still has room; it flips to 'ended' the
    // moment the pool is fully distributed (or a WINDOW_ENDS_AT, if ever set,
    // has passed). `distributed` powers the frontend flex banner. Test rows
    // (operator previews) never count toward the total.
    if (path.endsWith('/status') && request.method === 'GET') {
      const pool = Number(env.POOL || 0);
      const active = windowOpen(env);
      let distributed = 0;
      let recentClaims = 0;
      if (env.DB) {
        try {
          const row = await env.DB.prepare("SELECT COALESCE(SUM(amount),0) AS s FROM claims WHERE status != 'test'").first();
          distributed = Number(row?.s || 0);
        } catch (e) { /* treat as 0 */ }
        try {
          // recent activity in the last 60 minutes (excludes test rows)
          const cutoffMs = Date.now() - 3600 * 1000;
          const rc = await env.DB.prepare("SELECT COUNT(*) AS n FROM claims WHERE status != 'test' AND created_at >= ?").bind(cutoffMs).first();
          recentClaims = Number(rc?.n || 0);
        } catch (e) { /* treat as 0 */ }
      }
      const depleted = pool > 0 && distributed >= pool;
      const timeEnded = !!env.WINDOW_ENDS_AT && Date.now() > Date.parse(env.WINDOW_ENDS_AT);
      // Bitcoin block-height countdown: if a LAUNCH_BLOCK is set and the chain
      // hasn't reached it yet, we're in 'countdown' (not live yet).
      const launchBlock = Number(env.LAUNCH_BLOCK || 0);
      let tip = null, blocksLeft = null;
      if (launchBlock) {
        tip = await tipHeight(env);
        if (tip != null) blocksLeft = Math.max(0, launchBlock - tip);
      }
      const reached = !launchBlock || (tip != null && tip >= launchBlock);
      const phase = depleted ? 'ended'
        : (active && reached) ? 'live'
        : (active && launchBlock && !reached) ? 'countdown'
        : (timeEnded ? 'ended' : 'pre');

      // Heatmap-friendly percent + level word (used by the pulse ribbon —
      // never exposes raw amounts to the client because the client can
      // choose to consume ONLY these two fields).
      const percentRemaining = pool > 0 ? Math.max(0, Math.min(1, 1 - (distributed / pool))) : 1;
      const level = percentRemaining >= 0.75 ? 'flowing full'
        : percentRemaining >= 0.50 ? 'flowing warm'
        : percentRemaining >= 0.25 ? 'warming up'
        : percentRemaining >= 0.10 ? 'getting hot'
        : 'running dry';

      return json({
        active: active && reached && !depleted,
        phase,
        distributed,
        launchBlock: launchBlock || null,
        tipHeight: tip,
        blocksLeft,
        window: { startsAt: env.WINDOW_STARTS_AT || null, endsAt: env.WINDOW_ENDS_AT || null },
        pool,
        // heatmap fields — safe to consume without leaking amounts
        percentRemaining,
        level,
        recentClaims,
        symbol: env.SYMBOL || 'NAT',
        tap: env.TAP_TICKER || 'DMT-NAT',
      }, env);
    }

    if (request.method !== 'POST') return json({ error: 'not found' }, env, 404);
    if (await rateLimited(env, ip)) return json({ error: 'slow down' }, env, 429);

    let payload;
    try { payload = await request.json(); } catch (e) { return json({ error: 'bad json' }, env, 400); }
    const { pubkey, message, signature } = payload || {};
    const seriesSize = Number(env.SERIES_SIZE || 10080);
    const minHold = Number(env.MIN_HOLD || 0);
    const blockTokens = Number(env.BLOCK_TOKENS || 167.619733);   // 1 nat.fun block, in TakeDMT (UI units)
    // preview/test mode: an operator-only key (set as a Worker secret) that lets
    // us exercise the full connect->sign->verify->claim flow against the real
    // worker BEFORE public launch. A matching key bypasses the ACTIVE gate and
    // marks the resulting claim status='test' so it never gets paid out and
    // never consumes the pool. Empty/unset PREVIEW_KEY => always false (safe).
    const preview = !!env.PREVIEW_KEY && !!payload && payload.preview === env.PREVIEW_KEY;

    // ---- /verify ----
    if (path.endsWith('/verify')) {
      if ((!windowOpen(env) || !(await launchReached(env))) && !preview) return json({ notLive: true }, env);
      if (!(await verifySignature(pubkey, message, signature))) return json({ error: 'bad signature' }, env, 401);
      let balance;
      try { balance = await tokenBalance(env.SOLANA_RPC, pubkey, env.MINT); }
      catch (e) { return json({ error: 'could not check holdings — try again' }, env, 502); }
      const eligible = minHold > 0 ? balance >= minHold : balance > 0;
      const drip = walletDrip(pubkey, seriesSize);
      return json({ eligible, balance, minHold, blockCount: Math.floor(balance / blockTokens), drip: eligible ? drip : null }, env);
    }

    // ---- /claim ----
    if (path.endsWith('/claim')) {
      if ((!windowOpen(env) || !(await launchReached(env))) && !preview) return json({ notLive: true }, env);
      if (!(await verifySignature(pubkey, message, signature))) return json({ ok: false, error: 'bad signature' }, env, 401);

      const btc = String((payload.btc || '')).trim();
      if (!validBtcAddress(btc)) return json({ ok: false, error: 'invalid Bitcoin address' }, env, 400);

      // holdings must still be good at claim time
      let balance;
      try { balance = await tokenBalance(env.SOLANA_RPC, pubkey, env.MINT); }
      catch (e) { return json({ ok: false, error: 'could not check holdings — try again' }, env, 502); }
      const eligible = minHold > 0 ? balance >= minHold : balance > 0;
      if (!eligible) return json({ ok: false, error: 'wallet no longer holds enough ' + (env.SYMBOL || 'NAT') }, env, 403);

      // amount is recomputed here — the client's number is never trusted
      const drip = walletDrip(pubkey, seriesSize);

      if (!env.DB) return json({ notLive: true }, env);

      // ---- TEST path (operator preview) ----
      // Records status='test': proves the whole mechanic end-to-end but is
      // invisible to the payout exporter, the pool ceiling and the distributed
      // total. Idempotent — clears any prior test row for this wallet first so
      // it can be re-run freely, and never blocks a future real claim.
      if (preview) {
        await env.DB.prepare("DELETE FROM claims WHERE pubkey = ? AND status = 'test'").bind(pubkey).run();
        try {
          await env.DB.prepare(
            'INSERT INTO claims (pubkey, btc, idx, tier, amount, sig, status, ip, created_at) VALUES (?,?,?,?,?,?,?,?,?)'
          ).bind(pubkey, btc, drip.idx, drip.tier, drip.amount, signature, 'test', ip, Date.now()).run();
        } catch (e) {
          return json({ ok: false, error: 'this wallet already has a real claim', already: true }, env, 409);
        }
        return json({ ok: true, queued: true, test: true, amount: drip.amount, tier: drip.tier }, env);
      }

      // one claim per wallet (test rows don't count)
      const existing = await env.DB.prepare("SELECT amount, tier, btc FROM claims WHERE pubkey = ? AND status != 'test'").bind(pubkey).first();
      if (existing) return json({ ok: false, error: 'already claimed', already: true, amount: existing.amount, tier: existing.tier }, env, 409);

      // hard pool ceiling — never commit more than POOL in total (test rows excluded)
      const pool = Number(env.POOL || 0);
      const spentRow = await env.DB.prepare("SELECT COALESCE(SUM(amount),0) AS s FROM claims WHERE status != 'test'").first();
      const spent = Number(spentRow?.s || 0);
      if (spent + drip.amount > pool) return json({ ok: false, error: 'the drip pool is fully claimed', exhausted: true }, env, 409);

      // clear any leftover operator test row so the real INSERT can't collide on PK
      await env.DB.prepare("DELETE FROM claims WHERE pubkey = ? AND status = 'test'").bind(pubkey).run();

      try {
        await env.DB.prepare(
          'INSERT INTO claims (pubkey, btc, idx, tier, amount, sig, status, ip, created_at) VALUES (?,?,?,?,?,?,?,?,?)'
        ).bind(pubkey, btc, drip.idx, drip.tier, drip.amount, signature, 'queued', ip, Date.now()).run();
      } catch (e) {
        // UNIQUE race -> treat as already claimed
        return json({ ok: false, error: 'already claimed', already: true }, env, 409);
      }

      return json({ ok: true, queued: true, amount: drip.amount, tier: drip.tier }, env);
    }

    return json({ error: 'not found' }, env, 404);
  },
};
