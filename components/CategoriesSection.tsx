import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import RevealWrapper from "./RevealWrapper";

// Put these images in: /public/images/categories/
// - face-care.jpg
// - body-care.jpg
// - hair-care.jpg

const CATEGORIES = [
  {
    id: "face",
    label: "Face Care",
    title: "Face Care",
    count: 12,
    href: "/shop?category=face-care",
    src: "/face-care.jpg",
  },
  {
    id: "body",
    label: "Body Care",
    title: "Body Care",
    count: 24,
    href: "/shop?category=body-care",
    src: "/body-care.jpg",
    featured: true,
  },
  {
    id: "hair",
    label: "Hair Care",
    title: "Hair Care",
    count: 8,
    href: "/shop?category=hair-care",
    src: "/hair-care.jpg",
  },
];

export default function CategoriesSection() {
  return (
    <section className="w-full bg-brand-cream py-[clamp(60px,8vw,120px)]">
      <div className="mx-auto max-w-[1280px] px-6">
        {/* Section Heading */}
        <RevealWrapper className="text-center">
          <p className="font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper">
            Explore
          </p>
          <h2 className="mt-3 font-display text-heading font-semibold text-brand-espresso">
            Shop by Concern
          </h2>
          <p className="mx-auto mt-3 max-w-md font-body text-base text-brand-body">
            Find exactly what your skin needs
          </p>
        </RevealWrapper>

        {/* Categories Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:gap-8">
          {CATEGORIES.map((cat, i) => (
            <RevealWrapper key={cat.id} delay={i * 100}>
              <Link
                href={cat.href}
                className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-brand-sand bg-brand-linen transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:border-brand-gold-500 hover:shadow-hover"
              >
                {/* Image */}
                <div
                  className={`relative w-full overflow-hidden ${
                    cat.featured ? "h-[300px]" : "h-[260px]"
                  }`}
                >
                  <Image
                    src={cat.src}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.04]"
                  />

                  {cat.featured ? (
                    <span className="absolute right-0 top-0 rounded-[0_20px_0_12px] bg-brand-gold-500 px-2.5 py-1 font-sub text-[10px] font-bold uppercase tracking-[0.1em] text-brand-espresso">
                      Bestseller
                    </span>
                  ) : null}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-1 p-6">
                  <p className="font-sub text-xs font-semibold uppercase tracking-[0.15em] text-brand-copper">
                    {cat.label}
                  </p>
                  <h3 className="font-display text-[28px] font-semibold leading-tight text-brand-espresso">
                    {cat.title}
                  </h3>
                  <p className="font-body text-sm text-brand-mocha">
                    {String(cat.count).padStart(2, "0")} Products
                  </p>

                  <div className="mt-4 flex items-center gap-1.5 font-sub text-[13px] font-medium text-brand-copper">
                    Explore
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
