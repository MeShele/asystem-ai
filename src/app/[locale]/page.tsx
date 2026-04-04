import { Hero } from "@/components/landing/hero";
import { ServicesGrid } from "@/components/landing/services-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import { StatsCounter } from "@/components/landing/stats-counter";
import { CasesGrid } from "@/components/landing/cases-grid";
import { TechMarquee } from "@/components/shared/marquee";
import { TeamSection } from "@/components/landing/team-section";
import { CTASection } from "@/components/landing/cta-section";
import { SocialProof } from "@/components/landing/social-proof";

export default function HomePage() {
  return (
    <>
      {/* Hero with dark bg, code rain, parallax */}
      <Hero />

      {/* Stats overlaps the hero bottom with parallax overlay effect */}
      <StatsCounter />

      {/* Main content sections */}
      <ServicesGrid />
      <HowItWorks />
      <CasesGrid />
      <SocialProof />
      <TechMarquee />
      <TeamSection />
      <CTASection />
    </>
  );
}
