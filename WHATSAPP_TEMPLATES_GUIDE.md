# WhatsApp Business Message Templates Setup Guide

## Required Templates for EasyPet

Configure the following message templates in Meta Business Manager for automated WhatsApp notifications.

### 1. Appointment Reminder Template

**Template Name:** `appointment_reminder`  
**Language:** Portuguese (Brazil) - `pt_BR`  
**Category:** Utility  

**Message Content:**
```
Olá! 🐾

Lembrete: Seu pet *{{1}}* tem um agendamento amanhã!

📅 Serviço: {{2}}
📅 Data: {{3}}
🕐 Horário: {{4}}
📍 Local: {{5}}

Para confirmar ou remarcar, entre em contato conosco.

_Esta é uma mensagem automática do sistema EasyPet._
```

**Parameters:**
1. Nome do pet
2. Nome do serviço
3. Data do agendamento
4. Horário do agendamento
5. Nome do pet shop

---

### 2. Appointment Confirmation Template

**Template Name:** `appointment_confirmation`  
**Language:** Portuguese (Brazil) - `pt_BR`  
**Category:** Utility  

**Message Content:**
```
✅ Agendamento Confirmado!

Olá! Seu agendamento para *{{1}}* foi confirmado com sucesso.

📋 Detalhes:
🐾 Pet: {{2}}
📅 Serviço: {{3}}
📅 Data: {{4}}
🕐 Horário: {{5}}

Aguardamos você no dia e horário marcado!

_EasyPet - Sistema de Gestão_
```

**Parameters:**
1. Nome do pet shop
2. Nome do pet
3. Nome do serviço
4. Data do agendamento
5. Horário do agendamento

---

### 3. Appointment Cancellation Template

**Template Name:** `appointment_cancellation`  
**Language:** Portuguese (Brazil) - `pt_BR`  
**Category:** Utility  

**Message Content:**
```
❌ Agendamento Cancelado

Olá! O agendamento do seu pet *{{1}}* foi cancelado.

📋 Detalhes do agendamento cancelado:
📅 Serviço: {{2}}
📅 Data: {{3}}
🕐 Horário: {{4}}

Para reagendar, entre em contato conosco.

_EasyPet - Sistema de Gestão_
```

**Parameters:**
1. Nome do pet
2. Nome do serviço
3. Data do agendamento
4. Horário do agendamento

---

## Setup Instructions

### Step 1: Access Meta Business Manager
1. Go to [business.facebook.com](https://business.facebook.com)
2. Navigate to your WhatsApp Business Account
3. Select "Message Templates" from the left menu

### Step 2: Create Each Template
1. Click "Create Template"
2. Enter the template name (exactly as shown above)
3. Select category: "Utility"
4. Select language: "Portuguese (Brazil)"
5. Copy and paste the message content
6. Add parameters using {{1}}, {{2}}, etc.
7. Submit for approval

### Step 3: Wait for Approval
- Meta typically reviews templates within 24 hours
- You'll receive email notification when approved
- Templates must be approved before use in production

### Step 4: Configure Phone Number ID
1. Copy your WhatsApp Business Phone Number ID
2. Add it as a Supabase secret:
   - Secret name: `WHATSAPP_PHONE_NUMBER_ID`
   - Value: Your phone number ID from Meta

### Step 5: Test Templates
After approval, test each template:

```bash
# Test appointment reminder
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/send-whatsapp \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5521959262880",
    "template_name": "appointment_reminder",
    "template_language": "pt_BR",
    "parameters": [
      {"type": "text", "text": "Rex"},
      {"type": "text", "text": "Banho e Tosa"},
      {"type": "text", "text": "25/11/2025"},
      {"type": "text", "text": "14:00"},
      {"type": "text", "text": "Pet Shop EasyPet"}
    ]
  }'
```

## Integration Status

✅ **Implemented:**
- WhatsApp Business API integration
- `send-whatsapp` edge function with validation
- Phone number configuration: (21) 95926-2880
- Automatic reminder integration in `send-appointment-reminders`
- Template parameter support

⏳ **Pending:**
- Meta Business Manager template approval
- WHATSAPP_PHONE_NUMBER_ID secret configuration
- Production testing with real WhatsApp messages

## Best Practices

1. **Always test with approved templates** - Using unapproved templates will result in API errors
2. **Monitor message delivery rates** - Check Meta Business Manager for delivery statistics
3. **Respect opt-out requests** - Implement proper unsubscribe mechanisms
4. **Keep templates updated** - Update templates when business information changes
5. **Use appropriate categories** - "Utility" for transactional, "Marketing" for promotional

## Troubleshooting

### Error: "Template not found"
- Template hasn't been approved yet
- Template name doesn't match exactly
- Check template name spelling and language code

### Error: "Invalid phone number"
- Phone number must include country code
- Format: +5521959262880 (no spaces or dashes)
- Verify number is WhatsApp-enabled

### Error: "Phone number ID not configured"
- WHATSAPP_PHONE_NUMBER_ID secret not set
- Check secret value in Supabase dashboard
- Verify phone number ID from Meta Business Manager

## Support

For WhatsApp Business API support:
- [Meta Business Help Center](https://www.facebook.com/business/help)
- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
