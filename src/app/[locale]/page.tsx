import { Hero } from "@/components/ui/Hero";
import { InfiniteRibbon } from "@/components/ui/InfiniteRibbon";
import { AppShowcase } from "@/components/ui/AppShowcase";
import { Platforms } from "@/components/ui/Platforms";
import { CallToAction } from "@/components/ui/CallToAction";
import { HomepagePixelClusters } from "@/components/ui/HomepagePixelClusters";

export default function Home() {
  return (
    <div className="flex w-full flex-col overflow-x-clip">
      <Hero />
      <div className="flex w-full flex-col">
        <InfiniteRibbon />
        <div className="relative isolate flex w-full flex-col">
          <HomepagePixelClusters />
          <AppShowcase />
          <Platforms />
          <CallToAction />
        </div>
      </div>
    </div>
  );
}
