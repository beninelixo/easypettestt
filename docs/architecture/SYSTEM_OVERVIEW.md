# System Overview - EasyPet

## Arquitetura Geral

O EasyPet é uma aplicação web moderna construída com arquitetura cliente-servidor, utilizando React no frontend e Supabase como backend-as-a-service.

## Componentes Principais

### Frontend (React + TypeScript)

```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
├─────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────────┐   │
│  │   Pages     │  │    Components       │   │
│  │  (Routes)   │  │   (Reusable UI)     │   │
│  └─────────────┘  └─────────────────────┘   │
│  ┌─────────────┐  ┌─────────────────────┐   │
│  │   Hooks     │  │      Context        │   │
│  │  (Logic)    │  │   (Global State)    │   │
│  └─────────────┘  └─────────────────────┘   │
│  ┌─────────────────────────────────────────┐│
│  │           React Query (Cache)           ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│              Supabase Client                │
└─────────────────────────────────────────────┘
```

### Backend (Supabase)

```
┌─────────────────────────────────────────────┐
│                 Supabase                     │
├─────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────────┐   │
│  │   Auth      │  │   Edge Functions    │   │
│  │  (JWT)      │  │   (Deno Runtime)    │   │
│  └─────────────┘  └─────────────────────┘   │
│  ┌─────────────┐  ┌─────────────────────┐   │
│  │  Database   │  │     Storage         │   │
│  │ (PostgreSQL)│  │   (S3-compatible)   │   │
│  └─────────────┘  └─────────────────────┘   │
│  ┌─────────────────────────────────────────┐│
│  │           Realtime (WebSockets)         ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

## Fluxo de Dados

### Autenticação

1. Usuário faz login via Supabase Auth
2. JWT token é armazenado no localStorage
3. Token é enviado em todas as requisições
4. RLS policies validam acesso aos dados

### Multi-Tenancy

O sistema usa `pet_shop_id` como contexto de tenant:

- Cada pet shop é um tenant isolado
- RLS policies filtram dados por tenant
- Funcionários herdam o tenant do pet shop

### Roles e Permissões

```
super_admin → Acesso total ao sistema
    │
admin → Gestão do sistema
    │
pet_shop → Dono de pet shop (CRUD próprio negócio)
    │
client → Cliente (visualiza próprios dados)
```

## Módulos do Sistema

### 1. Gestão de Agendamentos
- CRUD de appointments
- Calendário visual
- Notificações automáticas

### 2. Cadastro de Pets
- Informações básicas
- Histórico médico
- Fotos

### 3. Serviços
- Catálogo de serviços
- Preços e duração
- Comissões

### 4. Financeiro
- Pagamentos
- Relatórios
- Faturamento

### 5. Marketing
- Campanhas
- Loyalty points
- Notificações

## Edge Functions

27 funções para lógica de negócio:

| Função | Descrição |
|--------|-----------|
| `login-with-rate-limit` | Login com rate limiting |
| `send-appointment-reminders` | Envio de lembretes |
| `daily-health-check` | Verificação diária do sistema |
| `backup-full-database` | Backup completo |
| ... | ... |

## Segurança

- **RLS**: Row Level Security em todas as tabelas
- **JWT**: Tokens com expiração
- **Rate Limiting**: Proteção contra brute force
- **Input Validation**: Zod em todas as entradas
- **CSRF Protection**: Tokens em forms críticos

## Performance

- **React Query**: Cache de 5-10 minutos
- **Code Splitting**: Lazy loading por rota
- **Image Optimization**: Lazy loading + WebP
- **Database Indexes**: Em colunas frequentes
