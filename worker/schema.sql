-- NAT DRIP claim ledger (Cloudflare D1 / SQLite).
-- One row per successful claim. pubkey is UNIQUE => one claim per Solana wallet.

CREATE TABLE IF NOT EXISTS claims (
  pubkey     TEXT PRIMARY KEY,          -- Solana wallet that claimed (base58)
  btc        TEXT NOT NULL,             -- destination Bitcoin (TAP) address
  idx        INTEGER NOT NULL,          -- wallet-derived series index (1..SERIES_SIZE)
  tier       TEXT NOT NULL,             -- common | uncommon | rare | legendary
  amount     INTEGER NOT NULL,          -- DMT-NAT amount owed
  sig        TEXT NOT NULL,             -- base64 ed25519 signature proving wallet control
  status     TEXT NOT NULL DEFAULT 'queued',  -- queued | inscribing | paid
  txid       TEXT,                      -- BTC txid once the payout is inscribed
  ip         TEXT,                      -- claimant IP (abuse forensics only)
  created_at INTEGER NOT NULL           -- epoch ms
);

CREATE INDEX IF NOT EXISTS idx_claims_status  ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_created ON claims(created_at);
