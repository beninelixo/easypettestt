-- Garantir que beninelixo@gmail.com tem TODAS as roles e permissões
DO $$
DECLARE
  god_user_id uuid;
BEGIN
  -- Buscar ID do God User
  SELECT id INTO god_user_id FROM auth.users WHERE email = 'beninelixo@gmail.com';
  
  IF god_user_id IS NOT NULL THEN
    -- Inserir role super_admin se não existir
    INSERT INTO public.user_roles (user_id, role)
    VALUES (god_user_id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Inserir role admin se não existir
    INSERT INTO public.user_roles (user_id, role)
    VALUES (god_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Inserir role pet_shop se não existir
    INSERT INTO public.user_roles (user_id, role)
    VALUES (god_user_id, 'pet_shop')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Inserir role client se não existir
    INSERT INTO public.user_roles (user_id, role)
    VALUES (god_user_id, 'client')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Garantir que tem um pet_shop associado para acesso completo
    INSERT INTO public.pet_shops (owner_id, name, code, subscription_plan)
    SELECT god_user_id, 'God Mode Admin', 'GOD-ADMIN-001', 'enterprise'
    WHERE NOT EXISTS (SELECT 1 FROM public.pet_shops WHERE owner_id = god_user_id);
    
    RAISE NOTICE 'God User beninelixo@gmail.com configurado com todas as permissões!';
  ELSE
    RAISE NOTICE 'Usuário beninelixo@gmail.com não encontrado';
  END IF;
END $$;