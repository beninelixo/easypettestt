# Getting Started - EasyPet

## Pré-requisitos

- Node.js 18+
- npm ou bun
- Conta no Supabase (via Lovable Cloud)

## Instalação

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd easypet
```

### 2. Instale Dependências

```bash
npm install
# ou
bun install
```

### 3. Variáveis de Ambiente

O projeto usa Lovable Cloud, então as variáveis são configuradas automaticamente:

```env
VITE_SUPABASE_URL=<auto>
VITE_SUPABASE_PUBLISHABLE_KEY=<auto>
VITE_SUPABASE_PROJECT_ID=<auto>
```

### 4. Execute o Projeto

```bash
npm run dev
```

Acesse: `http://localhost:5173`

## Estrutura do Projeto

```
├── docs/               # Documentação
├── public/             # Assets estáticos
├── src/
│   ├── components/     # Componentes React
│   │   ├── ui/         # Componentes base (shadcn)
│   │   └── ...         # Componentes específicos
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilitários
│   ├── pages/          # Páginas/rotas
│   ├── integrations/   # Supabase client/types
│   └── routes/         # Configuração de rotas
├── supabase/
│   ├── functions/      # Edge Functions
│   └── migrations/     # Migrações SQL
└── tests/              # Testes E2E
```

## Primeiro Acesso

### Criar Usuário Admin

1. Acesse `/auth`
2. Crie uma conta com email válido
3. Execute SQL para promover a admin:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('<user-id>', 'admin');
```

### Criar Pet Shop

1. Faça login como pet_shop ou admin
2. Acesse `/professional/dashboard`
3. Preencha os dados do estabelecimento

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run test` | Executa testes |
| `npm run lint` | Verifica código |

## Fluxo de Desenvolvimento

1. Crie branch da feature: `git checkout -b feature/nova-feature`
2. Faça commits atômicos
3. Execute testes localmente
4. Abra PR para review
5. Merge após aprovação

## Troubleshooting

### Erro de Conexão Supabase

- Verifique se Lovable Cloud está ativo
- Confirme que as variáveis de ambiente estão corretas

### Erro de RLS

- Verifique se o usuário tem role atribuída
- Confirme policies na tabela específica

### Erro de Build

```bash
# Limpe cache
rm -rf node_modules/.vite
npm run build
```

## Próximos Passos

- [Arquitetura do Sistema](../architecture/SYSTEM_OVERVIEW.md)
- [Guia de Segurança](../security/SECURITY_GUIDE.md)
- [Troubleshooting](../guides/TROUBLESHOOTING.md)
