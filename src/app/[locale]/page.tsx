import { Hero } from "@/components/ui/Hero";
import { AppShowcase } from "@/components/ui/AppShowcase";
import { Platforms } from "@/components/ui/Platforms";
import { CallToAction } from "@/components/ui/CallToAction";
import { HomepageAsciiArt } from "@/components/ui/HomepageAsciiArt";
import { FeatureShowcase } from "@/components/features/FeatureShowcase";

export default function Home() {
  return (
    <div className="flex w-full flex-col overflow-x-clip">
      <Hero />
      <div className="relative isolate flex w-full flex-col">
        <HomepageAsciiArt />
        <FeatureShowcase />
        <AppShowcase />
        <Platforms />
        <CallToAction />
      </div>
    </div>
  );
}
