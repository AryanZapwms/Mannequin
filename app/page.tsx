import BrandPromiseStrip from "@/components/BrandPromiseStrip";
import CategoriesSection from "@/components/CategoriesSection";
import HeroSection from "@/components/HeroSection";
import OurProducts from "@/components/OurProducts";
import TrustStrip from "@/components/TrustStrip";

export default function Home() {
  return (
    <div className="flex w-full flex-col items-center">
      <HeroSection />
      <TrustStrip />
      <CategoriesSection />
      <OurProducts />
      <BrandPromiseStrip />
    </div>
  );
}
