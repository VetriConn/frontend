import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import TermsOutline from "@/components/pages/terms/TermsOutline";
import {
  TERMS_EFFECTIVE_DATE,
  TERMS_H3_IDS,
  TERMS_SECTIONS,
  type TermsBlock,
} from "@/lib/terms-content";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms you agree to when you use Vetriconn, covering job seekers, employers, publishers, all users, and the refund policy.",
};

/**
 * The terms of service, which until now lived on a public Notion page linked
 * from the footer.
 *
 * Moving them here is not cosmetic. The terms are the document the privacy
 * and cookie policies are read against, they are what the cookie notice and
 * the signup flow point at, and a page we do not control can be edited,
 * moved, or taken down without anybody here noticing. On our own route the
 * text is in version control, so what a reader agreed to on a given date is
 * recoverable from git rather than from Notion's history.
 *
 * The text lives in lib/terms-content.ts. Read the comment at the top of that
 * file before changing anything: it records what was noticed in the source
 * document and left alone deliberately.
 */

const LAST_UPDATED = "14 November 2026";

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="font-open-sans text-base leading-relaxed text-gray-700 mb-4">
    {children}
  </p>
);

/**
 * Turns email addresses and the one phone number in the document into links,
 * so a reader on a phone can act on a contact detail instead of copying it
 * out by hand. Everything else passes through untouched.
 *
 * Split on a capturing group, so the separators survive and the array
 * alternates text, match, text. Index is a safe key here: the array is
 * derived from a constant string and never reorders.
 */
const EMAIL_OR_PHONE = /([\w.+-]+@[\w-]+\.[\w.]+|1-647-889-9542)/g;

const linkify = (text: string): React.ReactNode => {
  const parts = text.split(EMAIL_OR_PHONE);
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    if (i % 2 === 0) return part;
    const href = part.includes("@") ? `mailto:${part}` : `tel:${part.replace(/-/g, "")}`;
    return (
      <a key={i} href={href} className="text-primary hover:underline">
        {part}
      </a>
    );
  });
};

const Block = ({ block, id }: { block: TermsBlock; id?: string }) => {
  if (block.kind === "h3") {
    return (
      <h3
        id={id}
        className="font-lato text-base font-bold text-text mt-6 mb-2 scroll-mt-28"
      >
        {block.text}
      </h3>
    );
  }

  if (block.kind === "ul") {
    return (
      <ul className="mb-4 space-y-2 font-open-sans text-base leading-relaxed text-gray-700">
        {block.items.map((item, i) => (
          <li key={i} className="flex gap-2.5">
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
              aria-hidden="true"
            />
            <span className="min-w-0">{linkify(item)}</span>
          </li>
        ))}
      </ul>
    );
  }

  return <P>{linkify(block.text)}</P>;
};

export default function TermsPage() {
  return (
    <main id="main-content" className="max-w-screen-2xl min-w-80 mx-auto">
      <div className="sticky bg-white top-0 left-0 z-50">
        <Header />
      </div>

      <article className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-14">
        <h1 className="font-lato text-3xl md:text-4xl font-bold text-text">
          Terms &amp; Conditions
        </h1>
        <p className="mt-2 mb-6 font-open-sans text-sm text-gray-500">
          Effective {TERMS_EFFECTIVE_DATE}. Last updated {LAST_UPDATED}.
        </p>

        <P>
          These terms apply to everyone who uses Vetriconn. Sections A, B and C
          cover job seekers, employers and publishers in turn, so most readers
          need the one that describes them plus Section D, which applies to
          everybody. Where a section specific to you conflicts with Section D,
          your section takes precedence.
        </P>
        <P>
          Two companion documents are referred to throughout and form part of
          what you agree to: the{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>{" "}
          and the{" "}
          <Link href="/cookies" className="text-primary hover:underline">
            Cookie Policy
          </Link>
          .
        </P>

        {/* Generated from the same constant the sections render from, so a
            renamed or reordered section cannot leave a dead link behind.
            Hidden from xl up, where the floating outline takes over: two
            contents lists on one screen is one too many, and this one only
            names the six sections. */}
        <nav
          aria-label="Contents"
          className="mt-8 rounded-xl bg-[#f7f7f7] p-5 md:p-6 xl:hidden"
        >
          <h2 className="font-lato text-sm font-bold uppercase tracking-wide text-gray-500">
            Contents
          </h2>
          <ol className="mt-3 space-y-2">
            {TERMS_SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="font-open-sans text-base leading-relaxed text-gray-700 hover:text-primary hover:underline"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {TERMS_SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-28">
            <h2 className="font-lato text-xl font-bold text-text mt-12 mb-3">
              {section.title}
            </h2>
            {section.blocks.map((block, i) => (
              <Block key={i} block={block} id={TERMS_H3_IDS[`${section.id}:${i}`]} />
            ))}
          </section>
        ))}

        <hr className="mt-12 border-gray-200" />
        <p className="mt-6 font-open-sans text-sm leading-relaxed text-gray-500">
          Questions about these terms can go through the{" "}
          <Link href="/#contact-section" className="text-primary hover:underline">
            contact form
          </Link>
          . If you need help reading this page with assistive technology, call
          us on{" "}
          <a href="tel:16478899542" className="text-primary hover:underline">
            1-647-889-9542
          </a>{" "}
          or email{" "}
          <a
            href="mailto:accessibility@VetriConn.com"
            className="text-primary hover:underline"
          >
            accessibility@VetriConn.com
          </a>
          .
        </p>
      </article>

      <TermsOutline />

      <Footer />
    </main>
  );
}
