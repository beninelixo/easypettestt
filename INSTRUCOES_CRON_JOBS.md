# Instruções para Configuração de Cron Jobs

## ⚠️ Pré-requisitos

Para que as automações funcionem, é necessário habilitar as extensões `pg_cron` e `pg_net` no seu projeto Supabase:

### Como Habilitar as Extensões

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Database** → **Extensions**
4. Procure e habilite:
   - `pg_cron` (para agendar tarefas)
   - `pg_net` (para fazer requisições HTTP)

## 📅 Cron Jobs Configurados

Após habilitar as extensões, execute o SQL abaixo para configurar as automações:

```sql
-- 1. Processar agendamentos atrasados (Todo dia às 01:00)
SELECT cron.schedule(
  'process-overdue-appointments-daily',
  '0 1 * * *',
  $$
  SELECT net.http_post(
    url:='https://xkfkrdorghyagtwbxory.supabase.co/functions/v1/process-overdue-appointments',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZmtyZG9yZ2h5YWd0d2J4b3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1OTQ5MTEsImV4cCI6MjA3NzE3MDkxMX0.R8kZ4o1Ll2gRLfp4Y2MQWbD_fvJ0WoRWEKHCdU3yhpQ"}'::jsonb
  ) as request_id;
  $$
);

-- 2. Verificar produtos vencendo (Todo dia às 06:00)
SELECT cron.schedule(
  'check-expiring-products-daily',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url:='https://xkfkrdorghyagtwbxory.supabase.co/functions/v1/check-expiring-products',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZmtyZG9yZ2h5YWd0d2J4b3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1OTQ5MTEsImV4cCI6MjA3NzE3MDkxMX0.R8kZ4o1Ll2gRLfp4Y2MQWbD_fvJ0WoRWEKHCdU3yhpQ"}'::jsonb
  ) as request_id;
  $$
);

-- 3. Validar perfis (Todo domingo às 03:00)
SELECT cron.schedule(
  'validate-profiles-weekly',
  '0 3 * * 0',
  $$
  SELECT net.http_post(
    url:='https://xkfkrdorghyagtwbxory.supabase.co/functions/v1/validate-profiles',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZmtyZG9yZ2h5YWd0d2J4b3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1OTQ5MTEsImV4cCI6MjA3NzE3MDkxMX0.R8kZ4o1Ll2gRLfp4Y2MQWbD_fvJ0WoRWEKHCdU3yhpQ"}'::jsonb
  ) as request_id;
  $$
);

-- 4. Reconciliar pagamentos (Todo dia às 02:00)
SELECT cron.schedule(
  'reconcile-payments-daily',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url:='https://xkfkrdorghyagtwbxory.supabase.co/functions/v1/reconcile-payments',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZmtyZG9yZ2h5YWd0d2J4b3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1OTQ5MTEsImV4cCI6MjA3NzE3MDkxMX0.R8kZ4o1Ll2gRLfp4Y2MQWbD_fvJ0WoRWEKHCdU3yhpQ"}'::jsonb
  ) as request_id;
  $$
);

-- 5. Backup de dados críticos (Todo dia às 04:00)
SELECT cron.schedule(
  'backup-critical-data-daily',
  '0 4 * * *',
  $$
  SELECT net.http_post(
    url:='https://xkfkrdorghyagtwbxory.supabase.co/functions/v1/backup-critical-data',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZmtyZG9yZ2h5YWd0d2J4b3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1OTQ5MTEsImV4cCI6MjA3NzE3MDkxMX0.R8kZ4o1Ll2gRLfp4Y2MQWbD_fvJ0WoRWEKHCdU3yhpQ"}'::jsonb
  ) as request_id;
  $$
);

-- 6. Coletar métricas de saúde (A cada 5 minutos)
SELECT cron.schedule(
  'collect-health-metrics',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url:='https://xkfkrdorghyagtwbxory.supabase.co/functions/v1/collect-health-metrics',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZmtyZG9yZ2h5YWd0d2J4b3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1OTQ5MTEsImV4cCI6MjA3NzE3MDkxMX0.R8kZ4o1Ll2gRLfp4Y2MQWbD_fvJ0WoRWEKHCdU3yhpQ"}'::jsonb
  ) as request_id;
  $$
);

-- 7. Processar jobs falhados (A cada minuto)
SELECT cron.schedule(
  'process-failed-jobs',
  '* * * * *',
  $$
  SELECT net.http_post(
    url:='https://xkfkrdorghyagtwbxory.supabase.co/functions/v1/process-failed-jobs',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZmtyZG9yZ2h5YWd0d2J4b3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1OTQ5MTEsImV4cCI6MjA3NzE3MDkxMX0.R8kZ4o1Ll2gRLfp4Y2MQWbD_fvJ0WoRWEKHCdU3yhpQ"}'::jsonb
  ) as request_id;
  $$
);
```

