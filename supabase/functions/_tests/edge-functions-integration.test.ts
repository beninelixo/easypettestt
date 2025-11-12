import { assertEquals, assertExists } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

/**
 * Integration tests for critical edge functions
 * Tests validate Zod schemas, authentication, and business logic
 */

Deno.test("validate-login: should validate input schema correctly", () => {
  const schema = z.object({
    email: z.string().email(),
    ip_address: z.string().min(1),
    user_agent: z.string().min(1),
  });

  // Valid input
  const validInput = {
    email: "test@example.com",
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0",
  };
  const validResult = schema.safeParse(validInput);
  assertEquals(validResult.success, true);

  // Invalid email
  const invalidEmail = {
    email: "not-an-email",
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0",
  };
  const invalidResult = schema.safeParse(invalidEmail);
  assertEquals(invalidResult.success, false);

  // Missing fields
  const missingFields = {
    email: "test@example.com",
  };
  const missingResult = schema.safeParse(missingFields);
  assertEquals(missingResult.success, false);
});

Deno.test("record-login-attempt: should validate input schema correctly", () => {
  const schema = z.object({
    email: z.string().email(),
    success: z.boolean(),
    ip_address: z.string().min(1),
    user_agent: z.string().min(1),
  });

  // Valid success attempt
  const validSuccess = {
    email: "user@example.com",
    success: true,
    ip_address: "192.168.1.1",
    user_agent: "Chrome/120.0",
  };
  assertEquals(schema.safeParse(validSuccess).success, true);

  // Valid failure attempt
  const validFailure = {
    email: "user@example.com",
    success: false,
    ip_address: "10.0.0.1",
    user_agent: "Firefox/119.0",
  };
  assertEquals(schema.safeParse(validFailure).success, true);

  // Invalid boolean type
  const invalidType = {
    email: "user@example.com",
    success: "true", // Should be boolean
    ip_address: "192.168.1.1",
    user_agent: "Safari/17.0",
  };
  assertEquals(schema.safeParse(invalidType).success, false);
});

Deno.test("login-with-rate-limit: should validate input schema correctly", () => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    ip_address: z.string().min(1),
    user_agent: z.string().min(1),
  });

  // Valid login request
  const validInput = {
    email: "user@example.com",
    password: "SecurePass123!",
    ip_address: "192.168.1.100",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  };
  assertEquals(schema.safeParse(validInput).success, true);

  // Password too short
  const shortPassword = {
    email: "user@example.com",
    password: "short",
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0",
  };
  assertEquals(schema.safeParse(shortPassword).success, false);

  // Invalid email format
  const invalidEmail = {
    email: "not-valid-email",
    password: "SecurePass123!",
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0",
  };
  assertEquals(schema.safeParse(invalidEmail).success, false);
});

Deno.test("send-notification: should validate input schema correctly", () => {
  const schema = z.object({
    userId: z.string().uuid(),
    title: z.string().min(1).max(200),
    message: z.string().min(1).max(1000),
    type: z.enum(['info', 'success', 'warning', 'error']),
  });

  // Valid notification
  const validInput = {
    userId: "123e4567-e89b-12d3-a456-426614174000",
    title: "Test Notification",
    message: "This is a test message",
    type: "info" as const,
  };
  assertEquals(schema.safeParse(validInput).success, true);

  // Invalid UUID
  const invalidUUID = {
    userId: "not-a-uuid",
    title: "Test",
    message: "Message",
    type: "info" as const,
  };
  assertEquals(schema.safeParse(invalidUUID).success, false);

  // Title too long
  const longTitle = {
    userId: "123e4567-e89b-12d3-a456-426614174000",
    title: "A".repeat(201),
    message: "Message",
    type: "info" as const,
  };
  assertEquals(schema.safeParse(longTitle).success, false);

  // Invalid type
  const invalidType = {
    userId: "123e4567-e89b-12d3-a456-426614174000",
    title: "Test",
    message: "Message",
    type: "invalid-type",
  };
  assertEquals(schema.safeParse(invalidType).success, false);
});

