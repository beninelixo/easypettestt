-- Atualizar constraint para incluir todos os planos válidos
ALTER TABLE pet_shops DROP CONSTRAINT IF EXISTS valid_subscription_plan;

ALTER TABLE pet_shops ADD CONSTRAINT valid_subscription_plan 
CHECK (subscription_plan = ANY (ARRAY[
  'gratuito', 
  'free',
  'profissional', 
  'enterprise',
  'pet_gold',
  'pet_gold_anual',
  'pet_platinum',
  'pet_platinum_anual',
  'platinum'
]));

-- Agora fazer o upgrade do plano
UPDATE pet_shops 
SET subscription_plan = 'pet_platinum_anual',
    updated_at = NOW()
WHERE owner_id IN (
  SELECT id FROM auth.users WHERE email = 'vitinjorgin@gmail.com'
);

-- Log da mudança de plano
INSERT INTO audit_logs (user_id, table_name, operation, record_id, new_data)
SELECT 
  u.id,
  'pet_shops',
  'PLAN_UPGRADE',
  p.id,
  jsonb_build_object(
    'action', 'plan_upgrade',
    'old_plan', 'gratuito',
    'new_plan', 'pet_platinum_anual',
    'upgraded_by', 'admin_action',
    'upgraded_at', NOW()
  )
FROM auth.users u
JOIN pet_shops p ON p.owner_id = u.id
WHERE u.email = 'vitinjorgin@gmail.com';

-- Limpar códigos de reset expirados ou usados
DELETE FROM password_resets WHERE expires_at < NOW() OR used = true;