# EasyPet Documentation

Sistema de gestão para petshops e clínicas veterinárias.

## Quick Start

- [Getting Started](./setup/GETTING_STARTED.md) - Configuração inicial do projeto
- [Local Development](./setup/LOCAL_DEVELOPMENT.md) - Desenvolvimento local

## Architecture

- [System Overview](./architecture/SYSTEM_OVERVIEW.md) - Visão geral da arquitetura
- [Database Schema](./architecture/DATABASE_SCHEMA.md) - Esquema do banco de dados
- [API Documentation](./architecture/API_DOCS.md) - Documentação das APIs

## Security

- [Security Guide](./security/SECURITY_GUIDE.md) - Guia completo de segurança
- [Authentication](./security/AUTHENTICATION.md) - Sistema de autenticação
- [RBAC System](./security/RBAC.md) - Controle de acesso baseado em roles

## Guides

- [Running Migrations](./guides/MIGRATIONS.md) - Como executar migrações
- [Testing Guide](./guides/TESTING.md) - Guia de testes
- [Deployment](./guides/DEPLOYMENT.md) - Deploy em produção
- [Troubleshooting](./guides/TROUBLESHOOTING.md) - Resolução de problemas

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **State:** React Query + Context API
- **Forms:** React Hook Form + Zod

## Project Structure

```
src/
├── components/     # Componentes React reutilizáveis
├── hooks/          # Custom hooks
├── lib/            # Utilitários e configurações
├── pages/          # Páginas da aplicação
├── integrations/   # Integrações (Supabase, etc)
└── types/          # TypeScript types
```

## Contributing

1. Clone o repositório
2. Instale dependências: `npm install`
3. Configure variáveis de ambiente
4. Execute: `npm run dev`

## License

Proprietary - All rights reserved.
