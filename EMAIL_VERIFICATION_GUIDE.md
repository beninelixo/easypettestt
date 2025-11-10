# 📧 Guia de Verificação do Sistema de Email - EasyPet

## 🎯 Objetivo
Verificar se o sistema de email está funcionando após atualização da `RESEND_API_KEY`.

---

## ✅ Fase 1: Verificação da Configuração

### 1.1. Verificar Chave API
- [ ] Secret `RESEND_API_KEY` atualizada no Lovable Cloud
- [ ] Chave começa com `re_` e tem 40+ caracteres
- [ ] Sem espaços em branco antes/depois

### 1.2. Verificar Domínio no Resend
Acessar: https://resend.com/domains

Status possíveis:
- ✅ **Verified** = Produção (recomendado)
- ⚠️ **Testing Mode** = 100 emails/mês, pode ir para spam
- ❌ **Not Verified** = Não funcionará

---

## 🧪 Fase 2: Testes Funcionais

### Acesso à Página de Testes
Navegar para: `/admin/email-system-test`

### Teste 2.1: Reset de Senha
**Passos:**
1. Digite um email válido cadastrado
2. Clique em "Enviar Código"

**Esperado:**
- ✅ Toast verde "Código enviado com sucesso"
- ✅ Email recebido (verificar spam se em modo teste)
- ✅ Código salvo no banco de dados

**Verificar no Banco:**
```sql
SELECT email, code, expires_at, used, created_at
FROM password_resets
WHERE email = 'seu_email@teste.com'
ORDER BY created_at DESC
LIMIT 1;
```

### Teste 2.2: Alerta de Admin
**Passos:**
1. Clique em "Enviar Email de Teste"

**Esperado:**
- ✅ Email enviado para TODOS os administradores
- ✅ Emails buscados dinamicamente do banco (não mais hardcoded)
- ✅ Log registrado em system_logs

**Verificar Admins:**
```sql
-- Ver admins cadastrados
SELECT u.email, ur.role, ur.user_id
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role = 'admin';
```

### Teste 2.3: Rate Limiting
**Passos:**
1. Digite um email
2. Clique em "Testar Rate Limit"
3. Sistema tentará 4 envios seguidos

**Esperado:**
- ✅ Primeira tentativa: sucesso
- ✅ Segunda tentativa: sucesso
- ✅ Terceira tentativa: sucesso
- ❌ Quarta tentativa: **BLOQUEADA** (Rate limit ativo)

**Mensagem esperada:**
```
Rate limit exceeded. Try again in 1 hour.
```

---

## 📊 Fase 3: Monitoramento

### 3.1. Logs de Sistema
```sql
-- Logs de email das últimas 24h
SELECT 
  module,
  log_type,
  message,
  details,
  created_at
FROM system_logs
WHERE module IN (
  'send_reset_code',
  'send_notification', 
  'send_alert_email',
  'send_security_alert_email'
)
AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 20;
```

**Análise:**
- ✅ `log_type = 'info'` ou `'success'` = Funcionando
- ⚠️ `log_type = 'warning'` = Atenção (modo teste, sem admins, etc.)
- ❌ `log_type = 'error'` = Falha na API

### 3.2. Status de Códigos de Reset
```sql
-- Ver status de tentativas recentes
SELECT 
  email,
  code,
  expires_at,
  used,
  created_at,
  CASE 
    WHEN used = true THEN '✅ Usado'
    WHEN expires_at < NOW() THEN '⏱️ Expirado'
    ELSE '✓ Válido'
  END as status
FROM password_resets
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 10;
```

### 3.3. Tentativas por Email (Rate Limit)
```sql
-- Ver quantas tentativas um email fez na última hora
SELECT 
  email,
  COUNT(*) as total_attempts,
  MAX(created_at) as last_attempt
FROM password_resets
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY email
HAVING COUNT(*) >= 3
ORDER BY total_attempts DESC;
```

---

## 🔧 Fase 4: Correções Aplicadas

### ✅ Correção 4.1: Email Hardcoded Removido
**Antes:**
```typescript
to: ['admin@petshop.com'], // ❌ Hardcoded
```

**Depois:**
```typescript
// ✅ Busca dinâmica de admins do banco
const { data: adminRoles } = await supabase
  .from('user_roles')
  .select('user_id')
  .eq('role', 'admin');

const adminIds = adminRoles?.map(r => r.user_id) || [];
const { data: { users } } = await supabase.auth.admin.listUsers();

const adminEmails = users
  .filter(user => adminIds.includes(user.id))
  .map(user => user.email)
  .filter((email): email is string => !!email);

to: adminEmails, // ✅ Dinâmico
```

**Benefícios:**
- ✅ Emails sempre atualizados
- ✅ Suporta múltiplos admins
- ✅ Sem necessidade de alterar código ao adicionar admins
- ✅ Logs se não houver admins cadastrados

---

## 🎯 Fase 5: Checklist de Produção

### Configuração
- [ ] `RESEND_API_KEY` válida e atualizada
- [ ] Domínio verificado no Resend (recomendado)
- [ ] Sender configurado: `EasyPet <onboarding@resend.dev>`
- [ ] Ao verificar domínio, atualizar para: `EasyPet <noreply@seudominio.com>`

