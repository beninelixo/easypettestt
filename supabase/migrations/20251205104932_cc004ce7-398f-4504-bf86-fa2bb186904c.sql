-- Add missing features for plans consistency
INSERT INTO plan_features (plan_name, feature_key, feature_value, description) VALUES
-- Gold features
('pet_gold', 'email_reminders', 'true', 'Lembretes por email'),
('pet_gold', 'photo_history', 'true', 'Histórico com fotos'),
('pet_gold', 'two_factor_auth', 'true', 'Autenticação 2FA'),
('pet_gold', 'customer_segmentation', 'true', 'Segmentação de clientes'),
('pet_gold_anual', 'email_reminders', 'true', 'Lembretes por email'),
('pet_gold_anual', 'photo_history', 'true', 'Histórico com fotos'),
('pet_gold_anual', 'two_factor_auth', 'true', 'Autenticação 2FA'),
('pet_gold_anual', 'customer_segmentation', 'true', 'Segmentação de clientes'),

-- Platinum features
('pet_platinum', 'programa_fidelidade', 'true', 'Programa de fidelidade'),
('pet_platinum', 'multi_unit', 'true', 'Multi-unidades e franquias'),
('pet_platinum', 'nfe_emission', 'true', 'Emissão de NF-e'),
('pet_platinum', 'revenue_forecast', 'true', 'Previsão de receita'),
('pet_platinum', 'backup_automatico', 'true', 'Backup automático premium'),
('pet_platinum', 'dedicated_manager', 'true', 'Gerente de conta dedicado'),

-- Platinum Anual features (complete set)
('pet_platinum_anual', 'programa_fidelidade', 'true', 'Programa de fidelidade'),
('pet_platinum_anual', 'multi_unit', 'true', 'Multi-unidades e franquias'),
('pet_platinum_anual', 'nfe_emission', 'true', 'Emissão de NF-e'),
('pet_platinum_anual', 'revenue_forecast', 'true', 'Previsão de receita'),
('pet_platinum_anual', 'backup_automatico', 'true', 'Backup automático premium'),
('pet_platinum_anual', 'dedicated_manager', 'true', 'Gerente de conta dedicado'),
('pet_platinum_anual', 'access_advanced_reports', 'true', 'Relatórios avançados'),
('pet_platinum_anual', 'priority_support', 'true', 'Suporte prioritário'),
('pet_platinum_anual', 'whatsapp_integration', 'true', 'Integração WhatsApp')
ON CONFLICT (plan_name, feature_key) DO UPDATE SET 
  feature_value = EXCLUDED.feature_value,
  description = EXCLUDED.description;