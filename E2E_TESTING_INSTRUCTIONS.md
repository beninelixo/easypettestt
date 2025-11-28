# 🧪 Instruções para Executar Testes E2E (End-to-End)

## 📋 Pré-requisitos

Antes de executar os testes, certifique-se de que você tem:

1. ✅ Node.js instalado (versão 16 ou superior)
2. ✅ Projeto EasyPet clonado localmente
3. ✅ Dependências instaladas (`npm install` ou `bun install`)
4. ✅ Backend Lovable Cloud configurado e rodando
5. ✅ Contas de teste criadas no banco de dados

---

## 🚀 Como Executar os Testes

### **Executar TODOS os testes E2E:**

```bash
npm run test:e2e
```

ou com Bun:

```bash
bun run test:e2e
```

### **Executar testes em modo UI (interface visual):**

```bash
npm run test:e2e:ui
```

Isso abrirá uma interface onde você pode:
- Ver os testes rodando em tempo real
- Debugar testes que falharam
- Ver screenshots e vídeos das execuções

### **Executar apenas testes de autenticação:**

```bash
npx playwright test tests/e2e/auth-*.spec.ts
```

### **Executar apenas testes de segurança:**

```bash
npx playwright test tests/e2e/security-*.spec.ts
```

### **Executar um arquivo de teste específico:**

```bash
npx playwright test tests/e2e/auth-invalid-credentials.spec.ts
```

---

## 📂 Arquivos de Teste Relevantes

### **Testes de Autenticação:**

1. **`auth-invalid-credentials.spec.ts`**
   - ✅ Valida email inválido
   - ✅ Valida senha incorreta
   - ✅ Rate limiting após múltiplas tentativas
   - ✅ Validação de formato de email
   - ✅ Validação de tamanho mínimo de senha

2. **`auth-protected-routes.spec.ts`**
   - ✅ Redireciona usuários não autenticados para /auth
   - ✅ Impede clientes de acessar rotas de admin
   - ✅ Impede acesso entre roles diferentes
   - ✅ Permite admin acessar todas as rotas

3. **`auth-role-delay.spec.ts`**
   - ✅ Lida com atraso na resolução de roles
   - ✅ Safety net após timeout de role
   - ✅ Loading state durante fetch de role

4. **`auth-menu-visibility.spec.ts`**
   - ✅ Admin vê menu de admin
   - ✅ Pet shop vê menu de serviços
   - ✅ Menus não desaparecem após navegação

### **Testes de Segurança:**

5. **`security-validation.spec.ts`**
   - ✅ Rejeita tentativas de XSS (Cross-Site Scripting)
   - ✅ Rejeita SQL injection
   - ✅ Valida requisitos de senha forte
   - ✅ Valida formato de CPF
   - ✅ Sanitiza HTML em inputs
   - ✅ Rate limiting em tentativas de login
   - ✅ Valida formato de telefone
   - ✅ Rejeita URLs inválidas

---

## 🔐 Contas de Teste Necessárias

Para os testes funcionarem, você precisa ter estas contas criadas no banco:

### **Admin:**
- Email: `beninelixo@gmail.com`
- Senha: `SenhaForte123`
- Role: `admin`

### **Cliente:**
- Email: `cliente@test.com`
- Senha: `SenhaCliente123`
- Role: `client`

### **Pet Shop:**
- Email: `petshop@test.com`
- Senha: `SenhaPetShop123`
- Role: `pet_shop`

---

## 📊 Relatórios de Teste

Após executar os testes, você pode ver os relatórios:

### **HTML Report (recomendado):**

```bash
npx playwright show-report
```

Isso abrirá um relatório visual no navegador com:
- ✅ Status de cada teste (passou/falhou)
- 📸 Screenshots dos testes
- 🎬 Vídeos das execuções (se configurado)
- 📜 Logs detalhados

### **Relatório JSON:**

Os resultados também são salvos em `test-results/` no formato JSON.

---

## 🐛 Debugando Testes que Falharam

### **Modo Debug:**

```bash
npx playwright test --debug
```

Isso abrirá o Playwright Inspector onde você pode:
- Pausar a execução
- Avançar passo a passo
- Inspecionar elementos da página
- Ver o console do navegador

### **Ver apenas testes que falharam:**

```bash
npx playwright test --only-failed
```

### **Executar com headed mode (ver o navegador):**

```bash
npx playwright test --headed
```

---

## 🔧 Configuração dos Testes

Os testes estão configurados em `playwright.config.ts`:

- **Timeout:** 30 segundos por teste
- **Retry:** 2 tentativas automáticas em caso de falha
- **Browsers:** Chromium, Firefox, WebKit
- **Screenshots:** On failure
- **Videos:** On first retry

---

## ✅ O que os Testes Verificam

### **Fluxos de Autenticação:**
- ✅ Login com credenciais válidas
- ✅ Logout funcional
- ✅ Redirecionamento após login baseado em role
- ✅ Persistência de sessão
- ✅ Proteção de rotas

### **Validações de Segurança:**
- ✅ XSS prevention
- ✅ SQL injection protection
- ✅ Input sanitization
- ✅ Rate limiting
- ✅ Password strength requirements
- ✅ CSRF token validation

### **Permissões e Roles:**
- ✅ Admin pode acessar admin dashboard
- ✅ Cliente não pode acessar admin routes
- ✅ Pet shop pode gerenciar seus recursos
- ✅ Funcionários têm permissões corretas

---

## 📈 Coverage Report

Para ver a cobertura de testes:

```bash
npx playwright test --reporter=html
```

---

## 🚨 Problemas Comuns

### **Erro: "Timeout 30000ms exceeded"**
**Solução:** Aumente o timeout no `playwright.config.ts` ou verifique se o servidor está respondendo lentamente.

### **Erro: "Element not found"**
**Solução:** Execute com `--headed` para ver o que está acontecendo visualmente. Pode ser um problema de seletor CSS.

### **Erro: "Test account not found"**
**Solução:** Certifique-se de que as contas de teste existem no banco de dados com as credenciais corretas.

### **Testes falhando randomicamente**
**Solução:** Verifique se há race conditions. Use `page.waitForLoadState('networkidle')` para esperar requisições finalizarem.

---

## 📝 Adicionando Novos Testes

Para criar um novo teste:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Meu Novo Teste', () => {
  test('deve fazer algo', async ({ page }) => {
    await page.goto('/minha-rota');
    
    // Seu teste aqui
    await expect(page.locator('h1')).toContainText('Título Esperado');
  });
});
```

Salve em `tests/e2e/meu-teste.spec.ts`

---

## 🎯 Melhores Práticas

1. ✅ **Use data-testid** em elementos importantes ao invés de classes CSS
2. ✅ **Limpe o estado** antes e depois dos testes
3. ✅ **Use fixtures** para setup/teardown comum
4. ✅ **Evite sleeps** - use `waitFor` ao invés de `setTimeout`
5. ✅ **Teste um conceito por teste** - não teste múltiplas funcionalidades em um único teste

---

## 🔗 Recursos Úteis

- [Documentação do Playwright](https://playwright.dev/docs/intro)
- [Seletores CSS](https://playwright.dev/docs/selectors)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Test Generator](https://playwright.dev/docs/codegen) - gera testes automaticamente gravando suas ações

---

**Status dos Testes:** ✅ Suite completa implementada cobrindo autenticação, segurança e permissões.
