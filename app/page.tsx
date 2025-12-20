import Hero from "@/app/storefront/components/Hero";
import Reveal from "@/app/storefront/components/Reveal";
import HomeHighlights from "@/app/storefront/components/HomeHighlights";
import FeaturedCategories from "@/app/storefront/components/FeaturedCategories";
import LatestCollection from "@/app/storefront/components/LatestCollection";
import BestSeller from "@/app/storefront/components/BestSeller";
import LookbookGrid from "@/app/storefront/components/LookbookGrid";
import TestimonialsMarquee from "@/app/storefront/components/TestimonialsMarquee";
import HomeCtaBanner from "@/app/storefront/components/HomeCtaBanner";

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Reveal>
        <HomeHighlights />
      </Reveal>
      <Reveal>
        <FeaturedCategories />
      </Reveal>
      <Reveal>
        <LatestCollection />
      </Reveal>
      <Reveal>
        <BestSeller />
      </Reveal>
      <Reveal>
        <LookbookGrid />
      </Reveal>
      <Reveal>
        <TestimonialsMarquee />
      </Reveal>
      <Reveal>
        <HomeCtaBanner />
      </Reveal>
    </div>
  );
}
