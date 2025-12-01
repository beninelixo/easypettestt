# Guia de Testes de Segurança - EasyPet

Este documento descreve a estratégia completa de testes de segurança implementada no sistema EasyPet.

## Índice

1. [Visão Geral](#visão-geral)
2. [Testes Implementados](#testes-implementados)
3. [Execução dos Testes](#execução-dos-testes)
4. [CI/CD Integration](#cicd-integration)
5. [Vulnerabilidades Cobertas](#vulnerabilidades-cobertas)

## Visão Geral

O sistema EasyPet implementa testes automatizados de segurança em múltiplas camadas:

- **Testes E2E com Playwright**: Validação de comportamentos de segurança na interface
- **Testes de Integração**: Validação de edge functions e APIs
- **Análise Estática**: CodeQL e Snyk para detecção de vulnerabilidades
- **Auditorias de Dependências**: npm audit para pacotes vulneráveis

## Testes Implementados

### 1. Validação de Input (security-validation.spec.ts)

**Cobertura:**
- ✅ XSS (Cross-Site Scripting)
- ✅ SQL Injection
- ✅ Validação de senha forte
- ✅ Validação de CPF/CNPJ
- ✅ Sanitização de HTML
- ✅ Rate limiting de login
- ✅ Validação de telefone
- ✅ Validação de URLs

**Casos de Teste:**
```typescript
test('should reject XSS attempts in email field')
test('should reject SQL injection attempts')
test('should enforce strong password requirements')
test('should validate CPF format')
test('should sanitize HTML in text inputs')
test('should rate limit login attempts')
test('should validate phone number format')
test('should reject invalid URLs')
```

### 2. Testes Avançados de Segurança (security-advanced.spec.ts)

**Cobertura:**
- ✅ Proteção CSRF
- ✅ SQL Injection Avançado (múltiplos payloads)
- ✅ XSS Avançado (múltiplos vetores)
- ✅ Segurança de Autenticação
- ✅ Limites de Input
- ✅ Segurança de Sessão
- ✅ Bypass de Autorização
- ✅ Content Security Policy
- ✅ Segurança de Upload de Arquivos

**Casos de Teste:**
```typescript
// CSRF Protection
test('should include CSRF token in critical forms')
test('should reject requests without valid CSRF token')

// SQL Injection Advanced
test('should handle complex SQL injection attempts')

// XSS Protection
test('should sanitize script tags in all inputs')
test('should escape HTML entities')

// Authentication Security
test('should enforce account lockout after failed attempts')
test('should prevent timing attacks on login')

// Input Length Limits
test('should enforce maximum input lengths')
test('should prevent buffer overflow attempts')

// Session Security
test('should clear session on logout')
test('should prevent session fixation')

// Authorization Bypass
test('should prevent direct URL access to admin pages')
test('should prevent role escalation through client manipulation')

// Content Security Policy
test('should have strict CSP headers')

// File Upload Security
test('should validate file types on upload')
test('should enforce file size limits')
```

### 3. Proteção CSRF (csrf-protection.spec.ts)

**Cobertura:**
- ✅ Presença de tokens CSRF em formulários
- ✅ Validação de tokens CSRF
- ✅ Regeneração de tokens
- ✅ Tokens específicos de sessão
- ✅ Expiração de tokens
- ✅ Limpeza de tokens no logout

**Casos de Teste:**
```typescript
test('should include CSRF token in login form')
test('should include CSRF token in registration form')
test('should reject form submission without CSRF token')
test('should reject form submission with invalid CSRF token')
test('should regenerate CSRF token after failed submission')
test('CSRF token should be session-specific')
test('CSRF token should expire after timeout')
test('should clear CSRF token on logout')
test('should protect password reset form with CSRF')
test('should protect profile update form with CSRF')
```

### 4. Acesso Admin (admin-access.spec.ts)

**Cobertura:**
- ✅ CRUD completo de pet shops
- ✅ CRUD completo de usuários
- ✅ Acesso a relatórios globais
- ✅ Monitoramento de saúde do sistema
- ✅ Gerenciamento de permissões
- ✅ Bloqueio de acesso não-admin
- ✅ Execução de ações do sistema

**Casos de Teste:**
```typescript
test('admin should have full CRUD access to pet shops')
test('admin should have full CRUD access to users')
test('admin should be able to view all reports')
test('admin should have access to system health monitoring')
test('admin should be able to manage permissions')
test('non-admin should not access admin pages')
test('admin should be able to execute system actions')
```

### 5. Rotas Protegidas com Senha (protected-routes-settings.spec.ts)

**Cobertura:**
- ✅ Proteção de rotas sensíveis (Funcionários, Relatórios, Backup, Planos, Perfil)
- ✅ Autenticação por senha de configurações
- ✅ Limite de tentativas de senha
- ✅ Persistência de autenticação durante sessão
- ✅ Reset de autenticação no logout
- ✅ Visibilidade de rotas no sidebar

**Casos de Teste:**
```typescript
test('should protect employees page with settings password')
test('should protect reports page with settings password')
test('should protect backup page with settings password')
test('should protect plans page with settings password')
test('should protect profile page with settings password')
test('should allow access after correct password')
test('should block access after incorrect password')
test('should limit password attempts')
test('should not show protected routes in sidebar without authentication')
test('should reset password authentication on logout')
```

## Execução dos Testes

### Localmente

```bash
# Executar todos os testes de segurança
npm run test:security

# Executar teste específico
npx playwright test tests/e2e/security-validation.spec.ts
npx playwright test tests/e2e/security-advanced.spec.ts
npx playwright test tests/e2e/csrf-protection.spec.ts
npx playwright test tests/e2e/admin-access.spec.ts
npx playwright test tests/e2e/protected-routes-settings.spec.ts

# Modo debug
npx playwright test --debug tests/e2e/security-validation.spec.ts

# Com UI
npx playwright test --ui
```

### Auditoria de Dependências

```bash
# Executar npm audit
npm audit

# Corrigir vulnerabilidades automaticamente
npm audit fix

# Forçar correções (pode causar breaking changes)
npm audit fix --force
```

## CI/CD Integration

Os testes de segurança são executados automaticamente via GitHub Actions:

### Workflow: `.github/workflows/security-tests.yml`

**Gatilhos:**
- Push para `main` ou `develop`
- Pull requests para `main` ou `develop`
- Execução agendada diária às 3h da manhã

**Jobs:**
1. **security-tests**: Executa todos os testes E2E de segurança
2. **dependency-scan**: Executa Snyk para verificar vulnerabilidades
3. **code-scan**: Executa CodeQL para análise estática
4. **notification**: Notifica sobre falhas (configurar Slack/email)

### Configuração Necessária

Para habilitar todos os recursos, adicione os seguintes secrets no GitHub:

```
SNYK_TOKEN=<seu-token-snyk>
```

## Vulnerabilidades Cobertas

### OWASP Top 10 (2021)

| #  | Vulnerabilidade                          | Cobertura | Testes |
|----|------------------------------------------|-----------|--------|
| 1  | Broken Access Control                    | ✅        | admin-access.spec.ts, protected-routes-settings.spec.ts |
| 2  | Cryptographic Failures                   | ✅        | csrf-protection.spec.ts, security-advanced.spec.ts |
| 3  | Injection                                | ✅        | security-validation.spec.ts, security-advanced.spec.ts |
| 4  | Insecure Design                          | ✅        | security-advanced.spec.ts |
| 5  | Security Misconfiguration                | ✅        | security-advanced.spec.ts |
| 6  | Vulnerable and Outdated Components       | ✅        | npm audit, Snyk |
| 7  | Identification and Authentication Failures | ✅      | security-advanced.spec.ts |
| 8  | Software and Data Integrity Failures     | ✅        | csrf-protection.spec.ts |
| 9  | Security Logging and Monitoring Failures | ⚠️        | Parcial - Necessita monitoramento adicional |
| 10 | Server-Side Request Forgery (SSRF)       | ⚠️        | Parcial - Validação de URLs |

### Outras Vulnerabilidades

- ✅ XSS (Cross-Site Scripting)
- ✅ CSRF (Cross-Site Request Forgery)
- ✅ SQL Injection
- ✅ Command Injection
- ✅ Path Traversal
- ✅ Session Fixation
- ✅ Timing Attacks
- ✅ Buffer Overflow
- ✅ File Upload Vulnerabilities
- ✅ Rate Limiting

## Melhorias Futuras

### Planejado

1. **Penetration Testing Automatizado**
   - Integração com OWASP ZAP
   - Testes de fuzzing

2. **Monitoramento em Tempo Real**
   - Integração com Sentry para erros
   - Alertas de segurança via Slack/Email

3. **Testes de Performance**
   - Teste de carga para verificar DoS
   - Teste de stress em autenticação

4. **Auditoria de Logs**
   - Validação de logs de segurança
   - Detecção de anomalias

## Responsáveis

- **Testes de Segurança**: Equipe de Desenvolvimento
- **Revisão de Código**: Lead Developer
- **Auditorias Periódicas**: Security Team
- **Resposta a Incidentes**: DevOps Team

## Contato

Para reportar vulnerabilidades de segurança, entre em contato:
- Email: security@easypet.com
- Responsável: Security Team

## Última Atualização

Documento atualizado em: **2025-12-01**
Próxima revisão: **2025-12-31**
