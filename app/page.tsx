import CategoriesSection from "@/components/CategoriesSection";
import HeroSection from "@/components/HeroSection";
import OurProducts from "@/components/OurProducts";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
     <HeroSection />
     <CategoriesSection/>
     <OurProducts/>
    </main>
  );
}
