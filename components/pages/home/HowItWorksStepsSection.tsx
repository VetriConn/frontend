import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";

const steps = [
  {
    title: "Create your free account",
    description:
      "Sign up in seconds to access job opportunities tailored to your skills and experience.",
  },
  {
    title: "Upload your credentials",
    description:
      "Easily upload your resume and any required certifications to complete your profile.",
  },
  {
    title: "Get matched and notified",
    description:
      "Save a search and we'll email you new matching jobs - no need to keep checking back.",
  },
];

export const HowItWorksStepsSection = () => (
  <section className="bg-gray-bg py-20 md:py-28 w-full mobile:py-14 relative overflow-hidden">
    {/* Decorative dots */}

    <div className="max-w-[1600px] mx-auto px-[5%] md:px-10 lg:px-14 relative z-10">
      <Reveal className="text-center mb-12 mobile:mb-8">
        <Eyebrow>Getting started</Eyebrow>
        <h2 className="heading-1">
          Three steps to your <span className="text-primary">next role</span>.
        </h2>
      </Reveal>
      {/* A path, not three unrelated columns. Each step is a node on a line
          that runs behind them, so the eye is told the order instead of having
          to infer it from a floating "01". The connector is decorative and
          hidden from assistive tech; the ordered list carries the sequence. */}
      <ol className="relative flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-6 list-none p-0 m-0">
        {/* The rail, drawn between the first and last node only. */}
        <span
          aria-hidden="true"
          className="hidden lg:block absolute top-9 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-primary/15 via-primary/30 to-primary/15"
        />

        {steps.map((step, idx) => (
          <Reveal
            as="li"
            key={idx}
            index={idx}
            className="group/step relative flex-1 flex flex-col items-center text-center px-4 max-w-sm mx-auto lg:mx-0"
          >
            {/* Node: the number sits inside the circle it belongs to, and the
                icon sits under it, so the two read as one object. */}
            <span className="relative z-10 mb-4 lg:mb-6 flex h-14 w-14 lg:h-[72px] lg:w-[72px] shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-primary/20 shadow-[0_2px_10px_-4px_rgba(229,62,62,0.35)] transition-shadow duration-300 group-hover/step:ring-primary/50 group-hover/step:shadow-[0_4px_16px_-4px_rgba(229,62,62,0.45)] motion-reduce:transition-none transition-[box-shadow,ring-color] duration-300 group-hover/step:ring-primary/50 group-hover/step:shadow-[0_6px_18px_-6px_rgba(229,62,62,0.5)] motion-reduce:transition-none">
              <span className="font-lato text-base lg:text-xl font-bold text-primary tabular-nums">
                {String(idx + 1).padStart(2, "0")}
              </span>
            </span>

            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2.5">
              {step.title}
            </h3>
            <p className="font-open-sans text-base text-text-muted leading-relaxed mobile:text-sm max-w-[34ch]">
              {step.description}
            </p>
          </Reveal>
        ))}
      </ol>
    </div>
  </section>
);
