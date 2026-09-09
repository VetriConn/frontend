import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import Image from "next/image";

interface Benefit {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

// SVG Icons as components
const benefits: Benefit[] = [
  {
    title: "One profile, every application",
    description:
      "Fill in your details once. Apply to any role with the same profile - no starting over each time.",
    image: "/images/jobs_hero3.jpg",
    imageAlt: "Easy and convenient job searching",
  },
  {
    title: "Roles that come to you",
    description:
      "Tell us the work and hours you want. We'll email you new jobs that match.",
    image: "/images/hero/8.jpg",
    imageAlt: "Connected professionals collaborating",
  },
  {
    title: "Paid work and volunteering",
    description:
      "Full-time, part-time, and volunteer placements from Canadian organisations that want experienced people.",
    image: "/images/hero/5.jpg",
    imageAlt: "Building stronger communities together",
  },
];

interface BenefitsSectionProps {
  id?: string;
}

export const BenefitsSection = ({ id }: BenefitsSectionProps) => (
  <section
    id={id}
    className="py-20 md:py-28 bg-white mobile:py-14 relative overflow-hidden"
    aria-labelledby="benefits-heading"
  >
    {/* Decorative dots */}

    <div className="max-w-[1600px] mx-auto px-[5%] md:px-10 lg:px-14 relative z-10">
      {/* Headline */}
      <Reveal className="text-center max-w-3xl mx-auto mb-16 mobile:mb-10">
        <Eyebrow>Why Vetriconn</Eyebrow>
        <h2 id="benefits-heading" className="heading-1 mb-5 mobile:mb-4">
          Work that fits <span className="text-primary">your life</span>.
        </h2>
        <p className="body-text text-lg mobile:text-base">
          Search roles chosen for experienced Canadians, apply without
          rewriting your history, and hear back from people who wanted your
          experience in the first place.
        </p>
      </Reveal>

      {/* Benefit rows — alternating image + text */}
      <div className="flex flex-col gap-10 md:gap-14 w-full">
        {benefits.map((benefit, idx) => {
          const isReversed = idx % 2 !== 0;
          return (
            <Reveal
              as="article"
              key={idx}
              index={idx}
              className={`group grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 lg:gap-16 items-center ${isReversed ? "direction-rtl" : ""}`}
            >
              {/* Image */}
              <div
                className={`relative w-full aspect-[16/10] lg:aspect-[5/4] rounded-2xl overflow-hidden shadow-md transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0 order-2 ${isReversed ? "lg:order-2" : "lg:order-1"}`}
              >
                <Image
                  src={benefit.image}
                  alt={benefit.imageAlt}
                  fill
                  className="object-cover w-full h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:transform-none"
                  sizes="(max-width: 850px) 100vw, 50vw"
                  loading={idx === 0 ? "eager" : "lazy"}
                  
                />
              </div>

              {/* Text */}
              <div
                className={`text-center lg:text-left order-1 ${isReversed ? "lg:order-1" : "lg:order-2"}`}
              >
                <h3 className="font-lato text-xl md:text-[28px] font-bold text-text mb-3 leading-[1.15] tracking-[-0.01em] max-w-[20ch] mx-auto lg:mx-0">
                  {benefit.title}
                </h3>
                <p className="font-open-sans text-base md:text-lg text-text-muted leading-relaxed m-0 max-w-[46ch] mx-auto lg:mx-0">
                  {benefit.description}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);
