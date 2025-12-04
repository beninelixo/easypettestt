-- Add missing plan features for consistency (feature_value is JSONB)
INSERT INTO plan_features (plan_name, feature_key, feature_value, description) VALUES
-- Free plan features
('gratuito', 'appointments_limit', '"30"', 'Limite de 30 agendamentos por mês'),
('gratuito', 'users_limit', '"1"', 'Apenas 1 usuário'),
('gratuito', 'client_management', 'true', 'Gestão de clientes'),
('gratuito', 'service_management', 'true', 'Gestão de serviços'),
('gratuito', 'encryption', 'true', 'Criptografia de dados'),
('gratuito', 'mobile_app', 'true', 'App mobile PWA'),

-- Gold features
('pet_gold', 'appointments_limit', '"unlimited"', 'Agendamentos ilimitados'),
('pet_gold', 'users_limit', '"3"', 'Até 3 usuários simultâneos'),
('pet_gold', 'email_reminders', 'true', 'Lembretes por email'),
('pet_gold', 'photo_history', 'true', 'Histórico com fotos'),
('pet_gold', 'two_factor_auth', 'true', 'Autenticação 2FA'),
('pet_gold', 'stock_control', 'true', 'Controle de estoque'),
('pet_gold', 'financial_reports', 'true', 'Relatórios financeiros'),
('pet_gold', 'client_segmentation', 'true', 'Segmentação de clientes'),
('pet_gold', 'commissions', 'true', 'Comissões automáticas'),
('pet_gold', 'schedule_control', 'true', 'Controle de horários'),
('pet_gold', 'online_booking', 'true', 'Agendamento online'),
('pet_gold', 'email_campaigns', 'true', 'Campanhas por email'),
('pet_gold', 'feedback_ratings', 'true', 'Avaliações e feedback'),
('pet_gold', 'priority_support', 'true', 'Suporte prioritário'),

-- Platinum features  
('pet_platinum', 'appointments_limit', '"unlimited"', 'Agendamentos ilimitados'),
('pet_platinum', 'users_limit', '"5"', 'Até 5 usuários simultâneos'),
('pet_platinum', 'whatsapp_integration', 'true', 'Integração WhatsApp Business'),
('pet_platinum', 'programa_fidelidade', 'true', 'Programa de fidelidade'),
('pet_platinum', 'multi_unit', 'true', 'Multi-unidades e franquias'),
('pet_platinum', 'nfe_emission', 'true', 'Emissão de NF-e'),
('pet_platinum', 'revenue_forecast', 'true', 'Previsão de receita'),
('pet_platinum', 'automatic_backup', 'true', 'Backup automático diário'),
('pet_platinum', 'audit_logs', 'true', 'Logs de auditoria'),
('pet_platinum', 'push_notifications', 'true', 'Notificações push'),
('pet_platinum', 'marketing_reports', 'true', 'Relatórios de marketing'),
('pet_platinum', 'dedicated_manager', 'true', 'Gerente de conta dedicado'),

-- Platinum Anual (same features as Platinum)
('pet_platinum_anual', 'appointments_limit', '"unlimited"', 'Agendamentos ilimitados'),
('pet_platinum_anual', 'users_limit', '"5"', 'Até 5 usuários simultâneos'),
('pet_platinum_anual', 'whatsapp_integration', 'true', 'Integração WhatsApp Business'),
('pet_platinum_anual', 'programa_fidelidade', 'true', 'Programa de fidelidade'),
('pet_platinum_anual', 'multi_unit', 'true', 'Multi-unidades e franquias'),
('pet_platinum_anual', 'nfe_emission', 'true', 'Emissão de NF-e'),
('pet_platinum_anual', 'revenue_forecast', 'true', 'Previsão de receita'),
('pet_platinum_anual', 'automatic_backup', 'true', 'Backup automático diário'),
('pet_platinum_anual', 'audit_logs', 'true', 'Logs de auditoria'),
('pet_platinum_anual', 'push_notifications', 'true', 'Notificações push'),
('pet_platinum_anual', 'marketing_reports', 'true', 'Relatórios de marketing'),
('pet_platinum_anual', 'dedicated_manager', 'true', 'Gerente de conta dedicado'),
('pet_platinum_anual', 'annual_discount', 'true', '25% de desconto anual'),
('pet_platinum_anual', 'team_training', 'true', 'Treinamento gratuito para equipe'),
('pet_platinum_anual', 'quarterly_consulting', 'true', 'Consultoria trimestral')
ON CONFLICT (plan_name, feature_key) DO UPDATE SET
  feature_value = EXCLUDED.feature_value,
  description = EXCLUDED.description;