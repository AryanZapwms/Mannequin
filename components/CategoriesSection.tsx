import Link from "next/link";
import Image from "next/image";

// Put these images in: /public/images/categories/
// - face-care.jpg
// - body-care.jpg
// - hair-care.jpg

const CATEGORIES = [
  {
    id: "face",
    title: "Face Care",
    count: 12,
    href: "/category/eye-shadow",
    src: "/face-care.jpg",
  },
  {
    id: "body",
    title: "Body Care",
    count: 24,
    href: "/category/face-cream",
    src: "/body-care.jpg",
  },
  {
    id: "hair",
    title: "Hair Care",
    count: 8,
    href: "/category/skin-care",
    src: "/hair-care.jpg",
  },
];

export default function CategoriesSection() {
  return (
    <section className="w-full bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Headings */}
        <p className="text-center text-sm font-medium text-stone-500 tracking-wide uppercase">
          Shop by Categories
        </p>
        <h2 className="mt-2 text-center text-2xl sm:text-3xl font-bold text-stone-900">
          Popular Categories
        </h2>

        {/* Categories Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group relative flex flex-col items-center text-center"
            >
              {/* Elliptical Image Container */}
              <div
                className="relative w-[80%] sm:w-[75%] md:w-[85%] max-w-[320px] overflow-hidden transition-transform duration-500 ease-out rounded-[50%/60%] hover:scale-105"
              >
                <div className="relative h-[260px] sm:h-[300px] md:h-[340px] lg:h-[380px] transition-transform duration-500">
                  <Image
                    src={cat.src}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
                    className="object-cover transition-all duration-500 group-hover:brightness-95"
                  />
                </div>
              </div>

              {/* Title & Count */}
              <div className="mt-5">
                <h3 className="text-base sm:text-lg font-semibold text-stone-800 group-hover:text-teal-700 transition-colors duration-300">
                  {cat.title}
                </h3>
                <p className="mt-1 text-xs text-stone-400">
                  {String(cat.count).padStart(2, "0")} Items
                </p>
              </div>

              {/* Hover underline effect */}
              <span className="absolute bottom-0 h-0.5 w-0 bg-teal-600 rounded-full transition-all duration-300 group-hover:w-2/3" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
