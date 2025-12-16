# Troubleshooting Guide - EasyPet

## Problemas Comuns

### Autenticação

#### "Login bloqueado por tentativas excessivas"

**Causa:** Rate limiting ativado após 3 tentativas falhas.

**Solução:**
1. Aguarde 30 minutos
2. Ou limpe a tabela `login_attempts` (admin):
```sql
DELETE FROM login_attempts 
WHERE email = 'user@email.com' 
AND attempt_time > NOW() - INTERVAL '15 minutes';
```

#### "Sessão expirada"

**Causa:** Token JWT expirado e refresh falhou.

**Solução:**
1. Faça logout e login novamente
2. Limpe localStorage: `localStorage.clear()`

#### "Usuário não tem permissão"

**Causa:** Role não atribuída ou RLS bloqueando.

**Solução:**
1. Verifique roles do usuário:
```sql
SELECT * FROM user_roles WHERE user_id = '<user-id>';
```
2. Atribua role se necessário:
```sql
INSERT INTO user_roles (user_id, role) VALUES ('<user-id>', 'pet_shop');
```

### Dashboard

#### "Dashboard em branco"

**Causa:** Erro de carregamento ou dados não encontrados.

**Solução:**
1. Verifique console do navegador (F12)
2. Verifique se há pet_shop associado ao usuário
3. Limpe cache: `localStorage.removeItem('react-query-cache')`

#### "Gráficos não carregam"

**Causa:** Dados insuficientes ou erro de query.

**Solução:**
1. Verifique se há appointments/payments no período
2. Tente período maior (30 dias)

### Imagens

#### "Imagens não aparecem / voltaram antigas"

**Causa:** Cache do Service Worker ou RLS bloqueando.

**Solução:**
1. Force refresh: `Ctrl+Shift+R`
2. Limpe cache do SW:
   - DevTools → Application → Storage → Clear site data
3. Verifique RLS em `site_images` para `anon`

### Edge Functions

#### "Edge Function returned non-2xx status"

**Causa:** Erro na função ou validação falhou.

**Solução:**
1. Verifique logs da função no Lovable Cloud
2. Verifique payload enviado
3. Confirme que secrets estão configurados

#### "Function timeout"

**Causa:** Operação muito longa ou loop infinito.

**Solução:**
1. Verifique logs para identificar operação lenta
2. Otimize queries
3. Aumente timeout se necessário

### Database

#### "PGRST116 - Row not found"

**Causa:** `.single()` usado mas 0 ou múltiplos resultados.

**Solução:**
1. Use `.maybeSingle()` para 0 ou 1 resultado
2. Adicione filtros mais específicos
3. Verifique RLS policies

#### "Duplicate key violation"

**Causa:** Tentando inserir registro duplicado.

**Solução:**
1. Use `upsert` ao invés de `insert`
2. Verifique constraint que está falhando
3. Adicione verificação antes de inserir

### Performance

#### "Site lento"

**Causa:** Queries pesadas ou muitos re-renders.

**Solução:**
1. Verifique Network tab para requests lentos
2. Use React DevTools para identificar re-renders
3. Adicione índices em queries frequentes

#### "Memory leak warning"

**Causa:** Event listeners não removidos.

**Solução:**
1. Use hooks `useEventListener` ou `useEffect` com cleanup
2. Verifique subscriptions do Supabase Realtime

## Diagnóstico

### Verificar Saúde do Sistema

```sql
-- Últimos health checks
SELECT * FROM daily_health_reports 
ORDER BY report_date DESC LIMIT 5;

-- Métricas globais
SELECT * FROM global_metrics 
ORDER BY last_calculated_at DESC;
```

### Verificar Logs

```sql
-- Erros recentes
SELECT * FROM structured_logs 
WHERE level IN ('error', 'critical')
ORDER BY created_at DESC LIMIT 20;

-- Logs de autenticação
SELECT * FROM auth_events_log 
WHERE event_status = 'error'
ORDER BY created_at DESC LIMIT 20;
```

### Verificar Bloqueios

```sql
-- IPs bloqueados
SELECT * FROM blocked_ips 
WHERE blocked_until > NOW();

-- Tentativas de login
SELECT email, COUNT(*) as attempts 
FROM login_attempts 
WHERE attempt_time > NOW() - INTERVAL '15 minutes'
GROUP BY email
HAVING COUNT(*) >= 3;
```

## Contato Suporte

Se o problema persistir:

1. Colete logs relevantes
2. Documente passos para reproduzir
3. Entre em contato com a equipe de desenvolvimento
