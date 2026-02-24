

## Diagnóstico

O site não está compilando devido a um erro de TypeScript no arquivo `src/components/notifications/PushNotificationSettings.tsx`:

```
Property 'pushManager' does not exist on type 'ServiceWorkerRegistration'
```

Isso acontece porque a lib `WebWorker` não está incluída no `tsconfig.app.json`, e o tipo `ServiceWorkerRegistration` padrão do DOM não inclui `pushManager`.

## Plano de Correção

### Correção única: Adicionar type assertion em `PushNotificationSettings.tsx`

Nas linhas 29 e 69, o `registration` precisa de um cast para `any` para acessar `pushManager`, já que os tipos do Push API não estão disponíveis no TypeScript config atual:

**Linha 29:**
```typescript
const subscription = await (registration as any).pushManager.subscribe({
```

**Linha 69:**
```typescript
const subscription = await (registration as any).pushManager.getSubscription();
```

Esta é a abordagem mais segura e rápida -- não requer mudanças no tsconfig que poderiam afetar outros arquivos. O código já funciona em runtime, é apenas uma limitação dos tipos TypeScript.

### Resultado esperado
- Build compila sem erros
- Site volta a rodar normalmente em todas as rotas
- Push notifications continuam funcionando

