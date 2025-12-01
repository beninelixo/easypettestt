-- Adicionar role super_admin para God User (beninelixo@gmail.com)
INSERT INTO user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users 
WHERE email = 'beninelixo@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Adicionar role pet_shop para God User poder acessar dashboard profissional
INSERT INTO user_roles (user_id, role)
SELECT id, 'pet_shop'::app_role
FROM auth.users 
WHERE email = 'beninelixo@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Criar pet_shop para o God User se não existir (usando subscription_plan válido: enterprise)
INSERT INTO pet_shops (owner_id, name, email, code, subscription_plan)
SELECT id, 'God Mode Admin', 'beninelixo@gmail.com', 'GOD-0001', 'enterprise'
FROM auth.users 
WHERE email = 'beninelixo@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM pet_shops WHERE owner_id = (
    SELECT id FROM auth.users WHERE email = 'beninelixo@gmail.com'
  )
);

-- Garantir que todos os usuários profissionais (pet_shop owners) tenham a role pet_shop
INSERT INTO user_roles (user_id, role)
SELECT ps.owner_id, 'pet_shop'::app_role
FROM pet_shops ps
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles ur 
  WHERE ur.user_id = ps.owner_id AND ur.role = 'pet_shop'
)
ON CONFLICT (user_id, role) DO NOTHING;