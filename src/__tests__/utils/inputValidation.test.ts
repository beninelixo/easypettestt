import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  phoneSchema,
  cpfSchema,
  cnpjSchema,
  passwordSchema,
  nameSchema,
  sanitizeHTML,
  sanitizeText,
  sanitizeURL,
  escapeSQLString,
  RateLimiter,
} from '@/lib/security/inputValidation';

describe('Email Validation', () => {
  it('should validate correct email addresses', () => {
    expect(emailSchema.safeParse('test@example.com').success).toBe(true);
    expect(emailSchema.safeParse('user.name@domain.co.br').success).toBe(true);
    expect(emailSchema.safeParse('USER@EXAMPLE.COM').success).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(emailSchema.safeParse('invalid').success).toBe(false);
    expect(emailSchema.safeParse('test@').success).toBe(false);
    expect(emailSchema.safeParse('@example.com').success).toBe(false);
    expect(emailSchema.safeParse('test@example').success).toBe(false);
  });

  it('should transform email to lowercase and trim', () => {
    const result = emailSchema.parse('  TEST@EXAMPLE.COM  ');
    expect(result).toBe('test@example.com');
  });

  it('should reject emails longer than 255 characters', () => {
    const longEmail = 'a'.repeat(250) + '@example.com';
    expect(emailSchema.safeParse(longEmail).success).toBe(false);
  });
});

describe('Phone Validation (Brazilian Format)', () => {
  it('should validate correct phone numbers', () => {
    expect(phoneSchema.safeParse('11999999999').success).toBe(true);
    expect(phoneSchema.safeParse('(11) 99999-9999').success).toBe(true);
    expect(phoneSchema.safeParse('+55 11 99999-9999').success).toBe(true);
    expect(phoneSchema.safeParse('21987654321').success).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(phoneSchema.safeParse('123').success).toBe(false);
    expect(phoneSchema.safeParse('abcdefghijk').success).toBe(false);
  });

  it('should transform phone to digits only', () => {
    const result = phoneSchema.parse('(11) 99999-9999');
    expect(result).toBe('11999999999');
  });
});

describe('CPF Validation', () => {
  it('should validate correct CPFs', () => {
    // Valid CPFs (generated for testing)
    expect(cpfSchema.safeParse('52998224725').success).toBe(true);
    expect(cpfSchema.safeParse('11144477735').success).toBe(true);
  });

  it('should reject invalid CPFs', () => {
    expect(cpfSchema.safeParse('12345678901').success).toBe(false);
    expect(cpfSchema.safeParse('11111111111').success).toBe(false); // All same digits
    expect(cpfSchema.safeParse('00000000000').success).toBe(false);
    expect(cpfSchema.safeParse('123').success).toBe(false); // Too short
    expect(cpfSchema.safeParse('1234567890123').success).toBe(false); // Too long
  });

  it('should reject CPFs with all same digits', () => {
    for (let i = 0; i <= 9; i++) {
      const samedigitCPF = String(i).repeat(11);
      expect(cpfSchema.safeParse(samedigitCPF).success).toBe(false);
    }
  });
});

describe('CNPJ Validation', () => {
  it('should validate correct CNPJs', () => {
    // Valid CNPJs (generated for testing)
    expect(cnpjSchema.safeParse('11222333000181').success).toBe(true);
    expect(cnpjSchema.safeParse('11444777000161').success).toBe(true);
  });

  it('should reject invalid CNPJs', () => {
    expect(cnpjSchema.safeParse('12345678000100').success).toBe(false);
    expect(cnpjSchema.safeParse('11111111111111').success).toBe(false); // All same digits
    expect(cnpjSchema.safeParse('00000000000000').success).toBe(false);
    expect(cnpjSchema.safeParse('123').success).toBe(false); // Too short
  });
});

describe('Password Validation', () => {
  it('should validate strong passwords', () => {
    expect(passwordSchema.safeParse('Test@1234').success).toBe(true);
    expect(passwordSchema.safeParse('MyP@ssw0rd!').success).toBe(true);
    expect(passwordSchema.safeParse('Secure#123').success).toBe(true);
  });

  it('should reject weak passwords', () => {
    // Too short
    expect(passwordSchema.safeParse('Ab1!').success).toBe(false);
    // No uppercase
    expect(passwordSchema.safeParse('test@1234').success).toBe(false);
    // No lowercase
    expect(passwordSchema.safeParse('TEST@1234').success).toBe(false);
    // No number
    expect(passwordSchema.safeParse('Test@abcd').success).toBe(false);
    // No special character
    expect(passwordSchema.safeParse('Test12345').success).toBe(false);
  });
});

