import dynamic from "next/dynamic";
import { Hero } from "@/components/landing/hero";
import { StatsCounter } from "@/components/landing/stats-counter";

const ServicesGrid = dynamic(() => import("@/components/landing/services-grid").then((m) => m.ServicesGrid));
const HowItWorks = dynamic(() => import("@/components/landing/how-it-works").then((m) => m.HowItWorks));
const CasesGrid = dynamic(() => import("@/components/landing/cases-grid").then((m) => m.CasesGrid));
const TechMarquee = dynamic(() => import("@/components/shared/marquee").then((m) => m.TechMarquee));
const TeamSection = dynamic(() => import("@/components/landing/team-section").then((m) => m.TeamSection));
const CTASection = dynamic(() => import("@/components/landing/cta-section").then((m) => m.CTASection));
const SocialProof = dynamic(() => import("@/components/landing/social-proof").then((m) => m.SocialProof));

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
