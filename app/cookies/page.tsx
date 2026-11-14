import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Cookie Policy | Vetriconn",
  description:
    "What Vetriconn stores in your browser, why, how long it is kept, and how to change your mind.",
};

/**
 * The document the consent banner and the terms both refer to.
 *
 * Written against the code rather than from a template: every row in the
 * table below is a key something in this repository actually writes, and
 * the retention figures are the ones the backend enforces. A policy that
 * lists cookies the product does not set, or omits ones it does, is worse
 * than none, because it is a statement the product contradicts.
 */

const LAST_UPDATED = "14 November 2026";

const Row = ({
  name,
  kind,
  purpose,
  life,
}: {
  name: string;
  kind: string;
  purpose: string;
  life: string;
}) => (
  <tr className="border-t border-gray-100 align-top">
    <td className="py-3 pr-4 font-mono text-xs text-text">{name}</td>
    <td className="py-3 pr-4 text-sm text-gray-600 whitespace-nowrap">{kind}</td>
    <td className="py-3 pr-4 text-sm text-gray-600">{purpose}</td>
    <td className="py-3 text-sm text-gray-600 whitespace-nowrap">{life}</td>
  </tr>
);

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-lato text-xl font-bold text-text mt-10 mb-3">{children}</h2>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="font-open-sans text-base leading-relaxed text-gray-700 mb-4">
    {children}
  </p>
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
          This page lists everything Vetriconn stores in your browser. It is
          written from the code, so it describes what the site actually does
          rather than what a template assumes. If you find something stored
          that is not on this page, that is a mistake and we would like to
          know.
        </P>

        <H2>The short version</H2>
        <P>
          Four things are stored whatever you choose, because the site cannot
          work without them: your sign-in session, your accessibility
          settings, a note of whether you were signed in, and your answer to
          the cookie question. One thing is stored only if you accept
          analytics: a marker that stops us counting the same visit twice.
        </P>
        <P>
          We set no advertising cookies, no third-party cookies, and no
          cross-site trackers. Nothing here is sold or shared with advertisers.
        </P>

        <H2>Necessary. Stored either way.</H2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-500">
                <th className="pb-2 pr-4 font-semibold">Name</th>
                <th className="pb-2 pr-4 font-semibold">Type</th>
                <th className="pb-2 pr-4 font-semibold">Purpose</th>
                <th className="pb-2 font-semibold">Kept for</th>
              </tr>
            </thead>
            <tbody>
              <Row
                name="authToken"
                kind="Cookie"
                purpose="Keeps you signed in. Set only when you sign in, and readable only by the server, never by scripts in the page."
                life="Until it expires or you sign out"
              />
              <Row
                name="vetriconn-accessibility"
                kind="Local storage"
                purpose="Your reading settings, such as text size and contrast, so the site looks the way you set it next time."
                life="Until you clear it"
              />
              <Row
                name="vc:signed-in"
                kind="Local storage"
                purpose="A yes or no note used to draw the right button in the header on first paint, so it does not flicker. It is not used to decide what you can access."
                life="Until you clear it"
              />
              <Row
                name="vc:analytics-consent"
                kind="Local storage"
                purpose="Your answer to the analytics question, so you are not asked on every page."
                life="Until you clear it"
              />
            </tbody>
          </table>
        </div>

        <H2>Analytics. Only if you accept.</H2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-500">
                <th className="pb-2 pr-4 font-semibold">Name</th>
                <th className="pb-2 pr-4 font-semibold">Type</th>
                <th className="pb-2 pr-4 font-semibold">Purpose</th>
                <th className="pb-2 font-semibold">Kept for</th>
              </tr>
            </thead>
            <tbody>
              <Row
                name="vc_visit_sent"
                kind="Session storage"
                purpose="Marks that this visit has already been counted, so one visit is not recorded several times."
                life="Until you close the tab"
              />
            </tbody>
          </table>
        </div>
        <P>
          If you accept, we record which site you arrived from, any campaign
          tag in the link you followed, and which pages you open. That is held
          on our servers for 90 days and then deleted automatically. We do not
          store your IP address, your browser's user-agent string, or the full
          address of the page you came from, only its domain.
        </P>

        <H2>Changing your mind</H2>
        <P>
          Clearing site data in your browser removes everything on this page,
          including your answer, and the site will ask again on your next
          visit. Declining analytics does not reduce anything you can do here.
        </P>

        <H2>Questions</H2>
        <P>
          Our <Link href="/privacy" className="text-primary hover:underline">Privacy
          Policy</Link> explains what we do with information you give us, such
          as your profile and applications. For anything not covered, contact
          us through the <Link href="/#contact-section" className="text-primary hover:underline">contact
          form</Link>.
        </P>
      </article>

      <Footer />
    </main>
  );
}
