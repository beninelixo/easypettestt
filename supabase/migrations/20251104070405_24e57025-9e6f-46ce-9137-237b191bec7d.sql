-- Add subscription columns to pet_shops table
ALTER TABLE pet_shops 
ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'gratuito',
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS cakto_subscription_id text,
ADD COLUMN IF NOT EXISTS cakto_customer_id text;

-- Add check constraint for valid subscription plans
ALTER TABLE pet_shops 
ADD CONSTRAINT valid_subscription_plan 
CHECK (subscription_plan IN ('gratuito', 'profissional', 'enterprise'));

-- Create index for faster queries on subscription status
CREATE INDEX IF NOT EXISTS idx_pet_shops_subscription 
ON pet_shops(subscription_plan, subscription_expires_at);

-- Add comment for documentation
COMMENT ON COLUMN pet_shops.subscription_plan IS 'Current subscription plan: gratuito, profissional, or enterprise';
COMMENT ON COLUMN pet_shops.subscription_expires_at IS 'Date when the current subscription expires';
COMMENT ON COLUMN pet_shops.cakto_subscription_id IS 'Cakto subscription ID for payment tracking';
COMMENT ON COLUMN pet_shops.cakto_customer_id IS 'Cakto customer ID for this pet shop';