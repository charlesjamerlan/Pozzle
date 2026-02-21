import { Hero } from "@/components/marketing/hero";
import { ValueProps } from "@/components/marketing/value-props";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { SocialProof } from "@/components/marketing/social-proof";
import { CtaSection } from "@/components/marketing/cta-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ValueProps />
      <HowItWorks />
      <SocialProof />
      <CtaSection />
    </>
  );
}
