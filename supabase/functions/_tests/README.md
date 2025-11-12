# Edge Function Integration Tests

Automated tests for validating input validation and edge function security.

## Running Tests

To run the integration tests:

```bash
# Run all validation tests
deno test --allow-net --allow-env supabase/functions/_tests/validation.test.ts

# Run with verbose output
deno test --allow-net --allow-env supabase/functions/_tests/validation.test.ts -- --verbose
```

## Test Coverage

The test suite validates:

✅ **Authentication Functions:**
- `login-with-rate-limit` - Email format, password strength, missing fields

✅ **Notification Functions:**
- `send-push-notification` - UUID validation, length limits
- `send-sms-verification` - Phone number format
- `verify-sms-code` - 6-digit code validation

✅ **Security Functions:**
- `reset-password` - Email, password strength, code format
- `send-admin-alert` - Enum validation, field limits
- `record-login-attempt` - Email validation

✅ **System Functions:**
- `backup-to-cloud` - UUID validation
- `requeue-notification` - UUID validation
- `trigger-webhooks` - Required fields
- `generate-image` - String length validation

✅ **Alert Functions:**
- `send-alert-email` - Severity enum, field length validation

## Environment Variables Required

The tests require these environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for admin functions)

## Expected Results

All tests should **PASS** with status code `400` (Bad Request) when:
- Invalid format inputs are provided
- Required fields are missing
- Field length limits are exceeded
- Enum values are invalid

This confirms that Zod validation is properly rejecting invalid inputs **before** processing.

## Adding New Tests

To add tests for new edge functions:

```typescript
await t.step('function-name: Test case description', async () => {
  await testEdgeFunction(
    'function-name',
    'Test case description',
    { /* invalid payload */ },
    400, // expected status
    false // useServiceRole (true for admin functions)
  );
});
```

## CI/CD Integration

These tests can be integrated into GitHub Actions or other CI/CD pipelines:

```yaml
- name: Run Edge Function Tests
  run: |
    export SUPABASE_URL=${{ secrets.SUPABASE_URL }}
    export SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_KEY }}
    export SUPABASE_SERVICE_ROLE_KEY=${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
    deno test --allow-net --allow-env supabase/functions/_tests/
```

## Security Considerations

- Tests use **invalid data** to verify validation - no real operations are performed
- Service role key is only used for testing admin-protected endpoints
- All test data is sanitized and logged appropriately
- Tests do not create, modify, or delete production data
