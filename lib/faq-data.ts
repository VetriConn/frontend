export interface FaqItem {
  question: string;
  answer: string;
}

// Every answer here describes what the product actually does today. The old
// copy promised premium tiers, mentorship, phone support, and a 45+ age rule
// - none of which exist, and a FAQ that answers with fiction costs more trust
// than no FAQ at all.
export const FAQ_DATA: FaqItem[] = [
  {
    question: "What is Vetriconn?",
    answer:
      "Vetriconn is a Canadian job board that connects retirees and veterans with paid work and volunteer opportunities.",
  },
  {
    question: "Who can use Vetriconn?",
    answer:
      "Anyone. Vetriconn is built for veterans, retirees, and older adults returning to work, but there is no age requirement - if the roles here fit you, you're welcome.",
  },
  {
    question: "Is there a cost to use Vetriconn?",
    answer:
      "No. Searching, applying, and posting jobs are free.",
  },
  {
    question: "What types of opportunities are available?",
    answer:
      "Part-time, full-time, contract, and seasonal jobs, plus volunteer roles - remote, hybrid, and on-site.",
  },
  {
    question: "I haven't worked in years. Can I still apply?",
    answer:
      "Absolutely. Many employers on Vetriconn value your experience, leadership, and reliability regardless of the gap.",
  },
  {
    question: "How do job matches work?",
    answer:
      "Your dashboard recommends jobs based on the job title, industry, and location in your profile, and you can save a search to get new matching jobs by email.",
  },
  {
    question: "I'm not tech-savvy. Can I still use Vetriconn?",
    answer:
      "Vetriconn is designed to be simple and readable. If you get stuck, write to us through the contact form and a person will help you.",
  },
  {
    question: "Can I browse anonymously or hide my profile?",
    answer:
      "Yes. In your privacy settings you can make your profile visible to everyone, to employers only, or to no one - browsing never requires a visible profile.",
  },
];
