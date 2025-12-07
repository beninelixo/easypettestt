# Guia de Contribuição - EasyPet

Obrigado por seu interesse em contribuir com o EasyPet! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Commits e Pull Requests](#commits-e-pull-requests)
- [Testes](#testes)
- [Documentação](#documentação)

## 📜 Código de Conduta

Este projeto adota um Código de Conduta para garantir um ambiente acolhedor para todos. Esperamos que todos os participantes:

- Usem linguagem acolhedora e inclusiva
- Respeitem diferentes pontos de vista e experiências
- Aceitem críticas construtivas com elegância
- Foquem no que é melhor para a comunidade
- Mostrem empatia com outros membros da comunidade

## 🚀 Como Contribuir

### Reportando Bugs

1. Verifique se o bug já não foi reportado nas [Issues](../../issues)
2. Se não encontrar, crie uma nova issue com:
   - Título claro e descritivo
   - Passos detalhados para reproduzir
   - Comportamento esperado vs. atual
   - Screenshots, se aplicável
   - Ambiente (navegador, SO, versão)

### Sugerindo Melhorias

1. Crie uma issue com tag `enhancement`
2. Descreva a melhoria claramente
3. Explique por que seria útil para a maioria dos usuários
4. Inclua mockups ou exemplos, se possível

### Contribuindo com Código

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça suas alterações seguindo os padrões de código
4. Escreva testes para novas funcionalidades
5. Garanta que todos os testes passem
6. Commit suas alterações com mensagens claras
7. Push para sua branch
8. Abra um Pull Request

## ⚙️ Configuração do Ambiente

### Pré-requisitos

- Node.js 18+ (recomendado: 20 LTS)
- npm 9+ ou bun
- Git

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/easypet.git

# Entre no diretório
cd easypet

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente

Crie um arquivo `.env.local` baseado no `.env.example`:

```bash
cp .env.example .env.local
```

## 📝 Padrões de Código

### TypeScript

- **Strict mode** habilitado
- Interfaces para todas as entidades
- Tipos explícitos para props de componentes
- Evitar `any` - usar `unknown` se necessário

```typescript
// ✅ Bom
interface UserProps {
  name: string;
  email: string;
  onSave: (user: User) => void;
}

// ❌ Evitar
const handleClick = (data: any) => { ... }
```

### Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componentes | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase | `useAuth.ts` |
| Utilitários | camelCase | `formatDate.ts` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| CSS/Variáveis | kebab-case | `--primary-color` |

### Estrutura de Componentes

```tsx
// 1. Imports (react, libs, local)
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
}

// 3. Component
export function MyComponent({ title }: ComponentProps) {
  // 3.1 Hooks
  const { data } = useQuery(...);

  // 3.2 Handlers
  const handleClick = () => { ... };

  // 3.3 Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Ação</Button>
    </div>
  );
}
```

### CSS/Tailwind

- Usar tokens do design system (não cores diretas)
- Classes utilitárias para layout simples
- Componentes para estilos complexos/reutilizáveis

```tsx
// ✅ Bom - usa tokens
<div className="bg-primary text-primary-foreground">

// ❌ Evitar - cores diretas
<div className="bg-blue-500 text-white">
```

## 📦 Commits e Pull Requests

### Mensagens de Commit

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(escopo): descrição curta

[corpo opcional]

[rodapé opcional]
```

Tipos:
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não altera código)
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Manutenção

Exemplos:
```bash
feat(auth): implementa login com Google
fix(appointments): corrige validação de conflito de horários
docs(readme): adiciona instruções de instalação
```

### Pull Requests

1. Título claro seguindo Conventional Commits
2. Descrição detalhada das alterações
3. Link para issue relacionada (se houver)
4. Screenshots para alterações visuais
5. Checklist:
   - [ ] Código segue os padrões do projeto
   - [ ] Testes adicionados/atualizados
   - [ ] Documentação atualizada
   - [ ] Sem erros de lint

## 🧪 Testes

### Executando Testes

```bash
# Testes unitários (Vitest)
npm run test

# Testes com watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Testes E2E (Playwright)
npm run test:e2e
```

### Escrevendo Testes

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render title correctly', () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Cobertura Mínima

- Funções utilitárias: 100%
- Hooks: 80%
- Componentes críticos: 70%

## 📚 Documentação

- Documente funções públicas com JSDoc
- Mantenha o README atualizado
- Atualize o CHANGELOG para alterações significativas

```typescript
/**
 * Valida um CPF brasileiro
 * @param cpf - CPF com 11 dígitos (apenas números)
 * @returns true se válido, false caso contrário
 * @example
 * validateCPF('12345678909') // false
 * validateCPF('52998224725') // true
 */
export function validateCPF(cpf: string): boolean {
  // ...
}
```

---

## 🙏 Agradecimentos

Agradecemos a todos que contribuem para tornar o EasyPet melhor!

Se tiver dúvidas, abra uma issue ou entre em contato com os mantenedores.
