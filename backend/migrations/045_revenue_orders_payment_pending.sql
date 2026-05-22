CREATE TABLE IF NOT EXISTS revenue_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  checkout_id TEXT NOT NULL,
  plan TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'RUB',
  status TEXT NOT NULL CHECK (status IN ('payment_pending','paid','cancelled','failed')),
  credits INTEGER NOT NULL DEFAULT 0,
  provider TEXT NOT NULL DEFAULT 'internal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_revenue_orders_workspace_checkout_pending
  ON revenue_orders(workspace_id, checkout_id)
  WHERE status = 'payment_pending';

CREATE INDEX IF NOT EXISTS idx_revenue_orders_workspace_created_at
  ON revenue_orders(workspace_id, created_at DESC);
