# Pull Request

## Descrição
<!-- Descreva brevemente as mudanças realizadas neste PR -->

## Tipo de Mudança
<!-- Marque as opções relevantes -->
- [ ] 🐛 Bug fix (correção que resolve um problema)
- [ ] ✨ Nova feature (mudança que adiciona funcionalidade)
- [ ] 💥 Breaking change (correção ou feature que causa quebra de compatibilidade)
- [ ] 📝 Documentação
- [ ] ♻️ Refatoração de código
- [ ] 🎨 Melhorias de UI/UX
- [ ] ⚡ Melhorias de performance
- [ ] 🔒 Correções de segurança

## Checklist Obrigatório
<!-- Marque todos os itens obrigatórios antes de solicitar review -->
- [ ] ✅ Todos os testes E2E do Playwright estão passando
- [ ] ✅ Testes de integração Deno estão passando
- [ ] ✅ Código foi testado localmente
- [ ] ✅ Não há erros no console do browser
- [ ] ✅ TypeScript compila sem erros
- [ ] 🔒 Validação de input implementada (se aplicável)
- [ ] 🔒 RLS policies revisadas (se houver mudanças no DB)
- [ ] 📱 Testado em mobile (se houver mudanças de UI)

## Testes Realizados
<!-- Descreva os testes que você executou -->
```bash
# Comandos de teste executados
npx playwright test
deno test --allow-net --allow-env supabase/functions/_tests/
```

## Screenshots/Videos
<!-- Se aplicável, adicione screenshots ou vídeos mostrando as mudanças -->

## Impacto em Outras Áreas
<!-- Liste áreas do sistema que podem ser impactadas por esta mudança -->
- [ ] Autenticação
- [ ] Dashboard Admin
- [ ] Dashboard Cliente
- [ ] Dashboard Profissional
- [ ] Edge Functions
- [ ] Database Schema
- [ ] Notificações
- [ ] Email System

## Revisão de Segurança
<!-- Para mudanças que envolvem segurança -->
- [ ] Input validation implementada
- [ ] Sanitização de dados implementada
- [ ] Sem SQL queries raw (uso apenas de Supabase client)
- [ ] Secrets não expostos no código
- [ ] CORS configurado corretamente (se aplicável)

## Notas Adicionais
<!-- Qualquer informação adicional relevante para os revisores -->

## Issues Relacionadas
<!-- Link para issues relacionadas -->
Closes #
Relates to #

---

**⚠️ ATENÇÃO**: Este PR será automaticamente bloqueado se os testes falharem no CI/CD.
