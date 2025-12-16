# Security Guide - EasyPet

## Visão Geral

O EasyPet implementa múltiplas camadas de segurança para proteger dados de usuários e pet shops.

## Autenticação

### Supabase Auth

- Email/senha com validação forte
- Google OAuth (configuração manual necessária)
- Tokens JWT com refresh automático
- Sessões persistentes com auto-refresh

### Política de Senhas

```
Mínimo 10 caracteres
├── Pelo menos 1 maiúscula
├── Pelo menos 1 minúscula
├── Pelo menos 1 número
└── Pelo menos 1 símbolo especial
```

### Rate Limiting

```typescript
// Limites de tentativas de login
{
  maxAttempts: 3,        // Por email em 15 minutos
  ipMaxAttempts: 5,      // Por IP em 15 minutos
  blockDuration: 30,     // Minutos de bloqueio
}
```

## Autorização (RBAC)

### Roles

| Role | Descrição | Permissões |
|------|-----------|------------|
| `super_admin` | Administrador master | Acesso total |
| `admin` | Administrador | Gestão do sistema |
| `pet_shop` | Dono de pet shop | CRUD próprio negócio |
| `client` | Cliente | Visualiza próprios dados |

### God Mode

Usuário especial com bypass de RLS:
- Hardcoded via função SQL `is_god_user()`
- Não pode ser modificado via UI
- Usado apenas para debugging/emergências

## Row Level Security (RLS)

### Padrão de Políticas

```sql
-- Visualização: próprios dados ou do tenant
CREATE POLICY "Users view own data" ON table_name
FOR SELECT USING (
  user_id = auth.uid() OR
  pet_shop_id IN (SELECT pet_shop_id FROM user_pet_shops WHERE user_id = auth.uid())
);

-- Inserção: validação de ownership
CREATE POLICY "Users insert own data" ON table_name
FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
```

### Tabelas Sensíveis

- `profiles`: Dados pessoais protegidos
- `payments`: Dados financeiros restritos
- `pets`: Histórico médico protegido
- `pet_shops`: Dados de negócio isolados

## Validação de Input

### Zod Schemas

```typescript
// Todas as entradas são validadas
const appointmentSchema = z.object({
  pet_id: z.string().uuid(),
  service_id: z.string().uuid(),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}$/),
});
```

### Edge Functions

- Todas as 27 funções implementam validação Zod
- Schemas centralizados em cada função
- Erros de validação retornam 400

## Proteção contra Ataques

### XSS

- DOMPurify para sanitização HTML
- Encoding automático pelo React
- CSP headers configurados

### CSRF

- Tokens em formulários críticos
- Validação server-side
- SameSite cookies

### SQL Injection

- Queries parametrizadas via Supabase SDK
- Validação de tipos com TypeScript
- RLS como camada adicional

### Brute Force

- Rate limiting por IP e email
- Bloqueio temporário após falhas
- Alertas para admins

## Logs e Auditoria

### Logs Estruturados

```typescript
// Tabela structured_logs
{
  level: 'info' | 'warn' | 'error' | 'critical',
  module: string,
  message: string,
  context: JSON,
  user_id: UUID,
  ip_address: string,
  created_at: timestamp
}
```

### Audit Trail

- Todas as mudanças críticas são logadas
- Logs de autenticação detalhados
- Histórico de alterações de roles

## Compliance

### LGPD

- Consentimento de cookies
- Export de dados pessoais
- Soft deletion com retenção
- Política de privacidade

### Backup

- Backup diário automático às 03:30
- Retenção de 30 dias
- Criptografia em repouso

## Checklist de Segurança

- [x] RLS em todas as tabelas
- [x] Validação Zod em edge functions
- [x] Rate limiting de autenticação
- [x] Logging estruturado
- [x] Política de senhas forte
- [x] CSRF protection
- [x] XSS sanitization
- [x] Soft deletion
- [x] Audit logging
- [x] Backup automático
