// "use client";

// import { useState, useTransition } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { Heart, ShoppingCart } from "lucide-react";
// import { toast } from "sonner";
// import { createClient } from "@/lib/supabase/client";
// import { addToCart } from "@/lib/services/cart";
// import { addToWishlist, removeFromWishlist, isInWishlist } from "@/lib/services/wishlist";
// import { addToGuestCart } from "@/lib/services/guest-cart";
// import { useEffect } from "react";

// interface Product {
//   id: string;
//   name: string;
//   slug: string;
//   price: number;
//   compare_at_price?: number;
//   thumbnail_url?: string;
//   stock: number;
// }

// interface ShopProductCardProps {
//   product: Product;
// }

// export function ShopProductCard({ product }: ShopProductCardProps) {
//   const supabase = createClient();
//   const router = useRouter();
//   const [isPending, startTransition] = useTransition();
//   const [inWishlist, setInWishlist] = useState(false);
//   const [userId, setUserId] = useState<string | null>(null);

//   useEffect(() => {
//     const checkWishlist = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (user) {
//         setUserId(user.id);
//         const inList = await isInWishlist(supabase, user.id, product.id);
//         setInWishlist(inList);
//       }
//     };

//     void checkWishlist();
//   }, [supabase, product.id]);

//   const handleAddToCart = () => {
//     startTransition(async () => {
//       const { data: { user } } = await supabase.auth.getUser();
      
//       if (!user) {
//         addToGuestCart(product.id, 1, {
//           id: product.id,
//           name: product.name,
//           price: product.price,
//           thumbnail_url: product.thumbnail_url,
//           stock: product.stock,
//         });
//         window.dispatchEvent(new Event("storage"));
//         toast.success("Added to cart!");
//         return;
//       }

//       try {
//         await addToCart(supabase, user.id, product.id, 1);
//         toast.success("Added to cart!");
//       } catch (error) {
//         console.error("Error adding to cart:", error);
//         toast.error("Failed to add to cart");
//       }
//     });
//   };

//   const handleWishlist = () => {
//     startTransition(async () => {
//       const { data: { user } } = await supabase.auth.getUser();
      
//       if (!user) {
//         toast.error("Sign in to add items to wishlist");
//         return;
//       }

//       try {
//         if (inWishlist) {
//           const { data: wishlistItem } = await supabase
//             .from("wishlist_items")
//             .select("id")
//             .eq("user_id", user.id)
//             .eq("product_id", product.id)
//             .single();

//           if (wishlistItem) {
//             await removeFromWishlist(supabase, wishlistItem.id);
//             setInWishlist(false);
//             toast.success("Removed from wishlist");
//           }
//         } else {
//           await addToWishlist(supabase, user.id, product.id);
//           setInWishlist(true);
//           toast.success("Added to wishlist");
//         }
//       } catch (error) {
//         console.error("Error updating wishlist:", error);
//         toast.error("Failed to update wishlist");
//       }
//     });
//   };

//   return (
//     <div className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md">
//       <button
//         onClick={handleWishlist}
//         disabled={isPending}
//         className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow-sm transition-colors hover:bg-gray-100 disabled:opacity-50"
//       >
//         <Heart
//           className={`h-4 w-4 ${inWishlist ? "fill-red-500 text-red-500" : ""}`}
//         />
//       </button>

//       <Link href={`/products/${product.slug}`} className="block">
//         <div className="relative aspect-square overflow-hidden bg-gray-100">
//           {product.thumbnail_url ? (
//             <Image
//               src={product.thumbnail_url}
//               alt={product.name}
//               fill
//               className="object-cover transition-transform group-hover:scale-105"
//             />
//           ) : (
//             <div className="flex h-full items-center justify-center text-gray-400">
//               No Image
//             </div>
//           )}
//         </div>
//       </Link>

