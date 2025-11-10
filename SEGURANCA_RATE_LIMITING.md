# 🔒 Sistema de Rate Limiting - Segurança Aprimorada

## 📋 Visão Geral

Este documento descreve o sistema de **Rate Limiting** implementado para proteger o sistema contra ataques de força bruta e bots automatizados.

**Data da última atualização**: 2025-01-10

---

## 🎯 Objetivo

Proteger o sistema contra:
- ✅ Ataques de força bruta em login/registro
- ✅ Bots automatizados
- ✅ Abuse de APIs
- ✅ Tentativas massivas de acesso não autorizado

---

## 🔐 Regras de Rate Limiting

### **Login - Proteção por Email**
```
📧 Email-Based Limit:
- Máximo: 3 tentativas falhadas
- Janela: 15 minutos
- Ação: Bloqueio temporário de 30 minutos
```

### **Login - Proteção por IP**
```
🌐 IP-Based Limit:
- Máximo: 5 tentativas falhadas
- Janela: 15 minutos  
- Ação: Bloqueio automático do IP por 30 minutos
```

### **Bloqueio Automático**
Após atingir os limites:
- O IP é adicionado à tabela `blocked_ips`
- Bloqueio dura **30 minutos**
- Alerta de segurança é criado automaticamente
- Log estruturado é registrado

---

## 📊 Fluxo de Validação

```
┌─────────────────┐
│  Usuário tenta  │
│    fazer login  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  1. Validar dados Zod   │
│  (email, senha)         │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────┐
│  2. Edge Function:       │
│  validate-login          │
│  - Checar IP bloqueado   │
│  - Checar rate limit     │
│    (email e IP)          │
└────────┬─────────────────┘
         │
    ┌────┴────┐
    │ Bloqueado? │
    └────┬─────┘
    ├─ SIM ───► ❌ Retorna 429 (Too Many Requests)
    │              Mensagem: "IP bloqueado / Muitas tentativas"
    │
    └─ NÃO ───► ✅ Continua para autenticação
                  ▼
         ┌──────────────────┐
         │  3. Autenticar   │
         │  via Supabase    │
         └────────┬─────────┘
                  │
         ┌────────┴────────┐
         │ Sucesso?        │
         └────────┬────────┘
         ├─ SIM ──► ✅ Resetar contador de falhas
         │            Fazer login
         │
         └─ NÃO ──► ❌ Incrementar tentativas
                      Se >= 3 → Avisar usuário
                      Registrar em login_attempts
```

---

## 🗄️ Tabelas Envolvidas

### **1. login_attempts**
Registra todas as tentativas de login:
```sql
CREATE TABLE login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  attempt_time TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### **2. blocked_ips**
IPs bloqueados automaticamente:
```sql
CREATE TABLE blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  blocked_until TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  auto_blocked BOOLEAN DEFAULT true
);
```

### **3. security_alerts**
Alertas de segurança gerados:
```sql
CREATE TABLE security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  description TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### **4. structured_logs (NOVO)**
Logs estruturados para auditoria:
```sql
CREATE TABLE structured_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL, -- 'debug', 'info', 'warn', 'error', 'critical'
  module TEXT NOT NULL,
  message TEXT NOT NULL,
  context JSONB,
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🚀 Edge Functions

### **validate-login**
Valida tentativas de login antes da autenticação.

**Localização**: `supabase/functions/validate-login/index.ts`

**Principais Verificações**:
```typescript
1. IP está bloqueado? (tabela blocked_ips)
   └─ Se SIM: Retorna 429

2. Email tem >= 3 tentativas falhadas em 15min?
   └─ Se SIM: Retorna 429

3. IP tem >= 5 tentativas em 15min?
   └─ Se SIM: Bloqueia IP automaticamente + Retorna 429

4. Tudo OK?
   └─ Retorna 200 (allowed: true)
```

**Exemplo de Resposta Bloqueada**:
```json
{
  "allowed": false,
  "reason": "Muitas tentativas falhadas. Tente novamente em 30 minutos."
}
```

---

### **record-login-attempt**
Registra todas as tentativas de login (sucesso ou falha).

**Localização**: `supabase/functions/record-login-attempt/index.ts`

**O que faz**:
- Insere registro em `login_attempts`
- Usado para análise posterior
- Não bloqueia a requisição

---

### **login-with-rate-limit**
Endpoint alternativo com rate limiting integrado.

**Localização**: `supabase/functions/login-with-rate-limit/index.ts`

**Características**:
- Valida credenciais
- Aplica rate limiting
- Registra tentativa automaticamente
- Retorna sessão se sucesso

---

## 📈 Monitoramento

### **Dashboard de Segurança**
Acesse: `/admin/security-monitoring`

**Métricas Exibidas**:
- 📊 Tentativas bloqueadas (últimas 24h)
- 🚫 IPs bloqueados ativos
- 🔍 Bots detectados
- ⚠️ Alertas críticos

### **Consultas Úteis**

#### Tentativas falhadas por email (últimas 24h):
```sql
SELECT email, COUNT(*) as tentativas
FROM login_attempts
WHERE success = false
  AND attempt_time > NOW() - INTERVAL '24 hours'
