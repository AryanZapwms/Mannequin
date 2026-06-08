// // import Link from "next/link";
// // import Image from "next/image";
// // import { ArrowRight } from "lucide-react";

// // // NOTE: place the images used below inside your Next.js project's /public/images folder
// // // - hero-banner.png  (use the screenshot you shared or a high-res hero image)
// // // - face-care.jpg
// // // - body-care.jpg
// // // - hair-care.jpg
// // // - product1.jpg (optional, for product preview cards)

// // export default function HeroSection() {
// //   return (
// //     <section className="relative w-full overflow-hidden bg-amber-50">
// //       <div className="mx-auto max-w-7xl px-6 py-12 lg:py-20">
// //         {/* Top hero area */}
// //         <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
// //           {/* Left: copy that matches your brand image */}
// //           <div className="flex flex-col justify-center space-y-6">
// //             <p className="text-sm font-semibold uppercase tracking-widest text-stone-600">
// //               Transform Your Beauty Routine
// //             </p>

// //             <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
// //               Mannequin's Vitamin E Range
// //             </h1>

// //             <p className="max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
// //               Fade stretch marks, grow stronger hair and reveal radiant skin with our
// //               proven Vitamin E oils and creams — formulated for gentle, visible results.
// //             </p>

// //             <div className="flex flex-wrap gap-3">
// //               <Link
// //                 href="/shop"
// //                 className="inline-flex items-center gap-3 rounded-lg bg-teal-600 px-6 py-3 text-base font-semibold text-white shadow transition-transform duration-200 hover:-translate-y-0.5"
// //               >
// //                 Shop Now
// //                 <ArrowRight className="h-4 w-4" />
// //               </Link>

// //               <Link
// //                 href="/shop?filter=vitamin-e"
// //                 className="inline-flex items-center gap-2 rounded-lg border border-stone-200 px-5 py-3 text-sm font-medium text-stone-700 bg-white shadow-sm hover:shadow-md"
// //               >
// //                 Buy Vitamin E
// //               </Link>
// //             </div>

// //             {/* small feature bullets to match screenshot */}
// //             <ul className="mt-4 space-y-2 text-sm text-stone-700">
// //               <li className="flex items-start gap-3">
// //                 <span className="mt-1 inline-block h-3 w-3 rounded-full bg-emerald-500" />
// //                 Fade stretch marks in weeks
// //               </li>

// //               <li className="flex items-start gap-3">
// //                 <span className="mt-1 inline-block h-3 w-3 rounded-full bg-emerald-500" />
// //                 Grow stronger, shinier hair
// //               </li>

// //               <li className="flex items-start gap-3">
// //                 <span className="mt-1 inline-block h-3 w-3 rounded-full bg-emerald-500" />
// //                 Reveal radiant skin with proven oils & creams
// //               </li>
// //             </ul>
// //           </div>

// //           {/* Right: hero image (use the screenshot you uploaded as hero-banner.png) */}
// //           <div className="relative flex items-center justify-center">
// //             <div className="relative w-full max-w-lg">
// //               <div className="aspect-[16/12] w-full overflow-hidden rounded-2xl border border-stone-200 shadow-2xl">
// //                 <Image
// //                   src="/hero-banner.png"
// //                   alt="Mannequin's Vitamin E range"
// //                   fill
// //                   sizes="(max-width: 1024px) 100vw, 50vw"
// //                   style={{ objectFit: 'cover' }}
// //                   priority
// //                 />
// //               </div>

// //               {/* A small circular "Buy Now" CTA floating on image to match screenshot vibe */}
// //               <Link
// //                 href="/shop"
// //                 className="absolute bottom-6 left-6 inline-flex items-center gap-3 rounded-full bg-black/90 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:scale-105 transition-transform"
// //               >
// //                 Buy Now
// //               </Link>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </section>
// //   );
// // }


// import Link from "next/link";
// import Image from "next/image";
// import { ArrowRight } from "lucide-react";

// export default function HeroSection() {
//   return (
//     <section className="relative w-full overflow-hidden bg-amber-50 pt-5">
//       <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:py-20">
//         {/* Grid Layout */}
//         <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
//           {/* Left Content */}
//           <div className="flex flex-col justify-center space-y-5 text-center lg:text-left">
//             <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-stone-600">
//               Transform Your Beauty Routine
//             </p>