//       <div className="p-4">
//         <Link href={`/products/${product.slug}`}>
//           <h3 className="mb-2 line-clamp-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-gray-600">
//             {product.name}
//           </h3>
//         </Link>

//         <div className="mb-3 flex items-center gap-2">
//           <span className="text-lg font-semibold text-gray-900">
//             ₹{product.price.toFixed(2)}
//           </span>
//           {product.compare_at_price && product.compare_at_price > product.price && (
//             <span className="text-sm text-gray-500 line-through">
//               ₹{product.compare_at_price.toFixed(2)}
//             </span>
//           )}
//         </div>

//         <button
//           onClick={handleAddToCart}
//           disabled={isPending || product.stock <= 0}
//           className="flex w-full items-center justify-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
//         >
//           <ShoppingCart className="h-4 w-4" />
//           {product.stock <= 0 ? "Out of Stock" : "Add to cart"}
//         </button>
//       </div>
//     </div>
//   );
// }


// "use client";

// import { useState, useTransition, useEffect } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { Heart, ShoppingCart, Star } from "lucide-react";
// import { toast } from "sonner";
// import { createClient } from "@/lib/supabase/client";
// import { addToCart } from "@/lib/services/cart";
// import { addToWishlist, removeFromWishlist, isInWishlist } from "@/lib/services/wishlist";
// import { addToGuestCart } from "@/lib/services/guest-cart";

// interface Product {
//   id: string;
//   name: string;
//   slug: string;
//   price: number;
//   compare_at_price?: number;
//   thumbnail_url?: string;
//   stock: number;
// }

// interface ShopProductCardProps {
//   product: Product;
// }

// export function ShopProductCard({ product }: ShopProductCardProps) {
//   const supabase = createClient();
//   const [isPending, startTransition] = useTransition();
//   const [inWishlist, setInWishlist] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);

//   useEffect(() => {
//     const checkWishlist = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (user) {
//         const inList = await isInWishlist(supabase, user.id, product.id);
//         setInWishlist(inList);
//       }
//     };

//     void checkWishlist();
//   }, [supabase, product.id]);

//   const handleAddToCart = (e: React.MouseEvent) => {
//     e.preventDefault();
//     startTransition(async () => {
//       const { data: { user } } = await supabase.auth.getUser();
      
//       if (!user) {
//         addToGuestCart(product.id, 1, {
//           id: product.id,
//           name: product.name,
//           price: product.price,
//           thumbnail_url: product.thumbnail_url,
//           stock: product.stock,
//         });
//         window.dispatchEvent(new Event("storage"));
//         toast.success("Added to cart!");
//         return;
//       }

//       try {
//         await addToCart(supabase, user.id, product.id, 1);
//         toast.success("Added to cart!");
//       } catch (error) {
//         console.error("Error adding to cart:", error);
//         toast.error("Failed to add to cart");
//       }
//     });
//   };

//   const handleWishlist = (e: React.MouseEvent) => {
//     e.preventDefault();
//     startTransition(async () => {
//       const { data: { user } } = await supabase.auth.getUser();
      
//       if (!user) {
//         toast.error("Sign in to add items to wishlist");
//         return;
//       }

//       try {
//         if (inWishlist) {
//           const { data: wishlistItem } = await supabase
//             .from("wishlist_items")
//             .select("id")
//             .eq("user_id", user.id)
//             .eq("product_id", product.id)
//             .single();

//           if (wishlistItem) {
//             await removeFromWishlist(supabase, wishlistItem.id);
//             setInWishlist(false);
//             toast.success("Removed from wishlist");
//           }
//         } else {
//           await addToWishlist(supabase, user.id, product.id);
//           setInWishlist(true);
//           toast.success("Added to wishlist");
//         }
//       } catch (error) {
//         console.error("Error updating wishlist:", error);
//         toast.error("Failed to update wishlist");
//       }
//     });
//   };

//   const discount = product.compare_at_price && product.compare_at_price > product.price
//     ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
//     : 0;

