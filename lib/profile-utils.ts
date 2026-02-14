/**
 * Profile Completion Utilities
 * Functions for calculating profile completion status
 */

import { UserProfile } from '@/types/api';

export interface CompletionStatus {
  percentage: number;
  completedSections: string[];
  incompleteSections: string[];
}

/**
 * Calculate profile completion percentage and section status
 * 
 * Required fields for profile completion:
 * - full_name: User's full name
 * - phone_number: Contact phone number
 * - location: User's location (city/country)
 * - job_title: Current or desired job title
 * - bio: Professional bio
 * - work_experience: Array of work experience entries (must have at least one)
 * - education: Array of education entries (must have at least one)
 * 
 * @param profile - User profile object
 * @returns CompletionStatus with percentage and section lists
 */
export function calculateProfileCompletion(profile: UserProfile): CompletionStatus {
  // Define required fields for profile completion
  const requiredFields = [
    'full_name',
    'phone_number',
    'location',
    'job_title',
    'bio',
    'work_experience',
    'education'
  ] as const;

  const completedSections: string[] = [];
  const incompleteSections: string[] = [];

  // Check each required field
  requiredFields.forEach((field) => {
    const value = profile[field];
    let isComplete = false;

    // Handle array fields (work_experience, education)
    if (Array.isArray(value)) {
      isComplete = value.length > 0;
    } 
    // Handle string fields
    else if (typeof value === 'string') {
      isComplete = value.trim() !== '';
    }
    // Handle other types (should have a value)
    else {
      isComplete = value !== undefined && value !== null;
    }

    if (isComplete) {
      completedSections.push(field);
    } else {
      incompleteSections.push(field);
    }
  });

  // Calculate percentage
  const percentage = Math.round((completedSections.length / requiredFields.length) * 100);

  return {
    percentage,
    completedSections,
    incompleteSections
  };
}
