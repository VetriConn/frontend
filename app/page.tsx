import type { Metadata } from "next";
import Advert from "@/components/ui/Advert";
import { HeroSection } from "@/components/pages/home/HeroSection";
import Footer from "@/components/ui/Footer";
import { AboutSection } from "@/components/pages/home/AboutSection";
import { BenefitsSection } from "@/components/pages/home/BenefitsSection";
import { ContactSection } from "@/components/pages/home/ContactSection";
import { HowItWorksStepsSection } from "@/components/pages/home/HowItWorksStepsSection";
import { FaqSection } from "@/components/pages/home/FaqSection";
import { Header } from "@/components/ui/Header";
import {
  generateMetadata as generateSeoMetadata,
  METADATA_TEMPLATES,
} from "@/lib/seo";

export const metadata: Metadata = generateSeoMetadata({
  title: METADATA_TEMPLATES.homepage.title,
  description: METADATA_TEMPLATES.homepage.description,
  path: "/",
  keywords: ["jobs for retirees", "veterans", "Canada", "senior employment"],
});

export default function Home() {
  return (
    <main id="main-content" className="max-w-[1800px] min-w-80 mx-auto">
      <div className="sticky bg-white top-0 left-0 z-50">
        <Header />
      </div>
      <div>
        {/* Identify, persuade, instruct — then ask for a favour.
            "Who it's for" used to sit after the benefits, so the page argued
            its case before the reader knew whether it was talking to them,
            and the research invite split that argument down the middle. */}
        <HeroSection />
        <AboutSection id="about-section" />
        <BenefitsSection />
        <HowItWorksStepsSection />
        <Advert />
        <FaqSection id="faq-section" />
        <ContactSection id="contact-section" />
        <Footer />
      </div>
    </main>
  );
}
