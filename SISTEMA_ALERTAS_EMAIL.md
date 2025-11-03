# 📧 Sistema de Alertas por Email

## ✅ Implementação Completa

### Edge Function: `send-alert-email`

Função criada para enviar alertas por email para todos os administradores do sistema.

#### Localização
```
supabase/functions/send-alert-email/index.ts
```

#### Funcionalidades

1. **Busca Automática de Admins**
   - Busca todos os usuários com role 'admin' na tabela `user_roles`
   - Recupera emails do auth.users do Supabase
   - Envia para todos os admins simultaneamente

2. **Níveis de Severidade**
   ```typescript
   type Severity = 'critical' | 'warning' | 'info'
   ```

   | Severidade | Cor | Ícone | Uso |
   |-----------|-----|-------|-----|
   | `critical` | Vermelho | 🚨 | Problemas urgentes que requerem ação imediata |
   | `warning` | Amarelo | ⚠️ | Avisos importantes que precisam de atenção |
   | `info` | Azul | ℹ️ | Informações gerais do sistema |

3. **Email HTML Responsivo**
   - Design profissional e limpo
   - Cores baseadas na severidade
   - Informações estruturadas (módulo, data/hora, mensagem, detalhes)
   - Próximos passos sugeridos

4. **Logging Automático**
   - Registra cada envio em `system_logs`
   - Conta sucessos e falhas
   - Armazena detalhes do alerta

---

## 🔔 Integração com Outras Edge Functions

As seguintes funções foram atualizadas para enviar alertas automáticos:

### 1. `process-overdue-appointments`
**Trigger**: ≥5 agendamentos atrasados  
**Severidade**: `warning`  
**Email**: Informa sobre cancelamentos automáticos

### 2. `check-expiring-products`
**Trigger**: Produtos vencidos detectados  
**Severidade**: `critical`  
**Email**: Alerta sobre produtos que foram desativados

### 3. `reconcile-payments`
**Trigger**: Problemas críticos em pagamentos  
**Severidade**: `critical`  
**Email**: Notifica sobre inconsistências que requerem ação manual

---

## 📝 Como Usar

### Chamada Direta (Manual)

```typescript
const response = await fetch(
  'https://xkfkrdorghyagtwbxory.supabase.co/functions/v1/send-alert-email',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({
      severity: 'critical',
      module: 'meu_modulo',
      subject: 'Título do Alerta',
      message: 'Descrição detalhada do problema',
      details: {
        // Qualquer objeto JSON com detalhes adicionais
        count: 10,
        affected_items: ['item1', 'item2']
      }
    })
  }
);
```

### Chamada de Outra Edge Function

```typescript
try {
  await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-alert-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
    },
    body: JSON.stringify({
      severity: 'warning',
      module: 'nome_do_modulo',
      subject: 'Assunto do Email',
      message: 'Mensagem principal',
      details: { /* objetos com detalhes */ }
    })
  });
} catch (error) {
  console.error('Erro ao enviar alerta:', error);
  // Não falhar o processo principal por erro no email
}
```

### Chamada do Frontend (Cliente)

```typescript
import { supabase } from '@/integrations/supabase/client';

// Via Edge Function
const { data, error } = await supabase.functions.invoke('send-alert-email', {
  body: {
    severity: 'info',
    module: 'user_action',
    subject: 'Ação Importante do Usuário',
    message: 'Um usuário realizou uma ação que requer atenção',
    details: {
      user_id: 'xxx',
      action: 'delete_account'
    }
  }
});
```

---

## 🎨 Exemplo de Email Gerado

### Email de Alerta Crítico

```
┌─────────────────────────────────────┐
│ 🚨 CRÍTICO                          │
└─────────────────────────────────────┘

10 produtos vencidos detectados!

┌─ Informações ─────────────────────┐
│ Módulo: check_expiring_products   │
│ Data/Hora: 03/11/2025 14:30:00   │
└───────────────────────────────────┘

┌─ Mensagem ────────────────────────┐
│ O sistema detectou 10 produto(s)  │
│ com validade expirada que foram   │
│ desativados automaticamente.      │
└───────────────────────────────────┘

┌─ Detalhes ────────────────────────┐
│ {                                  │
│   "expired_count": 10,            │
│   "expiring_count": 5,            │
│   "action_taken": "Desativados"   │
│ }                                  │
└───────────────────────────────────┘

Próximos passos:
• Verifique o sistema imediatamente
• Acesse o painel de administração
• Revise os logs do sistema
```

---

## 🔒 Segurança

### Validações Implementadas

1. **Autenticação**: Requer SERVICE_ROLE_KEY do Supabase
2. **Autorização**: Apenas admins recebem emails
3. **Validação de Dados**: Schema validado antes do envio
4. **Rate Limiting**: Implementado pelo Resend