describe('Name Validation', () => {
  it('should validate correct names', () => {
    expect(nameSchema.safeParse('João Silva').success).toBe(true);
    expect(nameSchema.safeParse('Maria José da Silva').success).toBe(true);
    expect(nameSchema.safeParse("O'Connor").success).toBe(true);
    expect(nameSchema.safeParse('Jean-Pierre').success).toBe(true);
  });

  it('should reject invalid names', () => {
    expect(nameSchema.safeParse('A').success).toBe(false); // Too short
    expect(nameSchema.safeParse('João123').success).toBe(false); // Contains numbers
    expect(nameSchema.safeParse('Test<script>').success).toBe(false); // Contains special chars
  });

  it('should trim whitespace', () => {
    const result = nameSchema.parse('  João Silva  ');
    expect(result).toBe('João Silva');
  });
});

describe('HTML Sanitization', () => {
  it('should allow safe HTML tags', () => {
    expect(sanitizeHTML('<b>bold</b>')).toBe('<b>bold</b>');
    expect(sanitizeHTML('<i>italic</i>')).toBe('<i>italic</i>');
    expect(sanitizeHTML('<p>paragraph</p>')).toBe('<p>paragraph</p>');
    expect(sanitizeHTML('<strong>strong</strong>')).toBe('<strong>strong</strong>');
    expect(sanitizeHTML('<em>emphasis</em>')).toBe('<em>emphasis</em>');
  });

  it('should remove dangerous HTML tags', () => {
    expect(sanitizeHTML('<script>alert("xss")</script>')).toBe('');
    expect(sanitizeHTML('<img src="x" onerror="alert(1)">')).toBe('');
    expect(sanitizeHTML('<a href="javascript:alert(1)">link</a>')).toBe('link');
    expect(sanitizeHTML('<div onclick="evil()">click</div>')).toBe('click');
  });

  it('should remove all attributes', () => {
    expect(sanitizeHTML('<p class="test" id="p1">text</p>')).toBe('<p>text</p>');
  });
});

describe('Text Sanitization', () => {
  it('should remove all HTML tags', () => {
    expect(sanitizeText('<b>bold</b>')).toBe('bold');
    expect(sanitizeText('<script>alert(1)</script>')).toBe('');
    expect(sanitizeText('<div>Hello <b>World</b>!</div>')).toBe('Hello World!');
  });

  it('should preserve plain text', () => {
    expect(sanitizeText('Hello World')).toBe('Hello World');
    expect(sanitizeText('Test 123')).toBe('Test 123');
  });
});

describe('URL Sanitization', () => {
  it('should allow http and https URLs', () => {
    expect(sanitizeURL('https://example.com')).toBe('https://example.com/');
    expect(sanitizeURL('http://example.com/path')).toBe('http://example.com/path');
    expect(sanitizeURL('https://example.com/path?query=1')).toBe('https://example.com/path?query=1');
  });

  it('should reject dangerous protocols', () => {
    expect(sanitizeURL('javascript:alert(1)')).toBeNull();
    expect(sanitizeURL('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(sanitizeURL('file:///etc/passwd')).toBeNull();
  });

  it('should return null for invalid URLs', () => {
    expect(sanitizeURL('not-a-url')).toBeNull();
    expect(sanitizeURL('')).toBeNull();
  });
});

describe('SQL String Escaping', () => {
  it('should escape SQL special characters', () => {
    expect(escapeSQLString("O'Reilly")).toBe("O\\'Reilly");
    expect(escapeSQLString('test"quote')).toBe('test\\"quote');
    expect(escapeSQLString('test;DROP TABLE')).toBe('test\\;DROP TABLE');
    expect(escapeSQLString('path\\to\\file')).toBe('path\\\\to\\\\file');
  });

  it('should handle safe strings', () => {
    expect(escapeSQLString('normal text')).toBe('normal text');
    expect(escapeSQLString('test123')).toBe('test123');
  });
});

describe('RateLimiter', () => {
  it('should allow requests within limit', () => {
    const limiter = new RateLimiter(3, 60000);
    
    const result1 = limiter.check('user1');
    expect(result1.allowed).toBe(true);
    expect(result1.remainingAttempts).toBe(2);

    const result2 = limiter.check('user1');
    expect(result2.allowed).toBe(true);
    expect(result2.remainingAttempts).toBe(1);

    const result3 = limiter.check('user1');
    expect(result3.allowed).toBe(true);
    expect(result3.remainingAttempts).toBe(0);
  });

  it('should block requests over limit', () => {
    const limiter = new RateLimiter(2, 60000);
    
    limiter.check('user2');
    limiter.check('user2');
    
    const result = limiter.check('user2');
    expect(result.allowed).toBe(false);
    expect(result.remainingAttempts).toBe(0);
  });

  it('should track different keys independently', () => {
    const limiter = new RateLimiter(2, 60000);
    
    limiter.check('user3');
    limiter.check('user3');
    
    const result = limiter.check('user4');
    expect(result.allowed).toBe(true);
    expect(result.remainingAttempts).toBe(1);
  });

  it('should reset key correctly', () => {
    const limiter = new RateLimiter(2, 60000);
    
    limiter.check('user5');
    limiter.check('user5');
    limiter.reset('user5');
    
    const result = limiter.check('user5');
    expect(result.allowed).toBe(true);
    expect(result.remainingAttempts).toBe(1);
  });
});
