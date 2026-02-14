import type { Metadata } from "next";
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
    <main className="max-w-[1920px] min-w-[320px] mx-auto">
      <div className="sticky bg-white top-0 left-0 z-50">
        <Header />
      </div>
      <div>
        <HeroSection />
        <BenefitsSection />
        <AboutSection id="about-section" />
        <HowItWorksStepsSection />
        <FaqSection id="faq-section" />
        <ContactSection id="contact-section" />
        <Footer />
      </div>
    </main>
  );
}