GROUP BY email
ORDER BY tentativas DESC;
```

#### IPs mais suspeitos:
```sql
SELECT ip_address, COUNT(*) as tentativas
FROM login_attempts
WHERE success = false
  AND attempt_time > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
HAVING COUNT(*) >= 5
ORDER BY tentativas DESC;
```

#### Alertas críticos não resolvidos:
```sql
SELECT alert_type, severity, description, created_at
FROM security_alerts
WHERE resolved = false
  AND severity = 'critical'
ORDER BY created_at DESC;
```

---

## 🛠️ Configuração

### **Ajustar Limites (se necessário)**

Editar: `supabase/functions/validate-login/index.ts`

```typescript
// Linha ~40: Email-based rate limiting
const emailThreshold = 3; // Padrão: 3 tentativas

// Linha ~60: IP-based rate limiting  
const ipThreshold = 5; // Padrão: 5 tentativas

// Linha ~75: Tempo de bloqueio
const blockDuration = 30 * 60 * 1000; // Padrão: 30min em ms
```

**⚠️ IMPORTANTE**: Valores muito baixos podem bloquear usuários legítimos!

---

## 📝 Logs Estruturados

### **Como Ler os Logs**

Acesse: `/admin/security-monitoring` > Aba "Logs"

**Níveis de Log**:
- `debug`: Informações de depuração
- `info`: Eventos normais
- `warn`: Avisos (ex: muitas tentativas)
- `error`: Erros (ex: falha na validação)
- `critical`: Críticos (ex: possível ataque)

**Exemplo de Log**:
```json
{
  "level": "warn",
  "module": "validate-login",
  "message": "Rate limit atingido para email",
  "context": {
    "email": "usuario@exemplo.com",
    "tentativas": 3,
    "janela": "15min"
  },
  "ip_address": "192.168.1.100",
  "created_at": "2025-01-10T10:30:00Z"
}
```

---

## 🔄 Desbloqueio Manual

### **Via SQL (Admin)**
```sql
-- Desbloquear IP específico
DELETE FROM blocked_ips WHERE ip_address = '192.168.1.100';

-- Resetar tentativas de email
DELETE FROM login_attempts 
WHERE email = 'usuario@exemplo.com'
  AND success = false;
```

### **Via Dashboard (FUTURO)**
- Implementar botão "Desbloquear" no dashboard
- Adicionar histórico de desbloqueios

---

## 🎯 Métricas de Sucesso

**Objetivos**:
- ✅ Taxa de bloqueios legítimos > 95%
- ✅ Taxa de falsos positivos < 2%
- ✅ Tempo de resposta < 200ms
- ✅ 0 ataques de força bruta bem-sucedidos

**Como Medir**:
```sql
-- Taxa de sucesso do rate limiting
SELECT 
  COUNT(CASE WHEN success = false THEN 1 END) * 100.0 / COUNT(*) as taxa_bloqueio
FROM login_attempts
WHERE attempt_time > NOW() - INTERVAL '7 days';
```

---

## 🆘 Troubleshooting

### **Problema**: Usuário legítimo está bloqueado

**Solução**:
1. Verificar se IP está em `blocked_ips`
2. Remover bloqueio manualmente (SQL acima)
3. Instruir usuário a aguardar 30min ou usar outro IP/rede

---

### **Problema**: Muitos falsos positivos

**Solução**:
1. Revisar thresholds (aumentar para 5 tentativas email, 8 IP)
2. Reduzir tempo de bloqueio para 15min
3. Adicionar whitelist de IPs confiáveis

---

### **Problema**: Logs não aparecem no dashboard

**Solução**:
1. Verificar RLS da tabela `structured_logs`
2. Confirmar que usuário tem role `admin`
3. Checar se Edge Functions estão logando corretamente

---

## 📚 Referências

- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Rate Limiting Best Practices**: https://www.nginx.com/blog/rate-limiting-nginx/
- **OWASP Brute Force**: https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks

---

## ✅ Checklist de Implementação

- [x] Tabela `login_attempts` criada
- [x] Tabela `blocked_ips` criada
- [x] Tabela `security_alerts` criada
- [x] Tabela `structured_logs` criada
- [x] Edge Function `validate-login` com rate limiting
- [x] Edge Function `record-login-attempt`
- [x] Frontend: Avisos após 2 tentativas falhadas
- [x] Dashboard de segurança com métricas
- [ ] Testes automatizados de rate limiting
- [ ] Whitelist de IPs confiáveis
- [ ] Notificações por email em bloqueios críticos

---

**Última Atualização**: 2025-01-10  
**Responsável**: Sistema de Segurança EasyPet  
**Status**: ✅ Ativo e Funcional
