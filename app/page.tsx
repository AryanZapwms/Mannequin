import CategoriesSection from "@/components/CategoriesSection";
import HeroSection from "@/components/HeroSection";
import OurProducts from "@/components/OurProducts";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full -mt-20 md:-mt-24">
     <HeroSection />
     <CategoriesSection/>
     <OurProducts/>
    </div>
  );
}
