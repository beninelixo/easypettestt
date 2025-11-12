# Instruções para Criar Template "admin-invite" no Loops.so

## Passo 1: Acessar o Loops Dashboard
1. Acesse: https://app.loops.so
2. Faça login com sua conta
3. Navegue até **Transactional** → **Templates** no menu lateral

## Passo 2: Criar Novo Template
1. Clique em **"Create Template"**
2. Nome do template: `admin-invite`
3. Assunto do email: `Convite para Administrador - EasyPet`
4. Remetente: `EasyPet <easypetc@gmail.com>`

## Passo 3: Design do Email (HTML)

Use o editor visual ou cole o HTML abaixo:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite Admin EasyPet</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #00C896; margin: 0; font-size: 32px; font-weight: bold;">
        🎉 Convite Especial
      </h1>
      <p style="color: #666; font-size: 16px; margin-top: 10px;">
        Você foi convidado para se tornar Administrador
      </p>
    </div>

    <!-- Main Content -->
    <div style="background: linear-gradient(135deg, #00C896 0%, #0EA57D 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px;">
      <h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 24px;">
        Bem-vindo à Equipe EasyPet!
      </h2>
      <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0;">
        Você recebeu permissões especiais de <strong>Administrador</strong> no sistema EasyPet. 
        Isso significa que você terá acesso completo a todas as funcionalidades administrativas, incluindo:
      </p>
    </div>

    <!-- Features List -->
    <div style="margin-bottom: 30px;">
      <ul style="list-style: none; padding: 0; margin: 0;">
        <li style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">
          ✅ <strong>Painel Modo Deus:</strong> Controle total do sistema
        </li>
        <li style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">
          ✅ <strong>Gerenciamento de Usuários:</strong> Criar, editar e excluir contas
        </li>
        <li style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">
          ✅ <strong>Monitoramento:</strong> Acesso a logs e métricas do sistema
        </li>
        <li style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">
          ✅ <strong>Segurança:</strong> Configurações avançadas e backups
        </li>
        <li style="padding: 12px 0; font-size: 15px;">
          ✅ <strong>Convites Admin:</strong> Convidar outros administradores
        </li>
      </ul>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{inviteUrl}}" 
         style="display: inline-block; 
                background: linear-gradient(135deg, #00C896 0%, #0EA57D 100%); 
                color: #ffffff; 
                text-decoration: none; 
                padding: 16px 40px; 
                border-radius: 8px; 
                font-size: 18px; 
                font-weight: bold;
                box-shadow: 0 4px 12px rgba(0, 200, 150, 0.3);">
        🚀 Aceitar Convite Admin
      </a>
    </div>

    <!-- Important Info -->
    <div style="background-color: #FFF4E5; padding: 20px; border-left: 4px solid #FFA500; border-radius: 6px; margin-bottom: 30px;">
      <p style="margin: 0; font-size: 14px; color: #666;">
        ⏰ <strong>Atenção:</strong> Este convite expira em <strong>{{expirationDate}}</strong>. 
        Clique no botão acima para ativá-lo antes desta data.
      </p>
    </div>

    <!-- Security Note -->
    <div style="background-color: #F0F0F0; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
      <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.6;">
        🔒 <strong>Segurança:</strong> Se você não esperava este convite ou não reconhece o remetente, 
        ignore este email. Nunca compartilhe suas credenciais de administrador com ninguém.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding-top: 30px; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 13px; margin: 0;">
        © 2025 EasyPet - Sistema de Gestão para Pet Shops
      </p>
      <p style="color: #999; font-size: 13px; margin: 10px 0 0 0;">
        📧 easypetc@gmail.com | 📱 (21) 95926-2880
      </p>
    </div>

  </div>
</body>
</html>
```

## Passo 4: Configurar Variáveis

No Loops, configure estas variáveis dinâmicas:

1. **inviteUrl** (string): URL completa do convite com token
   - Exemplo: `https://seudominio.com/admin/accept-invite?token=abc123`

2. **expirationDate** (string): Data de expiração formatada
   - Exemplo: `15/01/2025 às 23:59`

## Passo 5: Testar o Template

1. Use a função **"Send Test"** no Loops
2. Preencha os dados de teste:
   ```json
   {
     "inviteUrl": "https://example.com/admin/accept-invite?token=test123",
     "expirationDate": "31/12/2025 às 23:59"
   }
   ```
3. Envie para seu email de teste
4. Verifique se todas as variáveis foram substituídas corretamente

## Passo 6: Ativar o Template

1. Clique em **"Activate Template"**
2. Confirme a ativação
3. Anote o **Template ID**: `admin-invite`

## Passo 7: Integração com o Sistema

O template já está integrado no edge function `send-admin-invite`. 

Quando um admin envia um convite, o sistema automaticamente:
- Cria um registro na tabela `admin_invites`
- Gera um token único de convite
- Chama o Loops para enviar o email usando este template
- Passa as variáveis `inviteUrl` e `expirationDate` automaticamente

## Dicas de Personalização

Você pode personalizar:
- Cores do gradiente (atualmente verde/cyan)
- Texto de boas-vindas
- Lista de permissões
- Estilo do botão CTA
- Informações de contato no rodapé

## Suporte

Se tiver problemas:
1. Verifique se o LOOPS_API_KEY está configurado no Supabase
2. Confira os logs do edge function `send-admin-invite`
3. Teste o template manualmente no Loops Dashboard
4. Entre em contato: easypetc@gmail.com
