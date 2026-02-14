/**
 * Unit Tests for Profile Completion Utilities
 * Tests the calculateProfileCompletion function
 */

import { calculateProfileCompletion } from '@/lib/profile-utils';
import { UserProfile } from '@/types/api';

describe('calculateProfileCompletion', () => {
  const createMockProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
    full_name: 'John Doe',
    role: 'job_seeker',
    email: 'john@example.com',
    phone_number: '123-456-7890',
    location: 'New York, USA',
    job_title: 'Software Engineer',
    bio: 'Experienced developer',
    work_experience: [
      {
        company: 'Tech Corp',
        position: 'Developer',
        start_date: '2020-01-01',
        end_date: '2023-01-01',
      },
    ],
    education: [
      {
        institution: 'University',
        degree: 'BS',
        field_of_study: 'Computer Science',
      },
    ],
    ...overrides,
  });

  it('should return 100% completion for fully filled profile', () => {
    const profile = createMockProfile();
    const result = calculateProfileCompletion(profile);

    expect(result.percentage).toBe(100);
    expect(result.completedSections).toHaveLength(7);
    expect(result.incompleteSections).toHaveLength(0);
  });

  it('should return 0% completion for empty profile', () => {
    const profile = createMockProfile({
      full_name: '',
      phone_number: '',
      location: '',
      job_title: '',
      bio: '',
      work_experience: [],
      education: [],
    });
    const result = calculateProfileCompletion(profile);

    expect(result.percentage).toBe(0);
    expect(result.completedSections).toHaveLength(0);
    expect(result.incompleteSections).toHaveLength(7);
  });

  it('should handle missing full_name', () => {
    const profile = createMockProfile({ full_name: '' });
    const result = calculateProfileCompletion(profile);

    expect(result.percentage).toBe(86); // 6/7 = 85.7% rounds to 86%
    expect(result.incompleteSections).toContain('full_name');
    expect(result.completedSections).not.toContain('full_name');
  });

  it('should handle missing phone_number', () => {
    const profile = createMockProfile({ phone_number: '' });
    const result = calculateProfileCompletion(profile);

    expect(result.percentage).toBe(86);
    expect(result.incompleteSections).toContain('phone_number');
  });

  it('should handle missing location', () => {
    const profile = createMockProfile({ location: '' });
    const result = calculateProfileCompletion(profile);

    expect(result.percentage).toBe(86);
    expect(result.incompleteSections).toContain('location');
  });

  it('should handle missing job_title', () => {
    const profile = createMockProfile({ job_title: '' });
    const result = calculateProfileCompletion(profile);

    expect(result.percentage).toBe(86);
    expect(result.incompleteSections).toContain('job_title');
  });

  it('should handle missing bio', () => {
    const profile = createMockProfile({ bio: '' });
    const result = calculateProfileCompletion(profile);

    expect(result.percentage).toBe(86);
    expect(result.incompleteSections).toContain('bio');
  });

  it('should handle empty work_experience array', () => {
    const profile = createMockProfile({ work_experience: [] });
    const result = calculateProfileCompletion(profile);

    expect(result.percentage).toBe(86);
    expect(result.incompleteSections).toContain('work_experience');
  });

  it('should handle empty education array', () => {
    const profile = createMockProfile({ education: [] });
    const result = calculateProfileCompletion(profile);

    expect(result.percentage).toBe(86);
    expect(result.incompleteSections).toContain('education');
  });

  it('should handle whitespace-only strings as incomplete', () => {
    const profile = createMockProfile({
      full_name: '   ',
      bio: '\t\n',
    });
    const result = calculateProfileCompletion(profile);

    expect(result.incompleteSections).toContain('full_name');
    expect(result.incompleteSections).toContain('bio');
  });

  it('should handle multiple missing fields', () => {
    const profile = createMockProfile({
      full_name: '',
      phone_number: '',
      location: '',
    });
    const result = calculateProfileCompletion(profile);

    expect(result.percentage).toBe(57); // 4/7 = 57.1% rounds to 57%
    expect(result.incompleteSections).toHaveLength(3);
    expect(result.completedSections).toHaveLength(4);
  });

  it('should handle work_experience with multiple entries', () => {
    const profile = createMockProfile({
      work_experience: [
        {
          company: 'Company 1',
          position: 'Position 1',
        },
        {
          company: 'Company 2',
          position: 'Position 2',
        },
      ],
    });
    const result = calculateProfileCompletion(profile);

    expect(result.completedSections).toContain('work_experience');
    expect(result.percentage).toBe(100);
  });

  it('should handle education with multiple entries', () => {
    const profile = createMockProfile({
      education: [
        {
          institution: 'University 1',
          degree: 'BS',
          field_of_study: 'CS',
        },
        {
          institution: 'University 2',
          degree: 'MS',
          field_of_study: 'SE',
        },
      ],
    });
    const result = calculateProfileCompletion(profile);

    expect(result.completedSections).toContain('education');
    expect(result.percentage).toBe(100);
  });

  it('should round percentage correctly', () => {
    // 3/7 = 42.857... should round to 43
    const profile = createMockProfile({
      full_name: 'John',
      phone_number: '123',
      location: 'NYC',
      job_title: '',
      bio: '',
      work_experience: [],
      education: [],
    });
    const result = calculateProfileCompletion(profile);

    expect(result.percentage).toBe(43);
  });
});
