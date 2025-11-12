# Complete Setup Instructions

## 🎉 System Status

✅ **WhatsApp Phone Number ID Secret:** Configured  
✅ **Database Tables:** Created  
✅ **Edge Functions:** Deployed  
✅ **Admin UI:** Ready  
✅ **CI/CD Tests:** Configured  

---

## 📱 WhatsApp Business Setup

### Step 1: Access Meta Business Manager
1. Go to [business.facebook.com](https://business.facebook.com)
2. Navigate to **WhatsApp Business Account**
3. Select **Message Templates** from the left menu

### Step 2: Create Required Message Templates

You need to create **3 templates**. For each template:

1. Click **"Create Template"**
2. Fill in the details exactly as shown below
3. Submit for approval (typically 24 hours)

#### Template 1: Appointment Reminder

```
Template Name: appointment_reminder
Category: Utility
Language: Portuguese (Brazil)

Message:
Olá! 🐾

Lembrete: Seu pet *{{1}}* tem um agendamento amanhã!

📅 Serviço: {{2}}
📅 Data: {{3}}
🕐 Horário: {{4}}
📍 Local: {{5}}

Para confirmar ou remarcar, entre em contato conosco.

_Esta é uma mensagem automática do sistema EasyPet._

Parameters:
1. Nome do pet
2. Nome do serviço
3. Data do agendamento
4. Horário do agendamento
5. Nome do pet shop
```

#### Template 2: Appointment Confirmation

```
Template Name: appointment_confirmation
Category: Utility
Language: Portuguese (Brazil)

Message:
✅ Agendamento Confirmado!

Olá! Seu agendamento para *{{1}}* foi confirmado com sucesso.

📋 Detalhes:
🐾 Pet: {{2}}
📅 Serviço: {{3}}
📅 Data: {{4}}
🕐 Horário: {{5}}

Aguardamos você no dia e horário marcado!

_EasyPet - Sistema de Gestão_

Parameters:
1. Nome do pet shop
2. Nome do pet
3. Nome do serviço
4. Data do agendamento
5. Horário do agendamento
```

#### Template 3: Appointment Cancellation

```
Template Name: appointment_cancellation
Category: Utility
Language: Portuguese (Brazil)

Message:
❌ Agendamento Cancelado

Olá! O agendamento do seu pet *{{1}}* foi cancelado.

📋 Detalhes do agendamento cancelado:
📅 Serviço: {{2}}
📅 Data: {{3}}
🕐 Horário: {{4}}

Para reagendar, entre em contato conosco.

_EasyPet - Sistema de Gestão_

Parameters:
1. Nome do pet
2. Nome do serviço
3. Data do agendamento
4. Horário do agendamento
```

### Step 3: Wait for Template Approval

- Meta typically reviews templates within 24 hours
- You'll receive email notifications when approved
- Templates must be approved before they work in production

### Step 4: Test WhatsApp Integration

After approval, test the integration:

```bash
curl -X POST https://xkfkrdorghyagtwbxory.supabase.co/functions/v1/send-whatsapp \
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

---

## 🧪 Running Validation Tests Locally

### Prerequisites
- Install Deno: [deno.land/install](https://deno.land/install)

### Environment Variables

Create a `.env.test` file in your project root:

```bash
SUPABASE_URL=https://xkfkrdorghyagtwbxory.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Run Tests

```bash
# Navigate to project directory
cd your-project

# Run all validation tests
deno test --allow-net --allow-env supabase/functions/_tests/validation.test.ts

# Run with verbose output
deno test --allow-net --allow-env supabase/functions/_tests/validation.test.ts -- --verbose
```

### Expected Output

```
test send-whatsapp: invalid phone number format ... ok (245ms)
test send-whatsapp: missing template name ... ok (198ms)
test login-with-rate-limit: invalid email format ... ok (201ms)
test reset-password: weak password ... ok (187ms)
...

test result: ok. 27 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

### Interpreting Results

- **✅ All tests pass (400 status)**: Input validation is working correctly
- **❌ Tests fail (200/500 status)**: Validation is not catching invalid inputs
- **⚠️ Connection errors**: Check your environment variables

---

## 🔔 Admin Notification Preferences

### Access the Panel

1. Login as an admin user
2. Navigate to **Admin → Configurações → Preferências de Notificações**
3. Configure your notification preferences

### Available Settings

**Notification Channels:**
- ✉️ Email notifications
- 🔔 Push notifications (browser)
- 💬 WhatsApp notifications (requires phone number)

**Alert Types:**
- 🛡️ Security alerts (login attempts, blocked IPs)
- 💚 System health (service status, latency)
- 💾 Backup alerts (backup status, verification)
- 💳 Payment alerts (failures, subscriptions)
- 👥 User activity (registrations, important actions)
- 📊 Performance alerts (slow queries, high load)

### WhatsApp Number Format

When enabling WhatsApp notifications, use international format:
```
+55 21 95926-2880
or
5521959262880
```

---

## 💾 Automated Backup Verification

### How It Works

The system automatically verifies backup integrity by:

1. **Sampling data** from critical tables
2. **Checking structure** (IDs, timestamps, relationships)
3. **Calculating integrity scores** (0-100%)
4. **Creating verification reports** accessible to admins

### Manual Verification

To manually verify a backup:

```bash
curl -X POST https://xkfkrdorghyagtwbxory.supabase.co/functions/v1/verify-backup \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "backup_id": "uuid-of-backup-to-verify",
    "sample_size": 100
  }'
