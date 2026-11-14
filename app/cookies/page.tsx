import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Cookie Policy | Vetriconn",
  description:
    "How Vetriconn uses cookies, why, how long they last, and how to turn them off.",
};

/**
 * Written for a reader, not for a developer.
 *
 * The first version of this page listed storage keys in a monospace table,
 * which is a debugging aid rather than a policy: nobody deciding whether to
 * trust us needs to know a key is called vc_visit_sent. The cookies are now
 * grouped by what they do, in prose, which is how every policy worth
 * copying is written.
 *
 * Still accurate against the code. Each group below corresponds to
 * something this repository actually sets, and the retention figures are
 * the ones the backend enforces. Nothing is listed that we do not set, and
 * nothing we set is missing.
 */

const LAST_UPDATED = "14 November 2026";

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-lato text-xl font-bold text-text mt-10 mb-3">{children}</h2>
);

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-lato text-base font-bold text-text mt-6 mb-2">{children}</h3>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="font-open-sans text-base leading-relaxed text-gray-700 mb-4">
    {children}
  </p>
);

const A = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="text-primary hover:underline">
    {children}
  </Link>
);

export default function CookiePolicyPage() {
  return (
    <main id="main-content" className="max-w-screen-2xl min-w-80 mx-auto">
      <div className="sticky bg-white top-0 left-0 z-50">
        <Header />
      </div>

      <article className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-14">
        <h1 className="font-lato text-3xl md:text-4xl font-bold text-text">
          Cookie Policy
        </h1>
        <p className="mt-2 font-open-sans text-sm text-gray-500">
          Last updated {LAST_UPDATED}
        </p>

        <P>
          This policy explains how Vetriconn uses cookies and similar
          technologies when you visit our website, why we use them, and how
          you can control them. It forms part of our{" "}
          <A href="/privacy">Privacy Policy</A>. Please read it alongside that
          document.
        </P>

        <H2>What are cookies?</H2>
        <P>
          A cookie is a small text file that a website saves on your computer
          or phone when you visit. It lets the site remember things about you,
          such as the fact that you are signed in or how you prefer the page to
          look, so you do not have to set them again on every page.
        </P>
        <P>
          Websites also use similar technologies that work the same way but
          store information in your browser rather than in a cookie. Where this
          policy says cookies, it means both.
        </P>

        <H2>Your consent</H2>
        <P>
          The first time you visit, we ask whether you are willing to accept
          analytics cookies. Nothing optional is stored until you answer. If
          you accept, we set the cookies described under Analytics below. If
          you decline, we do not, and the site works normally without them.
        </P>
        <P>
          A small number of cookies are necessary for the site to function at
          all, and these are set whichever answer you give. They are described
          under Necessary cookies below. We cannot offer the service without
          them, so they are not part of the choice.
        </P>

        <H2>Withdrawing your consent</H2>
        <P>
          You can change your mind at any time by clearing cookies and site
          data for this site in your browser settings. That removes your saved
          answer along with everything else, and we will ask again the next
          time you visit.
        </P>

        <H2>Why we use cookies</H2>
        <P>We use cookies to:</P>
        <ul className="mb-4 space-y-2 font-open-sans text-base leading-relaxed text-gray-700">
          {[
            "Keep you signed in as you move between pages",
            "Remember how you prefer to read the site, such as larger text or higher contrast",
            "Remember your answer to this cookie question so you are not asked repeatedly",
            "Understand which websites people arrive from, so we know where to reach more veterans and retirees",
          ].map((item) => (
            <li key={item} className="flex gap-2.5">
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                aria-hidden="true"
              />
              <span className="min-w-0">{item}</span>
            </li>
          ))}
        </ul>
        <P>
          We do not use cookies for advertising. We do not sell what they
          record, and we do not allow any other company to set cookies through
          our site.
        </P>

        <H2>The cookies we set</H2>

        <H3>Necessary cookies</H3>
        <P>
          <strong className="font-semibold">Signing in.</strong> When you sign
          in, we set a cookie that keeps you signed in as you move around the
          site. It is readable only by our servers, never by scripts running in
          the page, and it ends when it expires or when you sign out.
        </P>
        <P>
          <strong className="font-semibold">Your reading settings.</strong> If
          you change the text size or contrast, we save that choice so the site
          looks the same next time. It stays until you clear it.
        </P>
        <P>
          <strong className="font-semibold">Your cookie choice.</strong> We
          save your answer to the question above so we do not ask again on
          every page. It stays until you clear it.
        </P>

        <H3>Analytics cookies</H3>
        <P>
          These are set only if you accept. They let us record which website
          you came from, any campaign tag in the link you followed, and which
          pages you open, so we can tell which of our efforts actually reach
          people. One of them simply marks that your visit has already been
          counted, so the same visit is not recorded twice, and it ends when
          you close the tab.
        </P>
        <P>
          What they record is held for 90 days and then deleted automatically.
          We do not store your IP address or your browser&apos;s identifying
          string, and where a web address is recorded we keep only the domain,
          not the full page.
        </P>

        <H2>Disabling cookies</H2>
        <P>
          You can block or delete cookies in your browser settings. Every
          browser is different, so use its Help menu to find out how. Blocking
          all cookies affects most websites you visit, not just this one, and
          on this site it will stop you from being able to sign in and will
          lose your reading settings.
        </P>
        <P>
          If you only want to stop the optional ones, declining when we ask, or
          clearing this site&apos;s data and declining next time, is enough.
        </P>

        <H2>Changes to this policy</H2>
        <P>
          If we begin using cookies for something not described here, we will
          update this page and its date, and ask for your consent again where
          the law requires it.
        </P>

        <H2>Contact</H2>
        <P>
          If you have a question about this policy or about anything we hold
          about you, reach us through the{" "}
          <A href="/#contact-section">contact form</A>. Our{" "}
          <A href="/privacy">Privacy Policy</A> covers information you give us
          directly, such as your profile and applications.
        </P>
      </article>

      <Footer />
    </main>
  );
}
