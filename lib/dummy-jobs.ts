/**
 * Dummy job data for UI development.
 * TODO: Remove once backend /jobs/:id API is fully wired up.
 */
import { Job } from "@/types/job";

export const DUMMY_JOBS: Record<string, Job> = {
  "1": {
    id: "1",
    role: "Customer Service Representative",
    company_name: "TechSupport Solutions",
    company_logo: "/images/company-logo.jpg",
    location: "Remote",
    salary_range: {
      start_salary: { symbol: "$", number: 37000, currency: "CAD" },
      end_salary: { symbol: "$", number: 46000, currency: "CAD" },
    },
    tags: [
      { name: "Remote Available", color: "flutter" },
      { name: "Part-Time", color: "mobile" },
    ],
    full_description:
      "We're looking for a dedicated Customer Service Representative to join our growing support team. In this role, you'll be the first point of contact for our customers, handling inquiries via phone, email, and live chat. You'll troubleshoot technical issues, process orders, and ensure every interaction ends with a satisfied customer.\n\nThis is a remote-friendly position with flexible hours, perfect for someone who values work-life balance while making a real impact. Our team supports veterans transitioning to civilian careers and provides comprehensive onboarding to get you up to speed quickly.",
    responsibilities: [
      "Handle inbound customer inquiries via phone, email, and live chat with professionalism and empathy",
      "Troubleshoot basic technical issues and escalate complex problems to the appropriate team",
      "Process customer orders, returns, and account updates accurately",
      "Document all customer interactions in the CRM system",
      "Meet or exceed customer satisfaction targets and response time goals",
      "Collaborate with team members to identify recurring issues and suggest process improvements",
    ],
    qualifications: [
      "Excellent verbal and written communication skills in English",
      "Previous customer service or client-facing experience (military service counts!)",
      "Ability to remain calm and professional in high-pressure situations",
      "Basic computer literacy and ability to learn new software quickly",
      "Strong attention to detail and problem-solving skills",
      "Reliable internet connection for remote work",
    ],
  },
  "2": {
    id: "2",
    role: "Administrative Assistant",
    company_name: "Community Health Center",
    company_logo: "/images/company-logo.jpg",
    location: "Austin, TX",
    salary_range: {
      start_salary: { symbol: "$", number: 42000, currency: "CAD" },
      end_salary: { symbol: "$", number: 52000, currency: "CAD" },
    },
    tags: [
      { name: "On-Site", color: "ios" },
      { name: "Part-Time", color: "mobile" },
    ],
    full_description:
      "Join our Community Health Center as an Administrative Assistant and play a vital role in keeping our operations running smoothly. You'll manage scheduling, coordinate patient communications, and support our clinical staff with essential administrative tasks.\n\nThis position offers a meaningful opportunity to contribute to community health while leveraging your organizational skills. We value the discipline and attention to detail that veterans bring to administrative roles.",
    responsibilities: [
      "Manage appointment scheduling and maintain organized patient records",
      "Answer incoming calls, greet visitors, and direct inquiries to the appropriate department",
      "Prepare correspondence, reports, and meeting agendas",
      "Coordinate office supplies, equipment maintenance, and vendor relationships",
      "Assist with insurance verification and billing documentation",
      "Support clinical staff with data entry and file management tasks",
    ],
    qualifications: [
      "Strong organizational and time management skills",
      "Proficiency with Microsoft Office Suite (Word, Excel, Outlook)",
      "Excellent interpersonal and communication skills",
      "Ability to handle sensitive information with confidentiality",
      "Previous administrative or office experience preferred",
      "Detail-oriented with the ability to multitask effectively",
    ],
  },
  "3": {
    id: "3",
    role: "Retail Associate",
    company_name: "Home & Garden Co.",
    company_logo: "/images/company-logo.jpg",
    location: "Denver, CO (Hybrid)",
    salary_range: {
      start_salary: { symbol: "$", number: 33000, currency: "CAD" },
      end_salary: { symbol: "$", number: 40000, currency: "CAD" },
    },
    tags: [
      { name: "Flexible Schedule", color: "android" },
      { name: "In-Store", color: "dart" },
    ],
    full_description:
      "Home & Garden Co. is seeking a friendly, knowledgeable Retail Associate to help customers find the perfect products for their home improvement projects. You'll provide expert advice, maintain attractive product displays, and contribute to a welcoming store environment.\n\nWe offer a flexible schedule that works around your life, competitive pay, and an employee discount on all store merchandise. Veterans are especially welcome — your leadership experience and can-do attitude are exactly what we're looking for.",
    responsibilities: [
      "Greet customers warmly and provide knowledgeable product recommendations",
      "Assist customers with locating items, comparing products, and making purchasing decisions",
      "Maintain clean, organized, and visually appealing product displays",
      "Process sales transactions accurately using the point-of-sale system",
      "Restock shelves and assist with inventory management",
      "Stay current on product knowledge and seasonal promotions",
    ],
    qualifications: [
      "Friendly, approachable personality with strong customer service orientation",
      "Ability to stand for extended periods and lift up to 40 lbs",
      "Basic math skills and experience with cash handling",
      "Interest in home improvement, gardening, or related fields",
      "Ability to work weekends and some holidays as needed",
      "Team player with a positive, can-do attitude",
    ],
  },
  "4": {
    id: "4",
    role: "Virtual Tutor",
    company_name: "LearnBright Academy",
    company_logo: "/images/company-logo.jpg",
    location: "Remote",
    salary_range: {
      start_salary: { symbol: "$", number: 52000, currency: "CAD" },
      end_salary: { symbol: "$", number: 73000, currency: "CAD" },
    },
    tags: [
      { name: "Remote Available", color: "flutter" },
      { name: "Part-Time", color: "mobile" },
      { name: "Education", color: "react" },
    ],
    full_description:
      "LearnBright Academy is looking for passionate Virtual Tutors to deliver personalized online lessons to students of all ages. You'll work one-on-one with learners in subjects ranging from math and science to language arts and test preparation.\n\nSet your own hours and work from anywhere with a reliable internet connection. Our platform handles scheduling, payments, and curriculum resources — you just bring the expertise and enthusiasm. Military veterans with leadership and mentoring experience thrive in this role.",
    responsibilities: [
      "Deliver engaging one-on-one tutoring sessions via our online platform",
      "Assess student learning needs and develop personalized lesson plans",
      "Track student progress and provide regular feedback to students and parents",
      "Use interactive tools and resources to make learning enjoyable and effective",
      "Maintain accurate session records and attendance logs",
      "Participate in tutor training sessions and contribute to curriculum improvement",
    ],
    qualifications: [
      "Strong knowledge in one or more academic subject areas",
      "Patience, empathy, and excellent communication skills",
      "Experience in teaching, tutoring, mentoring, or training (military training counts!)",
      "Comfortable with technology and online collaboration tools",
      "Self-motivated with the ability to manage your own schedule",
      "Bachelor's degree or equivalent experience preferred",
    ],
  },
  "5": {
    id: "5",
    role: "Data Entry Specialist",
    company_name: "DataFlow Inc.",
    company_logo: "/images/company-logo.jpg",
    location: "Remote",
    salary_range: {
      start_salary: { symbol: "$", number: 35000, currency: "CAD" },
      end_salary: { symbol: "$", number: 44000, currency: "CAD" },
    },
    tags: [
      { name: "Remote Available", color: "flutter" },
      { name: "Full-Time", color: "ios" },
    ],
    full_description:
      "DataFlow Inc. needs a detail-oriented Data Entry Specialist to help us maintain accurate, up-to-date databases. You'll be responsible for entering, verifying, and updating data across multiple systems, ensuring the highest level of accuracy.\n\nThis fully remote position offers flexible hours and is ideal for someone who thrives on precision and structured tasks. Veterans with experience in logistics, supply chain, or administrative roles will find their skills directly transferable.",
    responsibilities: [
      "Enter and update data in company databases and spreadsheets with 99%+ accuracy",
      "Verify data by comparing source documents against entered records",
      "Identify and correct data discrepancies and report recurring issues",
      "Generate routine reports and summaries from database records",
      "Maintain data confidentiality and follow security protocols",
      "Assist with data migration and system transition projects as needed",
    ],
    qualifications: [
      "Fast and accurate typing skills (minimum 50 WPM)",
      "Strong attention to detail and organizational skills",
      "Proficiency with spreadsheets (Excel or Google Sheets)",
      "Ability to work independently and meet deadlines consistently",
      "Previous data entry, clerical, or administrative experience",
      "Comfortable working with large volumes of data",
    ],
  },
  "6": {
    id: "6",
    role: "Bookkeeper",
    company_name: "Small Business Services",
    company_logo: "/images/company-logo.jpg",
    location: "Chicago, IL",
    salary_range: {
      start_salary: { symbol: "$", number: 46000, currency: "CAD" },
      end_salary: { symbol: "$", number: 58000, currency: "CAD" },
    },
    tags: [
      { name: "Part-Time", color: "mobile" },
      { name: "On-Site", color: "dart" },
      { name: "Finance", color: "android" },
    ],
    full_description:
      "Small Business Services is hiring a Bookkeeper to manage financial records for our growing portfolio of small business clients. You'll handle accounts payable/receivable, bank reconciliations, and monthly financial reporting.\n\nThis is a great opportunity for someone with an eye for numbers and a passion for helping small businesses succeed. We offer a supportive team environment and value the discipline and accountability that veterans bring to financial management.",
    responsibilities: [
      "Maintain accurate financial records using QuickBooks and Excel",
      "Process accounts payable and receivable transactions",
      "Perform monthly bank and credit card reconciliations",
      "Prepare financial reports including profit & loss and balance sheets",
      "Assist with payroll processing and tax documentation",
      "Communicate with clients to resolve billing questions and discrepancies",
    ],
    qualifications: [
      "Knowledge of bookkeeping principles and accounting fundamentals",
      "Experience with QuickBooks, FreshBooks, or similar accounting software",
      "Strong proficiency in Microsoft Excel",
      "Excellent organizational skills and attention to detail",
      "Ability to manage multiple client accounts simultaneously",
      "Associate degree in accounting or equivalent experience",
    ],
  },
  "7": {
    id: "7",
    role: "Customer Support Agent",
    company_name: "Online Retail Co.",
    company_logo: "/images/company-logo.jpg",
    location: "Remote",
    salary_range: {
      start_salary: { symbol: "$", number: 37000, currency: "CAD" },
      end_salary: { symbol: "$", number: 50000, currency: "CAD" },
    },
    tags: [
      { name: "Remote Available", color: "flutter" },
      { name: "Full-Time", color: "ios" },
      { name: "E-Commerce", color: "react" },
    ],
    full_description:
      "Online Retail Co. is expanding our customer support team and looking for agents who are passionate about delivering exceptional service. You'll assist customers with order tracking, product questions, returns, and general inquiries through multiple channels.\n\nWe offer comprehensive training, performance bonuses, and a supportive remote work culture. Our company is proud to be a veteran-friendly employer and recognizes the communication skills and resilience that military service builds.",
    responsibilities: [
      "Respond to customer inquiries via email, chat, and phone within SLA targets",
      "Process order modifications, cancellations, and return requests",
      "Investigate and resolve shipping issues and delivery complaints",
      "Provide accurate product information and make personalized recommendations",
      "Escalate complex issues to senior support staff when needed",
      "Contribute to the knowledge base by documenting common solutions",
    ],
    qualifications: [
      "Strong written and verbal communication skills",
      "Empathetic, patient, and solution-oriented mindset",
      "Ability to multitask and manage multiple conversations simultaneously",
      "Experience with support ticketing systems (Zendesk, Freshdesk, etc.) is a plus",
      "Comfortable working rotating shifts including some evenings",
      "Self-motivated with the ability to work independently from home",
    ],
  },
  "8": {
    id: "8",
    role: "Technical Writer",
    company_name: "SoftDocs LLC",
    company_logo: "/images/company-logo.jpg",
    location: "Remote",
    salary_range: {
      start_salary: { symbol: "$", number: 62000, currency: "CAD" },
      end_salary: { symbol: "$", number: 83000, currency: "CAD" },
    },
    tags: [
      { name: "Remote Available", color: "flutter" },
      { name: "Contract", color: "android" },
      { name: "Technology", color: "web" },
    ],
    full_description:
      "SoftDocs LLC is seeking a skilled Technical Writer to create clear, concise documentation for our software products. You'll transform complex technical concepts into user-friendly guides, API docs, and release notes that help our customers succeed.\n\nThis is a flexible contract position with potential for full-time conversion. We value clear thinking and structured communication — skills that veterans develop through years of writing operational orders, reports, and procedures. If you can explain complex systems in simple terms, we want to hear from you.",
    responsibilities: [
      "Write and maintain user guides, API documentation, and release notes",
      "Collaborate with engineering and product teams to understand features and workflows",
      "Review and edit existing documentation for accuracy, clarity, and consistency",
      "Create diagrams, screenshots, and visual aids to supplement written content",
      "Develop and maintain documentation standards and style guides",
      "Gather user feedback to continuously improve documentation quality",
    ],
    qualifications: [
      "Excellent writing, editing, and proofreading skills",
      "Ability to translate complex technical concepts into clear, accessible language",
      "Experience with documentation tools (Confluence, GitBook, Markdown, etc.)",
      "Basic understanding of software development and APIs",
      "Strong research and interviewing skills",
      "Portfolio or writing samples demonstrating technical writing ability",
    ],
  },
};

/**
 * Look up a job by ID — returns dummy data if found, or null.
 */
export function getDummyJob(id: string): Job | null {
  return DUMMY_JOBS[id] ?? null;
}