//   return (
//     <Link 
//       href={`/products/${product.slug}`}
//       className="group block"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <div className="relative overflow-hidden bg-white transition-all duration-500 hover:shadow-2xl">
//         {/* Badges Container */}
//         <div className="absolute left-0 right-0 top-0 z-10 flex items-start justify-between p-4">
//           {/* NEW Badge */}
//           <span className="rounded-full bg-black px-3 py-1 text-[10px] font-medium tracking-wider text-white">
//             NEW
//           </span>

//           {/* Discount Badge */}
//           {discount > 0 && (
//             <span className="rounded-full bg-black px-3 py-1 text-[10px] font-medium tracking-wider text-white">
//               -{discount}%
//             </span>
//           )}
//         </div>

//         {/* Wishlist Button */}
//         <button
//           onClick={handleWishlist}
//           disabled={isPending}
//           className={`absolute right-4 top-16 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white disabled:opacity-50 ${
//             isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
//           }`}
//         >
//           <Heart
//             className={`h-4 w-4 transition-all duration-300 ${
//               inWishlist ? "fill-black stroke-black" : "stroke-gray-700"
//             }`}
//           />
//         </button>

//         {/* Product Image */}
//         <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
//           {product.thumbnail_url ? (
//             <Image
//               src={product.thumbnail_url}
//               alt={product.name}
//               fill
//               className="object-cover transition-transform duration-700 group-hover:scale-105"
//             />
//           ) : (
//             <div className="flex h-full items-center justify-center">
//               <div className="text-center text-gray-300">
//                 <ShoppingCart className="mx-auto h-12 w-12 mb-2 stroke-1" />
//                 <p className="text-xs font-light tracking-wide">NO IMAGE</p>
//               </div>
//             </div>
//           )}
          
//           {/* Hover Overlay */}
//           <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${
//             isHovered ? 'opacity-5' : 'opacity-0'
//           }`} />
//         </div>

//         {/* Product Info */}
//         <div className="p-5 space-y-3">
//           {/* Product Name */}
//           <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-normal tracking-wide text-gray-900 transition-colors">
//             {product.name}
//           </h3>

//           {/* Rating */}
//           <div className="flex items-center gap-1">
//             {[...Array(5)].map((_, i) => (
//               <Star
//                 key={i}
//                 className={`h-3 w-3 ${
//                   i < 4 ? "fill-gray-900 text-gray-900" : "fill-gray-200 text-gray-200"
//                 }`}
//               />
//             ))}
//             <span className="ml-1.5 text-[11px] text-gray-400 font-light">(0)</span>
//           </div>

//           {/* Price */}
//           <div className="flex items-baseline gap-2.5 pt-1">
//             <span className="text-lg font-medium text-gray-900 tracking-tight">
//               ₹{product.price.toFixed(2)}
//             </span>
//             {product.compare_at_price && product.compare_at_price > product.price && (
//               <span className="text-xs font-light text-gray-400 line-through">
//                 ₹{product.compare_at_price.toFixed(2)}
//               </span>
//             )}
//           </div>

//           {/* Add to Cart Button */}
//           <button
//             onClick={handleAddToCart}
//             disabled={isPending || product.stock <= 0}
//             className={`w-full border border-gray-900 px-4 py-3 text-[11px] font-medium tracking-widest transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
//               product.stock <= 0 
//                 ? "bg-white text-gray-400 border-gray-300" 
//                 : "bg-white text-gray-900 hover:bg-gray-900 hover:text-white"
//             }`}
//           >
//             {product.stock <= 0 ? "OUT OF STOCK" : "ADD TO CART"}
//           </button>
//         </div>
//       </div>
//     </Link>
//   );
// }

"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { addToCart } from "@/lib/services/cart";
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/lib/services/wishlist";
import { addToGuestCart } from "@/lib/services/guest-cart";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number;
  thumbnail_url?: string;
  stock: number;
}

