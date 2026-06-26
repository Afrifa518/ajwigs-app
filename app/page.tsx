import Hero from "@/app/storefront/components/Hero";
import Confidence from "@/app/storefront/components/home/Confidence";
import Craftsmanship from "@/app/storefront/components/home/Craftsmanship";
import BestSellers from "@/app/storefront/components/home/BestSellers";
import WhyElOlux from "@/app/storefront/components/home/WhyElOlux";
import TrustProof from "@/app/storefront/components/home/TrustProof";
import FinalCta from "@/app/storefront/components/home/FinalCta";

export default function HomePage() {
  return (
    <div className="relative">
      <Hero />
      <Confidence />
      <Craftsmanship />
      <BestSellers />
      <WhyElOlux />
      <TrustProof />
      <FinalCta />
    </div>
  );
}