```

### Setting Up Automated Verification

To automatically verify backups daily at 4 AM, run this SQL in Supabase:

```sql
SELECT cron.schedule(
  'daily-backup-verification',
  '0 4 * * *', -- Daily at 4 AM
  $$
  SELECT net.http_post(
    url := 'https://xkfkrdorghyagtwbxory.supabase.co/functions/v1/verify-backup',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
    ),
    body := jsonb_build_object(
      'backup_id', (
        SELECT id FROM backup_history 
        WHERE status = 'completed' 
        ORDER BY created_at DESC 
        LIMIT 1
      )
    )
  );
  $$
);
```

### Viewing Verification Results

1. Go to **Admin → Segurança → Backup Management**
2. Click on any backup to see verification status
3. View detailed integrity reports

---

## 🔧 CI/CD GitHub Actions

### What Was Configured

A GitHub Actions workflow that automatically:
- Runs on every pull request to main/master
- Runs when edge functions are modified
- Tests all 27+ edge functions for proper validation
- Reports results in PR comments

### Viewing Test Results

1. Create a pull request on GitHub
2. Wait for "Edge Functions Validation Tests" workflow to complete
3. View results in the "Checks" tab of your PR

### Local vs CI Testing

- **Local:** Run `deno test` for immediate feedback
- **CI:** Automatic testing before code reaches production
- **Both:** Catch validation bugs early in development

---

## 📊 System Status Check

### Verify Everything is Working

**1. WhatsApp Integration:**
```bash
# Check if template exists (after approval)
# Send test message via edge function
```

**2. Validation Tests:**
```bash
deno test --allow-net --allow-env supabase/functions/_tests/validation.test.ts
```

**3. Admin Preferences:**
- Visit `/admin/notification-preferences`
- Toggle settings and save
- Verify preferences persist after refresh

**4. Backup Verification:**
- Run manual verification
- Check verification results in admin panel
- Verify alerts are generated on failures

---

## 🆘 Troubleshooting

### WhatsApp Issues

**Error: "Template not found"**
- Template hasn't been approved yet
- Template name doesn't match exactly
- Check language code is `pt_BR`

**Error: "Invalid phone number"**
- Must include country code: +5521959262880
- Remove spaces and special characters

### Test Issues

**Connection Errors**
- Verify `.env.test` has correct values
- Check Supabase URL and keys
- Ensure internet connection is active

**Tests Failing**
- Edge functions may have changed since tests were written
- Update test expectations in `validation.test.ts`

### Notification Preferences

**Preferences Not Saving**
- Check browser console for errors
- Verify admin role is properly assigned
- Check RLS policies allow admin access

---

## ✅ Final Checklist

- [ ] WhatsApp templates created and approved
- [ ] Test WhatsApp integration works
- [ ] Validation tests pass locally
- [ ] GitHub Actions workflow is active
- [ ] Admin notification preferences configured
- [ ] Backup verification scheduled
- [ ] All admins have set their notification preferences

---

## 📚 Additional Resources

- **WhatsApp Business API Docs:** [developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp)
- **Deno Testing Guide:** [deno.land/manual/testing](https://deno.land/manual/testing)
- **GitHub Actions Docs:** [docs.github.com/actions](https://docs.github.com/actions)
- **Project Documentation:** `WHATSAPP_TEMPLATES_GUIDE.md`

---

## 🎯 Next Steps

1. **Immediate:** Create WhatsApp templates in Meta Business Manager
2. **Today:** Run validation tests locally to verify everything works
3. **This Week:** Configure admin notification preferences
4. **Ongoing:** Monitor backup verification reports and alerts

Need help? Check the documentation or contact the development team!