interface ShopProductCardProps {
  product: Product;
}

export function ShopProductCard({ product }: ShopProductCardProps) {
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [inWishlist, setInWishlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkWishlist = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const inList = await isInWishlist(supabase, user.id, product.id);
        setInWishlist(inList);
      }
    };

    void checkWishlist();
  }, [supabase, product.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        addToGuestCart(product.id, 1, {
          id: product.id,
          name: product.name,
          price: product.price,
          thumbnail_url: product.thumbnail_url,
          stock: product.stock,
        });
        window.dispatchEvent(new Event("storage"));
        toast.success("Added to cart!");
        return;
      }

      try {
        await addToCart(supabase, user.id, product.id, 1);
        toast.success("Added to cart!");
      } catch (error) {
        console.error("Error adding to cart:", error);
        toast.error("Failed to add to cart");
      }
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Sign in to add items to wishlist");
        return;
      }

      try {
        if (inWishlist) {
          const { data: wishlistItem } = await supabase
            .from("wishlist_items")
            .select("id")
            .eq("user_id", user.id)
            .eq("product_id", product.id)
            .single();

          if (wishlistItem) {
            await removeFromWishlist(supabase, wishlistItem.id);
            setInWishlist(false);
            toast.success("Removed from wishlist");
          }
        } else {
          await addToWishlist(supabase, user.id, product.id);
          setInWishlist(true);
          toast.success("Added to wishlist");
        }
      } catch (error) {
        console.error("Error updating wishlist:", error);
        toast.error("Failed to update wishlist");
      }
    });
  };

  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  return (
    <Link 
      href={`/products/${product.slug}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden bg-white transition-all duration-500 hover:shadow-2xl">
        {/* Badges Container */}
        <div className="absolute left-0 right-0 top-0 z-10 flex items-start justify-between p-4">
          {/* NEW Badge */}
          <span className="rounded-full bg-black px-3 py-1 text-[10px] font-medium tracking-wider text-white">
            NEW
          </span>

          {/* Discount Badge */}
          {discount > 0 && (
            <span className="rounded-full bg-black px-3 py-1 text-[10px] font-medium tracking-wider text-white">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          disabled={isPending}
          className={`absolute right-4 top-16 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white disabled:opacity-50 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}
        >
          <Heart
            className={`h-4 w-4 transition-all duration-300 ${
              inWishlist ? "fill-black stroke-black" : "stroke-gray-700"
            }`}
          />
        </button>

        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {product.thumbnail_url ? (
            <Image
              src={product.thumbnail_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-gray-300">
                <ShoppingCart className="mx-auto h-12 w-12 mb-2 stroke-1" />
                <p className="text-xs font-light tracking-wide">NO IMAGE</p>
              </div>
            </div>
          )}
          
          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${
            isHovered ? 'opacity-5' : 'opacity-0'
          }`} />
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2.5">
          {/* Product Name */}
          <h3 className="line-clamp-2 min-h-[2.5rem] text-xs font-normal tracking-wide text-gray-900 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-2.5 w-2.5 ${
                  i < 4 ? "fill-gray-900 text-gray-900" : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
            <span className="ml-1 text-[10px] text-gray-400 font-light">(0)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-base font-medium text-gray-900 tracking-tight">
              ₹{product.price.toFixed(2)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-[11px] font-light text-gray-400 line-through">
                ₹{product.compare_at_price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isPending || product.stock <= 0}
            className={`w-full border border-gray-900 px-3 py-2.5 text-[10px] font-medium tracking-widest transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
              product.stock <= 0 
                ? "bg-white text-gray-400 border-gray-300" 
                : "bg-white text-gray-900 hover:bg-gray-900 hover:text-white"
            }`}
          >
            {product.stock <= 0 ? "OUT OF STOCK" : "ADD TO CART"}
          </button>
        </div>
      </div>
    </Link>
  );
}