### Dados Sensíveis

⚠️ **NUNCA** envie nos detalhes:
- Senhas
- Tokens de autenticação
- Chaves de API
- Dados pessoais sensíveis (CPF, cartões)

✅ **OK para enviar**:
- IDs de registros
- Contadores e estatísticas
- Mensagens de erro (sem stack traces completas)
- Metadados não-sensíveis

---

## 📊 Monitoramento

### Verificar Envios

```sql
-- Logs de envio de emails
SELECT * FROM system_logs 
WHERE module = 'send_alert_email'
ORDER BY created_at DESC 
LIMIT 50;
```

### Métricas

```sql
-- Emails enviados nas últimas 24h
SELECT 
  COUNT(*) as total_envios,
  SUM((details->>'success_count')::int) as emails_sucesso,
  SUM((details->>'fail_count')::int) as emails_falha
FROM system_logs 
WHERE module = 'send_alert_email'
  AND created_at > NOW() - INTERVAL '24 hours';
```

### Alertas por Severidade

```sql
-- Distribuição de alertas por severidade (últimos 7 dias)
SELECT 
  details->>'severity' as severidade,
  COUNT(*) as quantidade
FROM system_logs 
WHERE module = 'send_alert_email'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY details->>'severity'
ORDER BY quantidade DESC;
```

---

## 🧪 Testes

### Teste Manual

1. Certifique-se de ter pelo menos 1 admin no sistema
2. Execute via curl:

```bash
curl -X POST \
  https://xkfkrdorghyagtwbxory.supabase.co/functions/v1/send-alert-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_SERVICE_ROLE_KEY" \
  -d '{
    "severity": "info",
    "module": "teste",
    "subject": "Email de Teste",
    "message": "Este é um teste do sistema de alertas",
    "details": {
      "teste": true
    }
  }'
```

### Teste Automatizado

Adicione ao seu pipeline de CI/CD:

```typescript
// test-alert-email.ts
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("Send alert email", async () => {
  const response = await fetch(
    "http://localhost:54321/functions/v1/send-alert-email",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
      },
      body: JSON.stringify({
        severity: "info",
        module: "test",
        subject: "Test Alert",
        message: "Test message"
      })
    }
  );
  
  assertEquals(response.status, 200);
  
  const data = await response.json();
  assertEquals(data.success, true);
});
```

---

## 🔧 Troubleshooting

### Problema: Emails não chegam

**Possíveis causas:**
1. ❌ RESEND_API_KEY não configurada
2. ❌ Domínio não verificado no Resend
3. ❌ Nenhum admin cadastrado
4. ❌ Emails dos admins inválidos

**Solução:**
```sql
-- Verificar admins
SELECT u.email, ur.role 
FROM auth.users u
JOIN user_roles ur ON ur.user_id = u.id
WHERE ur.role = 'admin';

-- Se não houver admins, criar um
INSERT INTO user_roles (user_id, role)
VALUES ('user-id-aqui', 'admin');
```

### Problema: Erro ao enviar

**Verificar logs:**
```sql
SELECT * FROM system_logs 
WHERE module = 'send_alert_email' 
  AND log_type = 'error'
ORDER BY created_at DESC 
LIMIT 10;
```

### Problema: Resend retorna erro

**Códigos comuns:**
- `401`: API key inválida
- `403`: Domínio não verificado
- `422`: Email inválido
- `429`: Rate limit excedido

**Verificar no Resend Dashboard:**
https://resend.com/emails

---

## 📈 Próximas Melhorias

### Curto Prazo
- [ ] Templates personalizáveis por tipo de alerta
- [ ] Opção de desabilitar alertas por módulo
- [ ] Digest diário de alertas não-críticos
- [ ] Suporte a webhooks além de email

### Médio Prazo
- [ ] Integração com Slack/Discord
- [ ] Dashboard de alertas no frontend
- [ ] Histórico de alertas por admin
- [ ] Sistema de escalação (alertar diferentes pessoas por severidade)

### Longo Prazo
- [ ] Machine learning para detectar padrões
- [ ] Alertas preditivos
- [ ] Integração com PagerDuty/OpsGenie
- [ ] Sistema de on-call rotativo

---

## ✅ Checklist de Implantação

- [x] Edge function criada
- [x] RESEND_API_KEY configurada
- [x] Integrado com 3 funções existentes
- [x] Testes manuais realizados
- [ ] Domínio verificado no Resend (use onboarding@resend.dev para testes)
- [ ] Pelo menos 1 admin cadastrado
- [ ] Documentação revisada pela equipe
- [ ] Treinamento dos admins realizado

---

**Status**: ✅ Implementado e pronto para uso  
**Última atualização**: 2025-11-03  
**Mantido por**: Equipe de Desenvolvimento
