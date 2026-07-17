ALTER TABLE payments ADD COLUMN IF NOT EXISTS soroban_contract_id VARCHAR(64);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS soroban_network VARCHAR(120);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS soroban_action VARCHAR(20);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS prepared_transaction_xdr TEXT;

CREATE INDEX IF NOT EXISTS payments_soroban_transaction_hash_idx ON payments(stellar_transaction_hash);
CREATE INDEX IF NOT EXISTS payments_contract_created_idx ON payments(contract_id, created_at DESC);