//             <h1 className="text-3xl sm:text-4xl lg:text-4xl font-extrabold leading-tight tracking-tight text-gray-900">
//               Mannequin's Vitamin E Range
//             </h1>

//             <p className="max-w-xl mx-auto lg:mx-0 text-sm sm:text-base md:text-lg leading-relaxed text-stone-600">
//               Fade stretch marks, grow stronger hair, and reveal radiant skin with our
//               proven Vitamin E oils and creams — formulated for gentle, visible results.
//             </p>

//             {/* Buttons */}
//             <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
//               <Link
//                 href="/shop"
//                 className="inline-flex items-center gap-2 rounded-lg bg-black px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow transition-transform duration-200 hover:-translate-y-0.5"
//               >
//                 Shop Now
//                 <ArrowRight className="h-4 w-4" />
//               </Link>

//               <Link
//                 href="/shop?filter=vitamin-e"
//                 className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 shadow-sm hover:shadow-md"
//               >
//                 Buy Vitamin E
//               </Link>
//             </div>

//             {/* Feature bullets */}
//             <ul className="mt-4 space-y-2 text-sm text-stone-700 mx-auto lg:mx-0">
//               <li className="flex items-start gap-2 sm:gap-3 justify-center lg:justify-start">
//                 <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
//                 Fade stretch marks in weeks
//               </li>

//               <li className="flex items-start gap-2 sm:gap-3 justify-center lg:justify-start">
//                 <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
//                 Grow stronger, shinier hair
//               </li>

//               <li className="flex items-start gap-2 sm:gap-3 justify-center lg:justify-start">
//                 <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
//                 Reveal radiant skin with proven oils & creams
//               </li>
//             </ul>
//           </div>

//           {/* Right Image Section */}
//           <div className="relative flex items-center justify-center">
//             <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-md xl:max-w-lg">
//               <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200 shadow-xl">
//                 <Image
//                   src="/hero-banner.png"
//                   alt="Mannequin's Vitamin E range"
//                   fill
//                   sizes="(max-width: 1024px) 100vw, 50vw"
//                   style={{ objectFit: "cover" }}
//                   priority
//                 />
//               </div>

              
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }


"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Array of image sources for the carousel
  const carouselImages = [
    "/hero-banner.png",
    "/1.jpg",
    "/2.jpg",
    "/3.jpg",
    "/4.jpg"
  ];

  // Auto-advance carousel every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative w-full overflow-hidden bg-amber-50 pt-5">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:py-20">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          {/* Left Content */}
          <div className="flex flex-col justify-center space-y-5 text-center lg:text-left">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-stone-600">
              Transform Your Beauty Routine
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-4xl font-extrabold leading-tight tracking-tight text-gray-900">
              Mannequin's Vitamin E Range
            </h1>

            <p className="max-w-xl mx-auto lg:mx-0 text-sm sm:text-base md:text-lg leading-relaxed text-stone-600">
              Fade stretch marks, grow stronger hair, and reveal radiant skin with our
              proven Vitamin E oils and creams — formulated for gentle, visible results.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-lg bg-black px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow transition-transform duration-200 hover:-translate-y-0.5"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 shadow-sm hover:shadow-md"
              >
                Buy Vitamin E
              </Link>
            </div>

            {/* Feature bullets */}
            <ul className="mt-4 space-y-2 text-sm text-stone-700 mx-auto lg:mx-0">
              <li className="flex items-start gap-2 sm:gap-3 justify-center lg:justify-start">
                <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Fade stretch marks in weeks
              </li>

              <li className="flex items-start gap-2 sm:gap-3 justify-center lg:justify-start">
                <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Grow stronger, shinier hair
              </li>

              <li className="flex items-start gap-2 sm:gap-3 justify-center lg:justify-start">
                <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Reveal radiant skin with proven oils & creams
              </li>
            </ul>
          </div>

          {/* Right Carousel Section */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-md xl:max-w-lg group">
              {/* Carousel Container */}
              <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200 shadow-xl relative">
                {/* Images */}
                {carouselImages.map((src, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`Mannequin Care — Vitamin E range slide ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 50vw"
                      className="object-cover"
                      priority={index === 0}
                      unoptimized
                    />
                  </div>
                ))}

                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-800" />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-5 w-5 text-gray-800" />
                </button>
              </div>

              {/* Dot Indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'w-8 bg-black' 
                        : 'w-2 bg-stone-300 hover:bg-stone-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}