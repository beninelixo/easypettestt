/**
 * Integration Tests for Edge Function Input Validation
 * Tests Zod schema validation across critical edge functions
 */

import { assert, assertEquals, assertExists } from 'https://deno.land/std@0.192.0/testing/asserts.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface TestResult {
  function_name: string;
  test_case: string;
  passed: boolean;
  expected_status: number;
  actual_status: number;
  error?: string;
}

const results: TestResult[] = [];

/**
 * Helper function to test edge function validation
 */
async function testEdgeFunction(
  functionName: string,
  testCase: string,
  payload: any,
  expectedStatus: number,
  useServiceRole = false
): Promise<void> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${useServiceRole ? SUPABASE_SERVICE_ROLE_KEY : SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const passed = response.status === expectedStatus;
    
    results.push({
      function_name: functionName,
      test_case: testCase,
      passed,
      expected_status: expectedStatus,
      actual_status: response.status,
      error: passed ? undefined : await response.text(),
    });

    if (!passed) {
      console.error(`❌ FAILED: ${functionName} - ${testCase}`);
      console.error(`   Expected: ${expectedStatus}, Got: ${response.status}`);
    } else {
      console.log(`✅ PASSED: ${functionName} - ${testCase}`);
    }
  } catch (error) {
    results.push({
      function_name: functionName,
      test_case: testCase,
      passed: false,
      expected_status: expectedStatus,
      actual_status: 0,
      error: error instanceof Error ? error.message : String(error),
    });
    console.error(`❌ ERROR: ${functionName} - ${testCase}:`, error);
  }
}

// ============= TEST SUITE =============

Deno.test('Edge Function Input Validation Suite', async (t) => {
  
  // --- login-with-rate-limit ---
  await t.step('login-with-rate-limit: Invalid email format', async () => {
    await testEdgeFunction(
      'login-with-rate-limit',
      'Invalid email format',
      { email: 'not-an-email', password: 'ValidPass123' },
      400
    );
  });

  await t.step('login-with-rate-limit: Password too short', async () => {
    await testEdgeFunction(
      'login-with-rate-limit',
      'Password too short',
      { email: 'test@example.com', password: 'short' },
      400
    );
  });

  await t.step('login-with-rate-limit: Missing email', async () => {
    await testEdgeFunction(
      'login-with-rate-limit',
      'Missing required email',
      { password: 'ValidPass123' },
      400
    );
  });

  // --- generate-image ---
  await t.step('generate-image: Empty prompt', async () => {
    await testEdgeFunction(
      'generate-image',
      'Empty prompt should fail',
      { prompt: '' },
      400
    );
  });

  await t.step('generate-image: Prompt too long', async () => {
    await testEdgeFunction(
      'generate-image',
      'Prompt exceeds 2000 characters',
      { prompt: 'x'.repeat(2001) },
      400
    );
  });

  // --- send-sms-verification ---
  await t.step('send-sms-verification: Invalid phone format', async () => {
    await testEdgeFunction(
      'send-sms-verification',
      'Invalid phone number format',
      { phoneNumber: '123' }, // Too short, doesn't match regex
      400
    );
  });

  // --- verify-sms-code ---
  await t.step('verify-sms-code: Invalid code format', async () => {
    await testEdgeFunction(
      'verify-sms-code',
      'Code must be 6 digits',
      { code: '12345' }, // Only 5 digits
      400
    );
  });

  await t.step('verify-sms-code: Code with letters', async () => {
    await testEdgeFunction(
      'verify-sms-code',
      'Code contains non-numeric characters',
      { code: '12abc4' },
      400
    );
  });

  // --- backup-to-cloud ---
  await t.step('backup-to-cloud: Invalid UUID format', async () => {
    await testEdgeFunction(
      'backup-to-cloud',
      'Invalid backup ID UUID',
      { backupId: 'not-a-uuid' },
      400,
      true
    );
  });

  // --- requeue-notification ---
  await t.step('requeue-notification: Invalid UUID', async () => {
    await testEdgeFunction(
      'requeue-notification',
      'Invalid notification ID',
      { notificationId: '12345' },
      400,
      true
    );
  });

  // --- send-push-notification ---
  await t.step('send-push-notification: Invalid user ID', async () => {
    await testEdgeFunction(
      'send-push-notification',
      'Invalid userId UUID',
      { userId: 'invalid', title: 'Test', body: 'Test body' },
      400,
      true
    );
  });

  await t.step('send-push-notification: Title too long', async () => {
    await testEdgeFunction(
      'send-push-notification',
      'Title exceeds 100 characters',
      { 
        userId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'x'.repeat(101),
        body: 'Test'
      },
      400,
      true
    );
  });

  await t.step('send-push-notification: Body too long', async () => {
    await testEdgeFunction(
      'send-push-notification',
      'Body exceeds 500 characters',
      { 
        userId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test',
        body: 'x'.repeat(501)
      },
      400,
      true
    );
  });

  // --- reset-password ---
  await t.step('reset-password: Invalid email', async () => {
    await testEdgeFunction(
      'reset-password',
      'Invalid email format',
      { email: 'bademail', code: '123456', newPassword: 'ValidPass123' },
      400
    );
  });

  await t.step('reset-password: Weak password', async () => {
    await testEdgeFunction(
      'reset-password',
      'Password missing uppercase',
      { email: 'test@example.com', code: '123456', newPassword: 'weakpass123' },
      400
    );
  });

  await t.step('reset-password: Invalid code format', async () => {
    await testEdgeFunction(
      'reset-password',
      'Code must be 6 digits',
      { email: 'test@example.com', code: '123', newPassword: 'ValidPass123' },
      400
    );
  });

  // --- trigger-webhooks ---
  await t.step('trigger-webhooks: Missing event_type', async () => {
    await testEdgeFunction(
      'trigger-webhooks',
      'Missing required event_type',
      { alert: { id: 'test' } },
      400,
      true
    );
  });

  // --- send-admin-alert ---
  await t.step('send-admin-alert: Invalid severity', async () => {
    await testEdgeFunction(
      'send-admin-alert',
      'Invalid severity enum value',
      { 
        alert_type: 'system_error',
        severity: 'super_critical', // Invalid
        title: 'Test',
        message: 'Test message'
      },
      400,
      true
    );
  });

  // --- record-login-attempt ---
  await t.step('record-login-attempt: Invalid email', async () => {
    await testEdgeFunction(
      'record-login-attempt',
      'Invalid email format',
      { email: 'invalid-email', success: false },
      400,
      true
    );
  });

  // --- send-alert-email ---
  await t.step('send-alert-email: Invalid severity', async () => {
    await testEdgeFunction(
      'send-alert-email',
      'Invalid severity value',
      {
        severity: 'mega_critical', // Invalid
        module: 'test',
        subject: 'Test',
        message: 'Test message'
      },
      400,
      true
    );
  });

  // ============= PRINT RESULTS =============
  
  console.log('\n\n=================================');
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=================================\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed} (${((passed/total)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${failed} (${((failed/total)*100).toFixed(1)}%)`);

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`\n  Function: ${r.function_name}`);
      console.log(`  Test: ${r.test_case}`);
      console.log(`  Expected: ${r.expected_status}, Got: ${r.actual_status}`);
      if (r.error) console.log(`  Error: ${r.error}`);
    });
  }

  console.log('\n=================================\n');

  // Assert all tests passed
  assertEquals(failed, 0, `${failed} tests failed. See output above for details.`);
});
