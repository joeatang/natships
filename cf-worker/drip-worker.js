/**
 * THE DRIP — Cloudflare Worker
 * Validates claims, records in KV, queues token transfers.
 *
 * Environment variables (set via: wrangler secret put VARIABLE_NAME)
 *   X_BEARER_TOKEN       — X API v2 bearer token (for tweet verification)
 *   CAMPAIGN_START_ISO   — ISO date the drip went live e.g. "2026-07-02T00:00:00Z"
 *   FAUCET_WALLET        — public address of your faucet wallet (for logging only)
 *
 * KV Namespaces (wrangler.toml → kv_namespaces):
 *   CLAIMS   — dedup store: "wallet:<addr>" and "handle:<xhandle>" → claim JSON
 *   COUNTER  — simple store: "remaining" (number), "active" ("true"/"false")
 *
 * CORS: open (*) — the page is served from a different origin (GitHub Pages).
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Base drip amounts (must match drip/index.html constants)
const BASE_DRIP  = 50_000;
const GEM_DRIP   = 150_000;
const TRADE_MULT = 5;

// Anti-gaming thresholds
const MIN_ACCOUNT_AGE_DAYS = 30;
const MIN_FOLLOWERS        = 5;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);

    if (url.pathname === '/api/drip/status') {
      return handleStatus(env);
    }
    if (url.pathname === '/api/claim' && request.method === 'POST') {
      return handleClaim(request, env);
    }

    return new Response('NOT FOUND', { status: 404 });
  },
};

// ============================================================================
// GET /api/drip/status
// ============================================================================

async function handleStatus(env) {
  const remaining = parseInt((await env.COUNTER.get('remaining')) ?? '1000000000', 10);
  const active    = (await env.COUNTER.get('active')) !== 'false';
  return json({ remaining, active });
}

// ============================================================================
// POST /api/claim
// ============================================================================

async function handleClaim(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return err('invalid request body', 400); }

  const { tweetUrl, wallet, block, natTxHash } = body ?? {};

  // ── 1. Basic input validation ───────────────────────────────────────────
  if (!tweetUrl || !wallet || !block) {
    return err('missing required fields: tweetUrl, wallet, block', 400);
  }
  if (!/^https?:\/\/(x\.com|twitter\.com)\/[^/]+\/status\/(\d+)/.test(tweetUrl)) {
    return err('tweetUrl must be a valid x.com/twitter.com status URL', 400);
  }
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
    return err('wallet must be a valid Solana base58 address', 400);
  }
  const blockNum = parseInt(block, 10);
  if (isNaN(blockNum) || blockNum < 1 || blockNum > 10080) {
    return err('block must be between 1 and 10080', 400);
  }

  // ── 2. Campaign active check ─────────────────────────────────────────────
  const active = (await env.COUNTER.get('active')) !== 'false';
  if (!active) {
    return err('THE DRIP HAS ENDED — TAKEDMT has graduated. thank you for participating.', 403);
  }

  // ── 3. Supply check ──────────────────────────────────────────────────────
  const remaining = parseInt((await env.COUNTER.get('remaining')) ?? '0', 10);
  if (remaining <= 0) {
    return err('supply exhausted — every last drop has been synthesized.', 403);
  }

  // ── 4. Duplicate wallet check (fast path before hitting X API) ───────────
  const existingWallet = await env.CLAIMS.get('wallet:' + wallet);
  if (existingWallet) {
    return err('this wallet has already claimed a drip.', 409);
  }

  // ── 5. Tweet verification via X API ─────────────────────────────────────
  const tweetId = tweetUrl.match(/\/status\/(\d+)/)?.[1];
  if (!tweetId) return err('cannot extract tweet ID from URL', 400);

  const tweetCheck = await verifyTweet(tweetId, env);
  if (!tweetCheck.ok) return err(tweetCheck.reason, 403);

  const xHandle = tweetCheck.handle;

  // ── 6. Duplicate X handle check ──────────────────────────────────────────
  const existingHandle = await env.CLAIMS.get('handle:' + xHandle.toLowerCase());
  if (existingHandle) {
    return err('this X account has already claimed a drip.', 409);
  }

  // ── 7. Determine drip amount ─────────────────────────────────────────────
  // Gem detection: re-derive from block using same PRNG seed logic.
  // We use a lightweight check: run the same sfc32 sequence as the renderer.
  const hasGem    = deriveHasGem(blockNum);
  const baseAmount = hasGem ? GEM_DRIP : BASE_DRIP;

  // Trade multiplier: validate natTxHash is a plausible Solana tx signature
  const tradeVerified = natTxHash && /^[1-9A-HJ-NP-Za-km-z]{86,88}$/.test(natTxHash);
  const finalAmount    = baseAmount * (tradeVerified ? TRADE_MULT : 1);

  if (finalAmount > remaining) {
    return err('insufficient supply remaining. try again with a standard claim.', 403);
  }

  // ── 8. Record claim in KV (atomic intent — transfer is async) ────────────
  const claimRecord = JSON.stringify({
    wallet,
    handle:        xHandle,
    amount:        finalAmount,
    block:         blockNum,
    tweetId,
    tweetUrl,
    hasGem,
    tradeVerified,
    natTxHash:     natTxHash || null,
    claimedAt:     new Date().toISOString(),
    transferred:   false,  // set to true once tokens sent
  });

  await Promise.all([
    env.CLAIMS.put('wallet:' + wallet,           claimRecord),
    env.CLAIMS.put('handle:' + xHandle.toLowerCase(), claimRecord),
    env.CLAIMS.put('pending:' + Date.now() + ':' + wallet, claimRecord, { expirationTtl: 86400 * 7 }),
    env.COUNTER.put('remaining', String(remaining - finalAmount)),
  ]);

  // ── 9. Respond — tokens queued (transfer executed by process-claims.mjs) ─
  return json({
    ok:      true,
    amount:  finalAmount,
    hasGem,
    tradeVerified,
    handle:  xHandle,
    message: 'synthesized. tokens arriving within 10 minutes.',
    txSig:   null,  // filled in after process-claims.mjs runs
  });
}

// ============================================================================
// TWEET VERIFICATION
// ============================================================================

async function verifyTweet(tweetId, env) {
  const token = env.X_BEARER_TOKEN;

  // Dev mode: no bearer token configured → skip verification
  if (!token || token === 'PLACEHOLDER') {
    console.warn('X_BEARER_TOKEN not set — skipping tweet verification (dev mode)');
    return { ok: true, handle: 'dev_mode' };
  }

  let data;
  try {
    const resp = await fetch(
      `https://api.twitter.com/2/tweets/${tweetId}` +
      `?expansions=author_id` +
      `&user.fields=created_at,public_metrics,username` +
      `&tweet.fields=created_at,text,attachments`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (resp.status === 404) return { ok: false, reason: 'tweet not found — make sure your post is public' };
    if (!resp.ok)            return { ok: false, reason: 'could not verify tweet (X API error ' + resp.status + ')' };
    data = await resp.json();
  } catch (e) {
    return { ok: false, reason: 'tweet verification network error: ' + e.message };
  }

  const tweet  = data?.data;
  const author = data?.includes?.users?.[0];
  if (!tweet || !author) return { ok: false, reason: 'tweet data incomplete' };

  // ── Account age: ≥ 30 days ───────────────────────────────────────────────
  const ageMs   = Date.now() - new Date(author.created_at).getTime();
  const ageDays = ageMs / 86_400_000;
  if (ageDays < MIN_ACCOUNT_AGE_DAYS) {
    return { ok: false, reason: `X account must be at least ${MIN_ACCOUNT_AGE_DAYS} days old (yours is ${Math.floor(ageDays)} days)` };
  }

  // ── Follower count: ≥ 5 ─────────────────────────────────────────────────
  const followers = author.public_metrics?.followers_count ?? 0;
  if (followers < MIN_FOLLOWERS) {
    return { ok: false, reason: `X account must have at least ${MIN_FOLLOWERS} followers` };
  }

  // ── Tweet timestamp: after campaign start ────────────────────────────────
  const campaignStart = new Date(env.CAMPAIGN_START_ISO ?? '2026-07-02T00:00:00Z');
  if (new Date(tweet.created_at) < campaignStart) {
    return { ok: false, reason: 'tweet must be posted after the drip campaign started' };
  }

  // ── Required content: #TAKEDMT and UNATOM ───────────────────────────────
  const text = (tweet.text || '').toLowerCase();
  if (!text.includes('#takedmt')) {
    return { ok: false, reason: 'tweet must include #TAKEDMT' };
  }
  if (!text.includes('unatom')) {
    return { ok: false, reason: 'tweet must mention UNATOM' };
  }

  // ── Must include an image ─────────────────────────────────────────────────
  if (!tweet.attachments?.media_keys?.length) {
    return { ok: false, reason: 'tweet must include the poster image' };
  }

  return { ok: true, handle: author.username };
}

// ============================================================================
// GEM DETECTION  (mirrors renderer's sfc32 PRNG)
// ============================================================================

function sfc32(a, b, c, d) {
  return function() {
    a |= 0; b |= 0; c |= 0; d |= 0;
    const t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}

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

// Exact swag pool from renderer (order + repeats matter for rng index):
const SWAG_POOL = [
  'none','none','none','none','none','none','none','none',
  'diamondStud','patchBorder','stitchMark','cornerChip','burnMark','haloNode','sealStamp',
  'ordinalTag','difficultyBadge','hashScratch','tinyBandage','pixelScar','crownDot',
  'sideRivet','dmtGem','orbitDot','voidPatch','minerMark','littleX','microChain',
];

function deriveHasGem(blockHeight) {
  // Mirror the exact rng draw sequence from unatomFromBlock() in unatom-render.js
  const seed = cyrb128('UNATOM/SERIES0/' + blockHeight);
  const rng  = sfc32(seed[0], seed[1], seed[2], seed[3]);

  // Draw order (each pick() consumes exactly 1 rng() call):
  rng(); // 1.  category r
  rng(); // 2.  sym
  rng(); // 3.  scheme
  rng(); // 4.  border
  rng(); // 5.  thirdEye
  rng(); // 6.  mood
  rng(); // 7.  mouthKind
  rng(); // 8.  drip
  rng(); // 9.  glasses
  rng(); // 10. brows
  rng(); // 11. nature
  // 12. swag — the gem draw
  const swagKind = SWAG_POOL[Math.floor(rng() * SWAG_POOL.length)];
  return swagKind === 'dmtGem';
}

// ============================================================================
// HELPERS
// ============================================================================

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

function err(message, status = 400) {
  return json({ ok: false, error: message }, status);
}
