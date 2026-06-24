import { Hero } from "@/components/ui/Hero";
import { Features } from "@/components/ui/Features";
import { AppShowcase } from "@/components/ui/AppShowcase";
import { HowItWorks } from "@/components/ui/HowItWorks";
import { CallToAction } from "@/components/ui/CallToAction";

export default function Home() {
  return (
    <div className="w-full flex flex-col">
      <Hero />
      <Features />
      <AppShowcase />
      <HowItWorks />
      <CallToAction />
    </div>
  );
}