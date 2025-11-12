# Loops.so Setup Guide for EasyPet Welcome Email System

## Prerequisites
- Loops.so account (sign up at https://loops.so)
- LOOPS_API_KEY secret configured in Supabase
- Email sender domain: easypetc@gmail.com

## Step 1: Create Welcome Email Transactional Template

1. **Log into Loops Dashboard**: https://app.loops.so
2. **Navigate to Transactionals** (left sidebar)
3. **Click "Create Transactional"**
4. **Configure Template**:
   - **Template ID**: `welcome-email` (CRITICAL - must match exactly)
   - **Template Name**: "EasyPet Welcome Email"
   - **From Name**: "EasyPet"
   - **From Email**: easypetc@gmail.com
   - **Subject**: Use variable `{{subject}}`

5. **Email Design** (use variables):
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">🐾 {{subject}}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; color: #333; line-height: 1.6;">
      {{message}}
    </p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="font-weight: bold; color: #667eea; margin-top: 0;">✨ Dicas para começar:</p>
      <ul style="color: #555; line-height: 1.8;">
        {{#each tips}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
    </div>
    
    <p style="font-size: 16px; color: #333; line-height: 1.6;">
      {{cta}}
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://easypet.lovable.app" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
        Acessar EasyPet
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="color: #888; font-size: 14px; text-align: center;">
      Atenciosamente,<br>
      <strong>Equipe EasyPet</strong> 🐾
    </p>
  </div>
</div>
```

6. **Test the Template**:
   - Click "Send Test Email"
   - Use sample data:
     ```json
     {
       "subject": "Bem-vindo ao EasyPet!",
       "message": "Estamos felizes em ter você conosco!",
       "tips": ["Dica 1", "Dica 2", "Dica 3"],
       "cta": "Comece agora!"
     }
     ```

7. **Publish Template**

## Step 2: Create Audience Segments

1. **Navigate to Audience** → **Segments**
2. **Create 3 segments**:

   **Segment 1: Clientes**
   - Name: "Clientes"
   - Filter: `userGroup` equals `client`

   **Segment 2: Pet Shops**
   - Name: "Pet Shops"
   - Filter: `userGroup` equals `pet_shop`

   **Segment 3: Administradores**
   - Name: "Administradores"
   - Filter: `userGroup` equals `admin`

## Step 3: Create Onboarding Automation Sequences

### Day 3 Tips Email (Clients)

1. **Navigate to Loops** (automation section)
2. **Click "Create Loop"**
3. **Configure Loop**:
   - **Name**: "Client Onboarding - Day 3"
   - **Trigger**: Custom Event = `user_registered`
   - **Filter**: `userGroup` equals `client`

4. **Add Delay Step**:
   - Wait for: 3 days

5. **Add Email Step**:
   - **Subject**: "🐾 3 Dicas para Aproveitar o EasyPet ao Máximo"
   - **Content**:
```html
<h2>Olá {{firstName}}! 👋</h2>

<p>Já faz 3 dias desde que você se juntou ao EasyPet. Aqui estão algumas dicas para você aproveitar ao máximo:</p>

<ol>
  <li><strong>Cadastre todos os seus pets</strong> - Mantenha as informações atualizadas para um atendimento personalizado</li>
  <li><strong>Ative as notificações</strong> - Receba lembretes de agendamentos e nunca perca um compromisso</li>
  <li><strong>Explore pet shops próximos</strong> - Encontre os melhores serviços na sua região</li>
</ol>

<p>Precisa de ajuda? Estamos aqui para você! 💙</p>
```

6. **Publish Loop**

### Day 7 Engagement Email (All Users)

1. **Create New Loop**:
   - **Name**: "User Engagement - Day 7"
   - **Trigger**: Custom Event = `user_registered`
   - **Filter**: No filter (all users)

2. **Add Delay Step**:
   - Wait for: 7 days

3. **Add Email Step**:
   - **Subject**: "🌟 Como tem sido sua experiência com o EasyPet?"
   - **Content**:
```html
<h2>Olá {{firstName}}! 🎉</h2>

<p>Já faz uma semana desde que você se juntou ao EasyPet. Queremos saber como está sendo sua experiência!</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="https://easypet.lovable.app/feedback" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
    Compartilhar Feedback
  </a>
</div>

<p>Seu feedback nos ajuda a melhorar continuamente. 💜</p>
```

4. **Publish Loop**

### Day 3 Business Tips (Pet Shops Only)

1. **Create New Loop**:
   - **Name**: "Pet Shop Onboarding - Day 3"
   - **Trigger**: Custom Event = `user_registered`
   - **Filter**: `userGroup` equals `pet_shop`

2. **Add Delay Step**:
   - Wait for: 3 days

3. **Add Email Step**:
   - **Subject**: "💼 Como Aumentar Seus Agendamentos no EasyPet"
   - **Content**:
```html
<h2>Olá {{firstName}}! 🚀</h2>

<p>Para ajudar seu negócio a crescer no EasyPet, aqui estão estratégias comprovadas:</p>

<ul>
  <li><strong>Complete seu perfil</strong> - Adicione fotos, horários e todos os serviços</li>
  <li><strong>Configure preços competitivos</strong> - Compare com outros pet shops na região</li>
  <li><strong>Responda rápido</strong> - Clientes valorizam agilidade nas confirmações</li>
  <li><strong>Use o sistema de fidelidade</strong> - Recompense clientes recorrentes</li>
</ul>

<p>Pronto para crescer? Vamos juntos! 📈</p>
```

4. **Publish Loop**

## Step 4: Testing the System

### Test 1: Manual Email Send
```bash
# Using curl to test send-loops-email function
curl -X POST https://xkfkrdorghyagtwbxory.supabase.co/functions/v1/send-loops-email \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_transactional",
    "transactionalId": "welcome-email",
    "email": "test@example.com",
    "dataVariables": {
      "firstName": "Test",
      "subject": "Test Welcome",
      "message": "This is a test",
      "tips": ["Tip 1", "Tip 2"],
      "cta": "Get started"
    }
  }'
```

### Test 2: Create Test Accounts
1. **Client Account**:
   - Go to: https://easypet.lovable.app/auth
   - Sign up with role: "Cliente"
   - Check email for welcome message

2. **Pet Shop Account**:
   - Sign up with role: "Profissional/Pet Shop"
   - Check email for welcome message

3. **Admin Account**:
   - Sign up with role: "Administrador"
   - Check email for welcome message

### Test 3: Verify Contact Creation
1. Go to Loops Dashboard → Audience
2. Search for test emails
3. Verify `userGroup` field is correctly set
4. Check that contacts are in correct segments

### Test 4: Verify Event Triggers
1. Go to Loops Dashboard → Events
2. Search for `user_registered` event
3. Verify event was triggered for test accounts
4. Check automation sequences started correctly

## Step 5: Monitoring

### Check Email Logs
```sql
-- View email logs in Supabase
SELECT * FROM system_logs
WHERE module = 'welcome_email'
ORDER BY created_at DESC
LIMIT 50;
```

### Check Edge Function Logs
1. Go to Lovable Cloud → Backend → Edge Functions
2. Select `send-welcome-email`
3. View logs for any errors

### Loops Dashboard Monitoring
- **Analytics** → View email open rates, click rates
- **Events** → Monitor `user_registered` events
- **Loops** → Check automation sequence performance

## Troubleshooting

### Email Not Received
1. Check spam/junk folder
2. Verify `easypetc@gmail.com` is verified in Loops
3. Check edge function logs for errors
4. Verify LOOPS_API_KEY is correct

### Automation Not Triggering
1. Verify event name is exactly `user_registered`
2. Check segment filters match contact properties
3. Ensure Loop is published (not draft)
4. Check contact's `userGroup` field

### Template Variables Not Working
1. Verify template ID is exactly `welcome-email`
2. Check variable names match (case-sensitive)
3. Test template with sample data in Loops dashboard

## Next Steps

Once setup is complete:
1. ✅ Monitor first real registrations
2. ✅ Adjust email content based on user feedback
3. ✅ Create additional automation sequences
4. ✅ Set up A/B testing for subject lines
5. ✅ Integrate with other marketing campaigns

## Support Resources

- **Loops Documentation**: https://loops.so/docs
- **Loops API Reference**: https://loops.so/docs/api-reference
- **Loops Community**: https://loops.so/community
- **EasyPet Support**: Contact your development team
