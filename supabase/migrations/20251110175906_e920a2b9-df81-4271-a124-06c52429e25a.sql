-- =====================================================
-- MIGRATION 1: Remover tabela user_behavior_patterns
-- =====================================================
-- Esta tabela estava causando erro de constraint UNIQUE
-- e não está sendo utilizada (sistema incompleto)

DROP TABLE IF EXISTS user_behavior_patterns CASCADE;

-- Verificar se foi removida
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_behavior_patterns') THEN
    RAISE NOTICE '✅ Tabela user_behavior_patterns removida com sucesso';
  END IF;
END $$;