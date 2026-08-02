import { Hero } from "@/components/ui/Hero";
import { InfiniteRibbon } from "@/components/ui/InfiniteRibbon";
import { Features } from "@/components/ui/Features";
import { AppShowcase } from "@/components/ui/AppShowcase";
import { Platforms } from "@/components/ui/Platforms";
import { HowItWorks } from "@/components/ui/HowItWorks";
import { CallToAction } from "@/components/ui/CallToAction";
import { HomepagePixelClusters } from "@/components/ui/HomepagePixelClusters";

export default function Home() {
  return (
    <div className="flex w-full flex-col overflow-x-clip">
      <Hero />
      <div className="relative isolate flex w-full flex-col">
        <HomepagePixelClusters />
        <InfiniteRibbon />
        <Features />
        <AppShowcase />
        <Platforms />
        <HowItWorks />
        <CallToAction />
      </div>
    </div>
  );
}
