/**
 * Unit Tests for Validation Schemas
 * Tests Zod validation schemas for signup form steps
 */

import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
} from '@/lib/validation';

describe('Signup Validation Schemas', () => {
  describe('Step 1: Account Type Schema', () => {
    it('should accept valid jobseeker role', () => {
      const result = step1Schema.safeParse({ role: 'jobseeker' });
      expect(result.success).toBe(true);
    });

    it('should accept valid employer role', () => {
      const result = step1Schema.safeParse({ role: 'employer' });
      expect(result.success).toBe(true);
    });

    it('should reject null role', () => {
      const result = step1Schema.safeParse({ role: null });
      expect(result.success).toBe(false);
    });

    it('should reject invalid role', () => {
      const result = step1Schema.safeParse({ role: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('should reject missing role', () => {
      const result = step1Schema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('Step 2: Create Account Schema', () => {
    const validData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    };

    it('should accept valid account data', () => {
      const result = step2Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty full name', () => {
      const result = step2Schema.safeParse({ ...validData, fullName: '' });
      expect(result.success).toBe(false);
    });

    it('should reject full name with less than 2 characters', () => {
      const result = step2Schema.safeParse({ ...validData, fullName: 'A' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', () => {
      const result = step2Schema.safeParse({ ...validData, email: 'notanemail' });
      expect(result.success).toBe(false);
    });

    it('should reject password shorter than 8 characters', () => {
      const result = step2Schema.safeParse({
        ...validData,
        password: 'Pass1',
        confirmPassword: 'Pass1',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8 characters');
      }
    });

    it('should reject password without uppercase letter', () => {
      const result = step2Schema.safeParse({
        ...validData,
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('uppercase'))).toBe(true);
      }
    });

    it('should reject password without lowercase letter', () => {
      const result = step2Schema.safeParse({
        ...validData,
        password: 'PASSWORD123',
        confirmPassword: 'PASSWORD123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('lowercase'))).toBe(true);
      }
    });

    it('should reject password without number', () => {
      const result = step2Schema.safeParse({
        ...validData,
        password: 'PasswordABC',
        confirmPassword: 'PasswordABC',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('number'))).toBe(true);
      }
    });

    it('should reject when passwords do not match', () => {
      const result = step2Schema.safeParse({
        ...validData,
        confirmPassword: 'DifferentPassword123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('do not match'))).toBe(true);
      }
    });
  });

  describe('Step 3: Contact Info Schema', () => {
    it('should accept valid contact info with all fields', () => {
      const result = step3Schema.safeParse({
        phoneNumber: '123-456-7890',
        city: 'New York',
        country: 'USA',
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid contact info without phone number', () => {
      const result = step3Schema.safeParse({
        city: 'New York',
        country: 'USA',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing city', () => {
      const result = step3Schema.safeParse({
        country: 'USA',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing country', () => {
      const result = step3Schema.safeParse({
        city: 'New York',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty city', () => {
      const result = step3Schema.safeParse({
        city: '',
        country: 'USA',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty country', () => {
      const result = step3Schema.safeParse({
        city: 'New York',
        country: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Step 4: Work Background Schema (Optional)', () => {
    it('should accept all fields filled', () => {
      const result = step4Schema.safeParse({
        jobTitle: 'Software Engineer',
        skillArea: 'Technology',
        yearsOfExperience: '3-5',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty fields (optional step)', () => {
      const result = step4Schema.safeParse({
        jobTitle: '',
        skillArea: '',
        yearsOfExperience: '',
      });
      expect(result.success).toBe(true);
    });

    it('should accept missing fields (optional)', () => {
      const result = step4Schema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('Step 5: Resume Upload Schema (Optional)', () => {
    it('should accept null resume file', () => {
      const result = step5Schema.safeParse({
        resumeFile: null,
      });
      expect(result.success).toBe(true);
    });

    it('should accept missing resume file', () => {
      const result = step5Schema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept File object', () => {
      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' });
      const result = step5Schema.safeParse({
        resumeFile: file,
      });
      expect(result.success).toBe(true);
    });
  });
});
