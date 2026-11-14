import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Vetriconn",
  description:
    "What Vetriconn collects, why, who sees it, how long it is kept, and the rights you have over it under Canadian privacy law.",
};

/**
 * The privacy policy the terms have referred to since July 2025 without it
 * existing anywhere a reader could reach.
 *
 * Written against the code: the collection list matches the data export
 * registry, the retention figures match what the backend enforces, and the
 * analytics section matches docs/telemetry.md. Where something has not been
 * settled, such as the legal review and the status of the visitor hash, this says so
 * rather than asserting a position the organisation has not taken.
 *
 * Not reviewed by a lawyer as of this writing. The page used to say so to
 * the reader; that notice was removed as a business decision, so this
 * comment is now the only record of it. Anyone changing this file should
 * know which parts are described from code and which are claims nobody has
 * checked, and the Canadian-law section is the second kind.
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

const UL = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="mb-4 space-y-2 font-open-sans text-base leading-relaxed text-gray-700">
    {items.map((item, i) => (
      <li key={i} className="flex gap-2.5">
        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
        <span className="min-w-0">{item}</span>
      </li>
    ))}
  </ul>
);

export default function PrivacyPolicyPage() {
  return (
    <main id="main-content" className="max-w-screen-2xl min-w-80 mx-auto">
      <div className="sticky bg-white top-0 left-0 z-50">
        <Header />
      </div>

      <article className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-14">
        <h1 className="font-lato text-3xl md:text-4xl font-bold text-text">
          Privacy Policy
        </h1>
        <p className="mt-2 font-open-sans text-sm text-gray-500">
          Last updated {LAST_UPDATED}
        </p>

        <P>
          Vetriconn connects retirees and veterans in Canada with paid work and
          volunteering. This page explains what we collect, why, who can see
          it, how long we keep it, and what you can ask us to do with it.
        </P>

        <H2>What we collect</H2>

        <H3>Things you give us</H3>
        <UL
          items={[
            "Your name, email address and password when you create an account. Passwords are stored only as a hash and we cannot read them.",
            "Your profile: phone number, location, job title, industry, years of experience and skills.",
            "Files you upload, such as a resume or certificates.",
            "Applications you send, drafts you save, jobs you save, searches you save, and entries in your application tracker.",
            "Messages you exchange with employers through the platform.",
            "Anything you post in community areas, and any report you file.",
            "Support tickets you open, and whether you agreed to marketing email.",
          ]}
        />

        <H3>Things recorded automatically</H3>
        <UL
          items={[
            "Security events on your account: sign-ins, failed sign-ins, sign-outs, password changes and email changes, each with the IP address and browser used. These exist so you and we can tell whether someone else reached your account.",
            <>
              If you accept analytics, which site you arrived from, any
              campaign tag in the link, and which pages you open. The{" "}
              <Link href="/cookies" className="text-primary hover:underline">
                Cookie Policy
              </Link>{" "}
              lists this in full. If you decline, none of it is recorded.
            </>,
          ]}
        />

        <H2>Why we collect it</H2>
        <UL
          items={[
            "To run the service you asked for: matching you to roles, letting you apply, and letting employers reply.",
            "To keep accounts secure and investigate misuse.",
            "To answer your support requests.",
            "To send you email you asked for. Marketing email is separate, optional, and refusing it does not affect your account.",
            "To understand where people find us, so we reach more of the people this service exists for. This is the only purpose that depends on your consent.",
          ]}
        />

        <H2>Who can see it</H2>
        <P>
          Employers see what you choose to send them. When you apply, that
          means your application and the profile information attached to it.
          Your privacy settings control how visible your profile is otherwise.
        </P>
        <P>
          Our support and moderation staff can see your account details and
          counts of your activity, such as how many applications you have
          sent. They cannot read your messages or your community posts from
          the admin console. Reading a conversation requires a moderation
          action, which is recorded against the person who performed it.
        </P>
        <P>
          Analytics reports are aggregate only and are visible to senior
          administrators. No report returns an individual row.
        </P>
        <P>We do not sell your information, and we do not share it with advertisers.</P>

        <H2>How long we keep it</H2>
        <UL
          items={[
            "Your account information: until you delete your account.",
            "Security events: 180 days, then deleted automatically.",
            "Analytics: 90 days, then deleted automatically.",
            "Application drafts you never submit: 90 days.",
            "Data export archives you request: they expire on a short timer, and the download link is single-use.",
          ]}
        />

        <H2>Your rights</H2>
        <P>
          Under Canadian federal law (PIPEDA) and provincial privacy laws
          including Quebec&apos;s Law 25, you can ask to see what we hold about
          you, correct it, or have it deleted.
        </P>
        <UL
          items={[
            <>
              <strong className="font-semibold">See it.</strong> Your account
              settings include a data export, which produces an archive of
              everything we hold about you and emails you a link to it.
            </>,
            <>
              <strong className="font-semibold">Correct it.</strong> Most of it
              is editable in your profile and settings directly.
            </>,
            <>
              <strong className="font-semibold">Delete it.</strong> You can
              deactivate your account from settings. Contact us if you want it
              removed entirely rather than deactivated.
            </>,
            <>
              <strong className="font-semibold">Withdraw consent.</strong>{" "}
              Clearing site data in your browser resets your analytics choice
              and the site will ask again. Marketing email has its own setting
              and an unsubscribe link in every message.
            </>,
          ]}
        />

        <H2>Things we want to be straight about</H2>
        <P>
          <strong className="font-semibold">Analytics uses a rotating
          identifier.</strong> So that we can count how many separate people
          visited rather than how many page views happened, each visit carries
          a short code derived from your account or your network address. It
          changes every day, so it cannot be used to follow you from one day
          to the next, and it is not stored alongside your name. Whether that
          code counts as personal information under Canadian law is a question
          we have put to a qualified reviewer rather than answered ourselves.
        </P>
        <P>
          <strong className="font-semibold">Security logging is not
          optional.</strong> Sign-in events are recorded whether or not you
          accept analytics, because they exist to protect your account rather
          than to measure traffic.
        </P>
        <P>
          <strong className="font-semibold">Where your data lives.</strong> Our
          servers and database are hosted with providers outside Canada, which
          means your information may be stored or processed abroad and may be
          subject to the laws of those countries.
        </P>

        <H2>Changes</H2>
        <P>
          If we change what we collect or why, we will update this page and
          its date. If the change needs your consent, we will ask again rather
          than assume.
        </P>

        <H2>Contact</H2>
        <P>
          For any request about your information, or to complain about how we
          have handled it, reach us through the{" "}
          <Link href="/#contact-section" className="text-primary hover:underline">
            contact form
          </Link>
          . If you are not satisfied with our answer, you can complain to the
          Office of the Privacy Commissioner of Canada, or to the Commission
          d&apos;acc&egrave;s &agrave; l&apos;information if you are in Quebec.
        </P>
      </article>

      <Footer />
    </main>
  );
}
