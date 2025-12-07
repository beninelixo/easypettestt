# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não Lançado]

### Adicionado
- Cookie Consent Banner com opções granulares (LGPD compliance)
- Exportação de dados do usuário (LGPD Art. 18)
- Configuração de testes unitários com Vitest
- Testes unitários para validação de inputs
- Testes unitários para hook useCookieConsent
- Guia de contribuição (CONTRIBUTING.md)
- Este changelog

### Melhorado
- Documentação do README expandida
- Estrutura de pastas documentada
- Variáveis de ambiente documentadas
- Edge functions documentadas

---

## [1.0.0] - 2024-12-07

### Adicionado

#### Autenticação e Segurança
- Sistema de autenticação completo (login, registro, recuperação de senha)
- Autenticação com Google OAuth
- Rate limiting para login (3 tentativas/15min por email, 5/15min por IP)
- Bloqueio temporário de 30 minutos após exceder tentativas
- MFA/2FA com TOTP
- Hash de senhas com bcrypt
- Headers de segurança (CSP, HSTS, X-Frame-Options)
- Proteção CSRF com tokens
- Validação de inputs com Zod em todas as 27 edge functions
- RLS (Row Level Security) em todas as tabelas
- Sistema "God Mode" para admin master

#### Funcionalidades Core
- Dashboard profissional com métricas em tempo real
- Sistema de agendamentos com validação de conflitos
- Cadastro completo de pets (dados médicos, fotos, histórico)
- Gestão de serviços e preços
- Gestão de funcionários com permissões granulares
- Sistema de comissões
- Notificações por email, SMS e WhatsApp
- Backup automático diário
- Relatórios e exportação de dados

#### Cliente
- Dashboard do cliente com histórico
- Agendamento online
- Cancelamento de agendamentos
- Sistema de fidelidade (pontos)
- Avaliação de serviços
- Exportação de dados pessoais (LGPD)

#### Admin
- Dashboard administrativo unificado
- Monitoramento de sistema em tempo real
- Gestão de usuários e permissões
- Logs de auditoria
- Alertas de segurança
- Gestão de webhooks
- Convites para novos admins

#### Performance
- Code splitting com React.lazy
- Lazy loading de componentes pesados
- Otimização de bundle com Vite
- Caching com React Query
- Imagens otimizadas (WebP)
- Core Web Vitals otimizados

#### Acessibilidade
- WCAG 2.1 AA compliance
- 396+ aria-labels
- Navegação por teclado
- Skip to content
- Touch targets 44x44px
- Contraste de cores adequado

#### Testes
- 27 testes E2E com Playwright
- Testes de segurança automatizados
- Lighthouse CI integrado
- GitHub Actions para CI/CD

#### Mobile
- Design responsivo completo
- Bottom navigation para mobile
- Touch-friendly components
- Suporte a orientação portrait/landscape

### Corrigido
- Bugs de autenticação e redirecionamento
- Problemas de RLS com múltiplas roles
- Vulnerabilidades de segurança identificadas
- Issues de performance em dashboards

### Segurança
- Removido sistema CAPTCHA (substituído por rate limiting)
- Corrigido search_path em funções SECURITY DEFINER
- Implementado soft delete para dados sensíveis
- Logs estruturados para auditoria

---

## Versões Anteriores

Para histórico completo de alterações, consulte os commits no repositório.

---

## Legenda

- **Adicionado**: Novas funcionalidades
- **Alterado**: Mudanças em funcionalidades existentes
- **Depreciado**: Funcionalidades que serão removidas
- **Removido**: Funcionalidades removidas
- **Corrigido**: Correções de bugs
- **Segurança**: Correções de vulnerabilidades
