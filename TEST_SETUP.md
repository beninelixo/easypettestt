# 🧪 Setup de Testes - EasyPet

## Scripts de Teste

Adicione estes scripts ao seu `package.json`:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:report": "playwright show-report",
    "test:integration": "deno test --allow-net --allow-env supabase/functions/_tests/",
    "test:all": "npm run test && npm run test:integration",
    "test:ci": "playwright test --reporter=json,html"
  }
}
```

## 🎯 Testes E2E Implementados (Total: 10 arquivos)

### Testes de Autenticação (Existentes)
1. ✅ **auth-admin-redirect.spec.ts** - Redirecionamento de admin após login
2. ✅ **auth-client-redirect.spec.ts** - Redirecionamento de cliente após login
3. ✅ **auth-role-delay.spec.ts** - Tratamento de delays na resolução de roles
4. ✅ **auth-logout.spec.ts** - Processo de logout
5. ✅ **auth-protected-routes.spec.ts** - Proteção de rotas autenticadas
6. ✅ **auth-invalid-credentials.spec.ts** - Validação de credenciais inválidas
7. ✅ **auth-menu-visibility.spec.ts** - Visibilidade de menus após login
8. ✅ **auth-session-persistence.spec.ts** - Persistência de sessão

### Testes de Cadastro (NOVOS) 🆕
9. ✅ **auth-registration-client.spec.ts** - Fluxo completo de cadastro de cliente
   - Validação de campos obrigatórios
   - Validação de força de senha
   - Confirmação de senha
   - Formato de email
   - Aceitação de termos
   
10. ✅ **auth-registration-petshop.spec.ts** - Fluxo completo de cadastro de pet shop
    - Validação de campos específicos de pet shop
    - Validação de formato de estado (2 letras)
    - Auto-capitalização de estado
    - Alternância entre tipos de usuário

## 🔧 Testes de Integração (Deno)

### Arquivo Principal
- ✅ **edge-functions-integration.test.ts** - Testes de edge functions críticas
  - Validação de schemas Zod
  - Prevenção de SQL injection
  - Prevenção de XSS
  - Validação de tamanhos de input (DoS protection)

### Edge Functions Testadas
1. `validate-login` - Validação de tentativas de login
2. `record-login-attempt` - Registro de tentativas
3. `login-with-rate-limit` - Login com rate limiting
4. `send-notification` - Envio de notificações
5. `send-appointment-reminders` - Lembretes de agendamento
6. `reset-password` - Reset de senha
7. `verify-mfa-token` - Verificação de token MFA

## 🚀 Comandos de Teste

### Executar Todos os Testes
```bash
npm run test:all
```

### Testes E2E (Playwright)
```bash
# Modo headless (padrão)
npm test

# Modo UI (recomendado para desenvolvimento)
npm run test:ui

# Modo headed (ver o browser)
npm run test:headed

# Modo debug
npm run test:debug

# Ver relatório HTML
npm run test:report
```

### Testes de Integração (Deno)
```bash
# Todos os testes de integração
npm run test:integration

# Teste específico
deno test --allow-net --allow-env supabase/functions/_tests/edge-functions-integration.test.ts

# Com output detalhado
deno test --allow-net --allow-env --trace-ops supabase/functions/_tests/
```

### Testes Específicos
```bash
# Testar apenas cadastro de cliente
npx playwright test auth-registration-client

# Testar apenas cadastro de pet shop
npx playwright test auth-registration-petshop

# Testar apenas autenticação
npx playwright test auth-admin-redirect auth-client-redirect

# Testar apenas validações
npx playwright test auth-invalid-credentials
```

## 🤖 GitHub Actions CI/CD

### Workflows Configurados

#### 1. **playwright-tests.yml** - Testes Automatizados
- ✅ Executa testes E2E em push/PR
- ✅ Executa testes de integração Deno
- ✅ Gera relatórios em artifacts
- ✅ Bloqueia merge se testes falharem

#### 2. **code-quality.yml** - Qualidade de Código
- ✅ TypeScript type checking
- ✅ ESLint
- ✅ Build verification
- ✅ Coverage reports

### Status Badges
Adicione ao README.md:
```markdown
![E2E Tests](https://github.com/SEU_USUARIO/SEU_REPO/workflows/E2E%20%26%20Integration%20Tests/badge.svg)
![Code Quality](https://github.com/SEU_USUARIO/SEU_REPO/workflows/Code%20Quality%20%26%20Linting/badge.svg)
```

## 📋 Pull Request Template

Template criado em `.github/PULL_REQUEST_TEMPLATE.md` com:
- ✅ Checklist obrigatório de testes
- ✅ Validação de segurança
- ✅ Categorização de mudanças
- ✅ Requisitos de qualidade

## 🎯 Metas de Cobertura

### Atual
- E2E: 10 suítes de teste cobrindo fluxos críticos
- Integration: 8 edge functions críticas
- Security: Validação de input em todas as edge functions

### Target
- **E2E Coverage**: >80% dos fluxos de usuário
- **Integration Coverage**: 100% das edge functions críticas
- **Security Tests**: 100% de prevenção de injection attacks

## 🔒 Segurança nos Testes

### Validações Implementadas
✅ SQL Injection prevention  
✅ XSS prevention  
✅ DoS attack prevention (input length limits)  
✅ Email format validation  
✅ Password strength validation  
✅ UUID format validation  
✅ Date format validation  

## 📊 Relatórios

### Playwright HTML Report
```bash
npm run test:report
```
Abre em: `http://localhost:9323`

### GitHub Actions Artifacts
- Playwright Report (7 dias de retenção)
- Test Results (7 dias de retenção)
- Coverage Reports

## 🚨 Troubleshooting

### Testes E2E Falhando
```bash
# Limpar cache do Playwright
npx playwright install --force

# Rodar em modo debug
npm run test:debug

# Ver screenshots de falhas
ls test-results/
```

### Testes de Integração Falhando
```bash
# Verificar versão do Deno
deno --version

# Reinstalar Deno
curl -fsSL https://deno.land/install.sh | sh

# Rodar com logs detalhados
deno test --allow-all --log-level=debug supabase/functions/_tests/
```

## 📚 Documentação

- [Playwright Docs](https://playwright.dev/)
- [Deno Testing](https://deno.land/manual/testing)
- [Zod Validation](https://zod.dev/)
- [GitHub Actions](https://docs.github.com/actions)

---

**✅ Setup completo! Todos os testes estão prontos para execução local e CI/CD.**
