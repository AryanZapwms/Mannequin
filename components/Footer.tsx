import Link from "next/link";
import { Facebook, Youtube, X, MapPin, Phone, Mail, Clock, Banknote, CreditCard } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <Image 
                src="/logo.jpg" 
                alt="Mannequin Care" 
                width={140} 
                height={40} 
                className="h-10 w-auto transition-all duration-300" 
                priority 
              />
            </Link>
           
            <p className="text-sm leading-relaxed text-gray-600">
              True radiance begins with self-care when you nurture your skin with love and
              attention. It becomes a reflection of the beauty within.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-black-700"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-black-700"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-black-700"
                aria-label="Twitter/X"
              >
                <X className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* About Us Section */}
          <div>
            <h3 className="mb-4 md:mb-6 text-base md:text-lg font-semibold text-gray-900">About Us</h3>
            <div className="space-y-3 md:space-y-4 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-black" />
                <span className="text-xs md:text-sm">
                  509, Peninsula Plaza premises, Veera Desai Industrial Estate, Opposite YRF, Andheri West,
                  Mumbai – 400053 Maharashtra, India.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-black" />
                <span className="text-xs md:text-sm">+(123) - 456 - 7890</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-black" />
                <a
                  href="mailto:info@mannequincare.in"
                  className="text-xs md:text-sm transition-colors hover:text-black"
                >
                  info@mannequincare.in
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-black" />
                <span className="text-xs md:text-sm">All Day, 9:00AM - 22:00PM</span>
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div>
            <h3 className="mb-4 md:mb-6 text-base md:text-lg font-semibold text-gray-900">Categories</h3>
            <ul className="space-y-2 md:space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/shop?category=skincare" className="text-xs md:text-sm transition-colors hover:text-teal-600">
                  Face Care
                </Link>
              </li>
              <li>
                <Link href="/shop?category=complexion" className="text-xs md:text-sm transition-colors hover:text-teal-600">
                  Body Care
                </Link>
              </li>
              <li>
                <Link href="/shop?category=eye" className="text-xs md:text-sm transition-colors hover:text-teal-600">
                  Hair Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Shop & Policies Section */}
          <div>
            <h3 className="mb-4 md:mb-6 text-base md:text-lg font-semibold text-gray-900">Shop</h3>
            <ul className="space-y-2 md:space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/about" className="text-xs md:text-sm transition-colors hover:text-teal-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="text-xs md:text-sm transition-colors hover:text-teal-600">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-xs md:text-sm transition-colors hover:text-teal-600">
                  Shop
                </Link>
              </li>
            </ul>

            <h3 className="mb-3 md:mb-4 mt-6 md:mt-8 text-base md:text-lg font-semibold text-gray-900">Our Policies</h3>
            <ul className="space-y-2 md:space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/returns" className="text-xs md:text-sm transition-colors hover:text-teal-600">
                  Returns Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-xs md:text-sm transition-colors hover:text-teal-600">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-xs md:text-sm transition-colors hover:text-teal-600">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <p className="text-xs md:text-sm text-gray-600">
              Copyright © 2025 Mannequincare.in. All Rights Reserved.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-auto min-w-[48px] items-center justify-center gap-1.5 rounded border border-gray-300 bg-white px-2">
                <Banknote className="h-4 w-4 text-green-600" />
                <span className="text-xs font-semibold text-gray-700">COD</span>
              </div>
              <div className="flex h-8 w-auto min-w-[80px] items-center justify-center gap-1.5 rounded border border-gray-300 bg-white px-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold text-gray-700">Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}