## 🔍 Verificar Status dos Cron Jobs

Para ver todos os cron jobs configurados:

```sql
SELECT * FROM cron.job;
```

Para ver o histórico de execuções:

```sql
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 50;
```

## 🗑️ Remover um Cron Job

Se precisar remover algum job:

```sql
SELECT cron.unschedule('nome-do-job');
```

Por exemplo:
```sql
SELECT cron.unschedule('process-overdue-appointments-daily');
```

## 📊 Monitoramento

Os logs de todas as execuções são salvos na tabela `system_logs`:

```sql
SELECT * FROM system_logs 
WHERE module IN (
  'process_overdue_appointments',
  'check_expiring_products',
  'validate_profiles',
  'reconcile_payments',
  'backup_critical_data'
)
ORDER BY created_at DESC 
LIMIT 100;
```

## ⏰ Formato dos Horários (Cron)

O formato é: `minuto hora dia-do-mês mês dia-da-semana`

Exemplos:
- `0 1 * * *` - Todo dia à 01:00
- `0 6 * * *` - Todo dia às 06:00
- `0 3 * * 0` - Todo domingo às 03:00
- `*/30 * * * *` - A cada 30 minutos
- `0 */6 * * *` - A cada 6 horas

## 🎯 Automações Configuradas

| Job | Frequência | Horário | Função |
|-----|-----------|---------|---------|
| Agendamentos Atrasados | Diária | 01:00 | Cancela automaticamente agendamentos com data passada |
| Produtos Vencendo | Diária | 06:00 | Alerta sobre produtos vencidos ou próximos do vencimento |
| Validação de Perfis | Semanal | Dom 03:00 | Remove pets órfãos e identifica perfis incompletos |
| Reconciliação de Pagamentos | Diária | 02:00 | Corrige inconsistências em pagamentos |
| Backup de Dados | Diária | 04:00 | Faz snapshot das tabelas críticas |
| Métricas de Saúde | A cada 5 min | */5 * * * * | Coleta métricas de performance e saúde do sistema |
| Processar Jobs Falhados | A cada 1 min | * * * * * | Reprocessa jobs falhados com retry automático |

## 🚨 Alertas

Todos os jobs registram seus resultados em `system_logs`. Configure notificações baseadas nesses logs:

- **Tipo: error** - Problemas críticos que requerem atenção imediata
- **Tipo: warning** - Avisos que devem ser revisados
- **Tipo: info/success** - Execuções normais

## 🔧 Troubleshooting

**Problema: Job não está executando**
```sql
-- Verificar se o job existe
SELECT * FROM cron.job WHERE jobname = 'nome-do-job';

-- Ver últimas execuções e erros
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'nome-do-job')
ORDER BY start_time DESC;
```

**Problema: Edge function retornando erro**
- Verifique os logs da edge function no Supabase Dashboard
- Confirme que a URL e o token de autorização estão corretos
- Teste a função manualmente antes de agendar

## 📝 Notas Importantes

1. **Fuso Horário**: Os horários são em UTC. Ajuste conforme sua timezone.
2. **Performance**: Jobs não devem executar operações muito pesadas. Use paginação se necessário.
3. **Timeout**: Edge functions têm timeout de 60 segundos por padrão.
4. **Custos**: Verifique os limites do seu plano Supabase para execuções de cron jobs.

## ✅ Checklist de Implantação

- [ ] Extensões `pg_cron` e `pg_net` habilitadas
- [ ] Todos os 5 cron jobs criados com sucesso
- [ ] Verificado que jobs aparecem em `cron.job`
- [ ] Testado cada edge function manualmente
- [ ] Configurado monitoramento de logs
- [ ] Documentado para equipe
- [ ] Definido responsáveis por revisar alertas

---

**Status**: ✅ Edge Functions implantadas | ⏳ Aguardando habilitação de extensões para cron jobs
