-- NAT DRIP — live monitoring / sybil-watch queries for the D1 `claims` ledger.
--
-- Run the whole file (returns a result set per query):
--   npx wrangler d1 execute natdrip --remote --file=./monitor.sql
-- Or run one at a time by pasting a single statement:
--   npx wrangler d1 execute natdrip --remote --command "SELECT ..."
--
-- What "healthy traffic" looks like: many DISTINCT wallets, DISTINCT payout
-- (btc) addresses, DISTINCT IPs, claims spread over time. What a SYBIL FARM
-- looks like: many wallets funneling to a few btc addresses, clustered IPs,
-- bursts of claims in the same minute, verify spikes without matching claims.

-- 1) POOL STATUS — how much of the 5B ceiling is committed.
SELECT
  COUNT(*)                AS claims,
  COALESCE(SUM(amount),0) AS committed,
  5000000000              AS pool,
  ROUND(100.0 * COALESCE(SUM(amount),0) / 5000000000, 2) AS pct_used,
  MIN(created_at)         AS first_claim,
  MAX(created_at)         AS last_claim
FROM claims;

-- 2) TIER BREAKDOWN — should track ~69/22/8/1 (common/uncommon/rare/legendary).
SELECT tier, COUNT(*) AS n, SUM(amount) AS total
FROM claims GROUP BY tier ORDER BY total DESC;

-- 3) IP CLUSTERING (sybil signal) — one IP behind many claims.
SELECT ip, COUNT(*) AS claims_from_ip
FROM claims
GROUP BY ip
HAVING claims_from_ip > 1
ORDER BY claims_from_ip DESC
LIMIT 50;

-- 4) SHARED PAYOUT ADDRESS (strong sybil signal) — many wallets → one btc addr.
SELECT btc, COUNT(*) AS wallets_paying_here
FROM claims
GROUP BY btc
HAVING wallets_paying_here > 1
ORDER BY wallets_paying_here DESC
LIMIT 50;

-- 5) BURST DETECTION — claims per minute; a human crowd trickles, a farm spikes.
SELECT strftime('%Y-%m-%d %H:%M', created_at) AS minute, COUNT(*) AS claims
FROM claims
GROUP BY minute
ORDER BY claims DESC
LIMIT 30;

-- 6) RECENT FEED — last 40 claims for a live eyeball.
SELECT created_at, tier, amount, substr(pubkey,1,6) || '…' AS wallet,
       substr(btc,1,8) || '…' AS payout, ip, status
FROM claims
ORDER BY created_at DESC
LIMIT 40;
