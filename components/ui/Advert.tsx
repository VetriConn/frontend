import Link from "next/link";
import { HiOutlineArrowRight } from "react-icons/hi2";

/**
 * The pre-launch research invite.
 *
 * A band in its own right rather than a card floating in a gap: full-bleed
 * tint, the message on one line with the action beneath it. Reads like a
 * marquee strip without actually moving — nothing here is worth stealing
 * attention with motion, and the audience skews older.
 *
 * Sits after "How it works", so the page has finished making its case before
 * asking the reader for a favour.
 *
 * Not dismissible: this is a section of the page, not a banner over it. It
 * used to carry a close button and remember the choice in localStorage, which
 * is the right behaviour for something that interrupts and the wrong one for
 * something the page is made of — nobody expects a paragraph to have an X.
 */
const Advert = () => {
  return (
    <section
      aria-label="Product research invitation"
      className="w-full bg-red-50 py-8 md:py-9"
    >
      <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center gap-5 px-[7%] text-center md:px-10 lg:px-14">
        {/* One sentence at desktop width, two lines when there isn't room for
            one. Both halves stay in a single <p> so it reads as one thought to
            a screen reader either way. */}
        <p className="font-lato text-base md:text-lg text-gray-900">
          <span className="font-bold">
            We&apos;re building Vetriconn in the open.
          </span>{" "}
          <span className="font-open-sans font-normal text-gray-600 block md:inline">
            Tell us what you need from a job board.
          </span>
        </p>

        <Link
          href="https://forms.gle/Bdwab4EUHJ2eAUu88"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex w-full sm:w-auto min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        >
          Take the survey
          <HiOutlineArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  );
};

export default Advert;