### Funcionalidades
- [ ] Reset de senha enviando códigos
- [ ] Códigos salvos corretamente no banco
- [ ] Códigos expirando após 15 minutos
- [ ] Rate limiting bloqueando após 3 tentativas/hora
- [ ] Alertas de admin enviados para todos os admins
- [ ] Emails chegando na caixa de entrada (não spam)

### Monitoramento
- [ ] Logs sem erros críticos em 24h
- [ ] System_logs registrando todas as operações
- [ ] Página de testes `/admin/email-system-test` acessível
- [ ] Queries SQL de monitoramento documentadas

### Segurança
- [ ] Edge functions protegidas com JWT
- [ ] Admin role verificado em alertas
- [ ] Rate limiting ativo e testado
- [ ] IPs bloqueados após 10 tentativas falhadas
- [ ] Códigos temporários com expiração

---

## 🚨 Troubleshooting

### Problema: "API key is invalid"
**Causa:** Chave incorreta ou não atualizada

**Solução:**
1. Acessar https://resend.com/api-keys
2. Gerar nova chave (começa com `re_`)
3. Copiar chave completa
4. Atualizar secret `RESEND_API_KEY` no Lovable Cloud
5. Aguardar 1-2 minutos para propagação

---

### Problema: "Domain not verified"
**Causa:** Domínio não configurado no Resend

**Solução:**

**Para Desenvolvimento:**
- ✅ Continuar com `onboarding@resend.dev`
- ⚠️ Limite: 100 emails/mês
- ⚠️ Pode cair em spam

**Para Produção:**
1. Acessar https://resend.com/domains
2. Adicionar seu domínio
3. Configurar DNS (SPF, DKIM, DMARC)
4. Aguardar verificação
5. Atualizar sender nas 4 edge functions

---

### Problema: Emails não chegam
**Possíveis Causas:**

1. **Pasta de Spam**
   - ✅ Verificar pasta de spam/lixo eletrônico
   - Solução: Verificar domínio no Resend

2. **Modo Teste**
   - ⚠️ Domínio `onboarding@resend.dev` = modo teste
   - Solução: Verificar domínio personalizado

3. **Rate Limit do Resend**
   - ❌ Limite de 100 emails/mês no teste
   - Solução: Verificar domínio ou upgrade de plano

4. **Email Inválido**
   - ❌ Email não existe em `auth.users`
   - Verificar com query:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'seu_email@teste.com';
   ```

---

### Problema: "Rate limit exceeded"
**Causa:** Muitas tentativas em curto período

**Solução:**

**Esperar o tempo de bloqueio:**
- Password reset: 1 hora (3 tentativas)
- Login: 30 minutos (5 tentativas por IP)

**Ou limpar manualmente (apenas para testes):**
```sql
-- ⚠️ Usar apenas em ambiente de desenvolvimento
DELETE FROM password_resets 
WHERE email = 'seu_email@teste.com'
AND created_at > NOW() - INTERVAL '1 hour';
```

---

### Problema: Sem administradores cadastrados
**Sintoma:** Warning nos logs: "Nenhum administrador encontrado"

**Verificar:**
```sql
SELECT COUNT(*) as total_admins
FROM user_roles
WHERE role = 'admin';
```

**Solução: Cadastrar admin**
```sql
-- Adicionar role admin para um usuário existente
INSERT INTO user_roles (user_id, role)
VALUES ('UUID_DO_USUARIO', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## 📈 Métricas de Sucesso

Após completar o plano, você deve ter:

### Funcional
- ✅ 100% dos testes de email passando
- ✅ Códigos temporários expirando corretamente
- ✅ Rate limiting bloqueando tentativas excessivas
- ✅ Emails dinâmicos para admins (não hardcoded)

### Monitoramento
- ✅ 0 erros críticos nos logs de 24h
- ✅ Logs estruturados com timestamp
- ✅ Queries SQL documentadas

### Segurança
- ✅ JWT verification em todas as edge functions
- ✅ Admin role check em alertas
- ✅ IP blocking após 10 tentativas
- ✅ Códigos com expiração de 15 minutos

---

## 🔗 Recursos Úteis

### Links Importantes
- **Resend Dashboard:** https://resend.com/dashboard
- **Domínios:** https://resend.com/domains
- **API Keys:** https://resend.com/api-keys
- **Documentação:** https://resend.com/docs

### Edge Functions Atualizadas
1. `send-reset-code` - Reset de senha
2. `send-notification` - Notificações de manutenção (✅ email dinâmico)
3. `send-alert-email` - Alertas gerais de admin
4. `send-security-alert-email` - Alertas críticos de segurança

### Sender Atual
```
EasyPet <onboarding@resend.dev>
```

### Sender Futuro (após verificar domínio)
```
EasyPet <noreply@easypet.lovable.app>
```

---

## ✨ Conclusão

O sistema de email do EasyPet está agora:

✅ **Seguro** - JWT + admin verification  
✅ **Robusto** - Rate limiting + error handling  
✅ **Dinâmico** - Emails de admin buscados do banco  
✅ **Monitorado** - Logs estruturados + queries SQL  
✅ **Testável** - Página dedicada de testes  

**Próximo Passo:** Atualizar `RESEND_API_KEY` e executar os testes!