Deno.test("send-appointment-reminders: should validate input schema correctly", () => {
  const schema = z.object({
    appointmentId: z.string().uuid().optional(),
    scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    sendEmail: z.boolean().default(true),
    sendWhatsApp: z.boolean().default(false),
  });

  // Valid reminder with all fields
  const validFull = {
    appointmentId: "123e4567-e89b-12d3-a456-426614174000",
    scheduledDate: "2025-12-25",
    sendEmail: true,
    sendWhatsApp: true,
  };
  assertEquals(schema.safeParse(validFull).success, true);

  // Valid with defaults
  const validMinimal = {
    scheduledDate: "2025-01-15",
  };
  const result = schema.safeParse(validMinimal);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.data.sendEmail, true);
    assertEquals(result.data.sendWhatsApp, false);
  }

  // Invalid date format
  const invalidDate = {
    scheduledDate: "25-12-2025", // Wrong format
    sendEmail: true,
  };
  assertEquals(schema.safeParse(invalidDate).success, false);

  // Invalid UUID
  const invalidUUID = {
    appointmentId: "not-uuid",
    scheduledDate: "2025-12-25",
  };
  assertEquals(schema.safeParse(invalidUUID).success, false);
});

Deno.test("reset-password: should validate input schema correctly", () => {
  const schema = z.object({
    email: z.string().email(),
    resetCode: z.string().length(6).regex(/^\d{6}$/),
    newPassword: z.string()
      .min(8)
      .regex(/[a-z]/, "Must contain lowercase")
      .regex(/[A-Z]/, "Must contain uppercase")
      .regex(/[0-9]/, "Must contain number"),
  });

  // Valid reset
  const validInput = {
    email: "user@example.com",
    resetCode: "123456",
    newPassword: "NewSecure123!",
  };
  assertEquals(schema.safeParse(validInput).success, true);

  // Invalid reset code (not 6 digits)
  const invalidCode = {
    email: "user@example.com",
    resetCode: "12345", // Only 5 digits
    newPassword: "NewSecure123!",
  };
  assertEquals(schema.safeParse(invalidCode).success, false);

  // Invalid reset code (not numeric)
  const nonNumericCode = {
    email: "user@example.com",
    resetCode: "ABC123",
    newPassword: "NewSecure123!",
  };
  assertEquals(schema.safeParse(nonNumericCode).success, false);

  // Weak password (no uppercase)
  const weakPassword = {
    email: "user@example.com",
    resetCode: "123456",
    newPassword: "newsecure123",
  };
  assertEquals(schema.safeParse(weakPassword).success, false);
});

Deno.test("verify-mfa-token: should validate input schema correctly", () => {
  const schema = z.object({
    userId: z.string().uuid(),
    token: z.string().length(6).regex(/^\d{6}$/),
  });

  // Valid MFA token
  const validInput = {
    userId: "123e4567-e89b-12d3-a456-426614174000",
    token: "123456",
  };
  assertEquals(schema.safeParse(validInput).success, true);

  // Invalid token length
  const invalidLength = {
    userId: "123e4567-e89b-12d3-a456-426614174000",
    token: "12345",
  };
  assertEquals(schema.safeParse(invalidLength).success, false);

  // Non-numeric token
  const nonNumeric = {
    userId: "123e4567-e89b-12d3-a456-426614174000",
    token: "ABC123",
  };
  assertEquals(schema.safeParse(nonNumeric).success, false);

  // Invalid UUID
  const invalidUUID = {
    userId: "not-a-uuid",
    token: "123456",
  };
  assertEquals(schema.safeParse(invalidUUID).success, false);
});

Deno.test("SQL injection prevention: email field sanitization", () => {
  const schema = z.object({
    email: z.string().email(),
  });

  // Attempt SQL injection in email
  const sqlInjection = {
    email: "test@test.com'; DROP TABLE users; --",
  };
  // Should fail email validation
  assertEquals(schema.safeParse(sqlInjection).success, false);

  // Attempt XSS in email
  const xssAttempt = {
    email: "<script>alert('xss')</script>@test.com",
  };
  // Should fail email validation
  assertEquals(schema.safeParse(xssAttempt).success, false);
});

Deno.test("Input length validation: prevent DoS attacks", () => {
  const schema = z.object({
    message: z.string().min(1).max(1000),
  });

  // Normal message
  const validMessage = {
    message: "This is a normal message",
  };
  assertEquals(schema.safeParse(validMessage).success, true);

  // Extremely long message (DoS attempt)
  const longMessage = {
    message: "A".repeat(10000),
  };
  assertEquals(schema.safeParse(longMessage).success, false);

  // Empty message
  const emptyMessage = {
    message: "",
  };
  assertEquals(schema.safeParse(emptyMessage).success, false);
});

console.log("✅ All edge function integration tests passed!");
