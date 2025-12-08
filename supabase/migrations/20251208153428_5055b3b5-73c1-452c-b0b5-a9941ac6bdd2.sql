-- Adicionar features faltantes para plan_features (restrição por plano)
INSERT INTO plan_features (plan_name, feature_key, feature_value, description) VALUES
  -- Gold features
  ('pet_gold', 'financial_reports', 'true', 'Relatórios financeiros avançados'),
  ('pet_gold', 'calendar_sync', 'true', 'Sincronização com Google Calendar'),
  ('pet_gold_anual', 'financial_reports', 'true', 'Relatórios financeiros avançados'),
  ('pet_gold_anual', 'calendar_sync', 'true', 'Sincronização com Google Calendar'),
  
  -- Platinum features (includes Gold + extras)
  ('pet_platinum', 'financial_reports', 'true', 'Relatórios financeiros avançados'),
  ('pet_platinum', 'calendar_sync', 'true', 'Sincronização com Google Calendar'),
  ('pet_platinum', 'backup_automatico', 'true', 'Backup automático de dados'),
  ('pet_platinum', 'whatsapp_integration', 'true', 'Integração WhatsApp Business'),
  ('pet_platinum', 'webhook_integration', 'true', 'Webhooks para integrações externas'),
  ('pet_platinum', 'nfe_emission', 'true', 'Emissão de NF-e'),
  ('pet_platinum', 'loyalty_program', 'true', 'Programa de fidelidade avançado'),
  
  ('pet_platinum_anual', 'financial_reports', 'true', 'Relatórios financeiros avançados'),
  ('pet_platinum_anual', 'calendar_sync', 'true', 'Sincronização com Google Calendar'),
  ('pet_platinum_anual', 'backup_automatico', 'true', 'Backup automático de dados'),
  ('pet_platinum_anual', 'whatsapp_integration', 'true', 'Integração WhatsApp Business'),
  ('pet_platinum_anual', 'webhook_integration', 'true', 'Webhooks para integrações externas'),
  ('pet_platinum_anual', 'nfe_emission', 'true', 'Emissão de NF-e'),
  ('pet_platinum_anual', 'loyalty_program', 'true', 'Programa de fidelidade avançado')
ON CONFLICT DO NOTHING;