/**
 * Skills Data — Curated from O*NET taxonomy
 * Organized by category for autocomplete suggestions.
 * Source: https://services.onetcenter.org/
 *
 * This is a static fallback. When backend adds GET /api/v1/skills/suggestions,
 * the autocomplete should prefer the API response over this list.
 */

export interface SkillCategory {
  category: string;
  skills: string[];
}

export const SKILLS_BY_CATEGORY: SkillCategory[] = [
  {
    category: "Leadership & Management",
    skills: [
      "Team Leadership",
      "Project Management",
      "Strategic Planning",
      "Decision Making",
      "Conflict Resolution",
      "Performance Management",
      "Change Management",
      "Mentoring & Coaching",
      "Resource Management",
      "Risk Management",
      "Budget Management",
      "Stakeholder Management",
      "Operations Management",
      "Program Management",
      "Personnel Management",
    ],
  },
  {
    category: "Communication",
    skills: [
      "Written Communication",
      "Verbal Communication",
      "Public Speaking",
      "Technical Writing",
      "Report Writing",
      "Briefing & Presentations",
      "Active Listening",
      "Negotiation",
      "Cross-Cultural Communication",
      "Client Relations",
    ],
  },
  {
    category: "Technical & IT",
    skills: [
      "Microsoft Office",
      "Data Analysis",
      "Cybersecurity",
      "Network Administration",
      "Cloud Computing",
      "Database Management",
      "Systems Administration",
      "Software Development",
      "IT Support",
      "Technical Troubleshooting",
      "Information Security",
      "SCADA Systems",
      "GIS / Mapping",
      "CAD / CAM",
      "ERP Systems",
    ],
  },
  {
    category: "Logistics & Supply Chain",
    skills: [
      "Supply Chain Management",
      "Inventory Management",
      "Warehousing",
      "Fleet Management",
      "Procurement",
      "Distribution",
      "Quality Assurance",
      "Lean / Six Sigma",
      "Shipping & Receiving",
      "Vendor Management",
      "Asset Management",
      "Route Planning",
    ],
  },
  {
    category: "Healthcare & Medical",
    skills: [
      "Patient Care",
      "Emergency Medical Services",
      "Medical Terminology",
      "Health Records Management",
      "First Aid / CPR",
      "Triage",
      "Pharmacy Technician",
      "Radiology",
      "Physical Therapy",
      "Mental Health Counseling",
      "HIPAA Compliance",
      "Case Management",
    ],
  },
  {
    category: "Security & Law Enforcement",
    skills: [
      "Physical Security",
      "Security Operations",
      "Surveillance",
      "Access Control",
      "Emergency Response",
      "Investigations",
      "Force Protection",
      "Threat Assessment",
      "Crisis Management",
      "Protective Services",
      "Compliance Monitoring",
      "Intelligence Analysis",
    ],
  },
  {
    category: "Engineering & Maintenance",
    skills: [
      "Mechanical Engineering",
      "Electrical Engineering",
      "Civil Engineering",
      "Equipment Maintenance",
      "Preventive Maintenance",
      "Blueprint Reading",
      "Welding",
      "HVAC",
      "Plumbing",
      "Carpentry",
      "Heavy Equipment Operation",
      "Safety Compliance",
      "Environmental Compliance",
    ],
  },
  {
    category: "Administration & Office",
    skills: [
      "Office Management",
      "Scheduling & Coordination",
      "Records Management",
      "Data Entry",
      "Customer Service",
      "Accounts Payable / Receivable",
      "Travel Coordination",
      "Filing & Documentation",
      "Calendar Management",
      "Reception & Front Desk",
    ],
  },
  {
    category: "Training & Education",
    skills: [
      "Curriculum Development",
      "Classroom Instruction",
      "Training Program Design",
      "E-Learning",
      "Competency Assessment",
      "Onboarding",
      "Professional Development",
      "Adult Education",
      "Learning Management Systems",
    ],
  },
  {
    category: "Interpersonal & Soft Skills",
    skills: [
      "Problem Solving",
      "Critical Thinking",
      "Adaptability",
      "Time Management",
      "Attention to Detail",
      "Teamwork",
      "Work Ethic",
      "Stress Management",
      "Multitasking",
      "Organization",
      "Cultural Awareness",
      "Emotional Intelligence",
    ],
  },
];

/**
 * Flat list of all skills for simple autocomplete.
 * Deduplicated and sorted alphabetically.
 */
export const ALL_SKILLS: string[] = Array.from(
  new Set(SKILLS_BY_CATEGORY.flatMap((cat) => cat.skills)),
).sort((a, b) => a.localeCompare(b));

/**
 * Search skills by query — returns matching skills sorted by relevance.
 * Matches that start with the query are ranked higher.
 */
export function searchSkills(
  query: string,
  exclude: string[] = [],
  limit = 10,
): string[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase().trim();
  const excludeSet = new Set(exclude.map((s) => s.toLowerCase()));

  const results = ALL_SKILLS.filter(
    (skill) =>
      skill.toLowerCase().includes(q) && !excludeSet.has(skill.toLowerCase()),
  );

  // Sort: starts-with matches first, then contains
  results.sort((a, b) => {
    const aStarts = a.toLowerCase().startsWith(q) ? 0 : 1;
    const bStarts = b.toLowerCase().startsWith(q) ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;
    return a.localeCompare(b);
  });

  return results.slice(0, limit);
}
