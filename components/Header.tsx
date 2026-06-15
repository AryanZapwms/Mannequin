"use client";

import { type ReactNode, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSessionUser, type SessionUser } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { getGuestCart } from "@/lib/services/guest-cart";
import {
  Heart,
  LogIn,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  User,
  X,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/about-us", label: "About Us" },
  { href: "/shop", label: "Shop" },
  { href: "/brochure", label: "Brochure" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/blog", label: "Blogs" },
];

type NavItemProps = {
  href: string;
  label: string;
  isActive?: boolean;
  onNavigate?: () => void;
};

function NavItem({ href, label, isActive, onNavigate }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group relative font-sub text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-200",
        isActive ? "text-brand-copper" : "text-brand-espresso hover:text-brand-copper",
      )}
    >
      {label}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-brand-copper transition-transform duration-[250ms] ease-out group-hover:scale-x-100",
          isActive && "scale-x-100",
        )}
      />
    </Link>
  );
}

/** Brand logo — sourced from /public/logo.jpg, blended onto the cream header background. */
function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.jpg"
      alt="Mannequin Care"
      width={1157}
      height={314}
      priority
      className={cn("h-7 w-auto object-contain mix-blend-multiply md:h-9", className)}
    />
  );
}

type IconButtonProps = {
  label: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  badgeCount?: number;
};

function IconButton({ label, icon, href, onClick, badgeCount }: IconButtonProps) {
  const content = (
    <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-espresso transition-colors duration-200 hover:bg-brand-gold-100 hover:text-brand-copper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-500">
      {icon}
      {typeof badgeCount === "number" && badgeCount > 0 ? (
        <span className="absolute right-0 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-gold-500 px-1 font-mono text-[10px] font-medium leading-none text-brand-espresso shadow-sm">
          {badgeCount}
        </span>
      ) : null}
    </span>
  );

  if (href) {
    return (
      <Link aria-label={label} href={href} className="inline-flex" onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex"
    >
      {content}
    </button>
  );
}

type UserMenuProps = {
  user: SessionUser | null;
  onSignOut: () => Promise<void>;
};

function UserMenu({ user, onSignOut }: UserMenuProps) {
  const router = useRouter();
  const name = user?.name || user?.email || "Account";
  const avatarUrl = user?.image ?? undefined;
  const initials = name
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    await onSignOut();
    router.refresh();
  };

  const triggerContent = avatarUrl ? (
    <Image
      src={avatarUrl}
      alt={name}
      width={40}
      height={40}
      className="h-10 w-10 rounded-full object-cover ring-1 ring-brand-sand"
    />
  ) : (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold-100 font-sub text-sm font-semibold uppercase text-brand-copper ring-1 ring-brand-sand transition-colors duration-200 hover:bg-brand-gold-200">
      {user ? initials : <User className="h-5 w-5" />}
    </span>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={user ? `${name} menu` : "Account menu"}
          className="inline-flex"
        >
          {triggerContent}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64" sideOffset={12}>
        {user ? (
          <>
            <DropdownMenuLabel>
              <span className="block font-sub text-sm font-medium text-brand-espresso">{name}</span>
              <span className="block text-xs text-brand-mocha">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Account settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                void handleSignOut();
              }}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/auth/login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/auth/sign-up" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Create account
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const toggleMobileMenu = useCallback(
    () => setMobileMenuOpen((prev) => !prev),
    [],
  );

  const fetchCounts = useCallback(async (currentUser: SessionUser | null) => {
    if (currentUser) {
      try {
        const [wishlistRes, cartRes] = await Promise.all([
          fetch("/api/wishlist"),
          fetch("/api/cart"),
        ]);
        const wishlist = wishlistRes.ok ? await wishlistRes.json() : { items: [] };
        const cart = cartRes.ok ? await cartRes.json() : { items: [] };

        setWishlistCount((wishlist.items ?? []).length);
        setCartCount(
          (cart.items ?? []).reduce(
            (sum: number, item: { quantity: number }) => sum + item.quantity,
            0,
          ),
        );
      } catch (error) {
        console.error("Error fetching header counts:", error);
      }
    } else {
      const guestCart = getGuestCart();
      setCartCount(guestCart.reduce((sum, item) => sum + item.quantity, 0));
      setWishlistCount(0);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadSession = async () => {
      const sessionUser = await getSessionUser();
      if (!cancelled) {
        setUser(sessionUser);
        void fetchCounts(sessionUser);
      }
    };
    void loadSession();
    return () => {
      cancelled = true;
    };
  }, [pathname, fetchCounts]);

  useEffect(() => {
    if (user) {
      return;
    }

    const handleStorageChange = () => {
      const guestCart = getGuestCart();
      setCartCount(guestCart.reduce((sum, item) => sum + item.quantity, 0));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user]);

  useEffect(() => {
    if (mobileMenuOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
    return undefined;
  }, [mobileMenuOpen]);

  return (
    <header
      className={cn(
        "relative z-40 h-[60px] w-full border-b border-[rgba(232,213,176,0.6)] transition-shadow duration-300 md:h-[72px]",
        isScrolled && "shadow-card",
      )}
    >
      {/* Background layer — the backdrop-filter must live here, NOT on the
          header itself: a filtered element becomes the containing block for
          fixed descendants, which would clip the fullscreen mobile menu to
          the header's 60px height. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[rgba(253,246,236,0.92)] backdrop-blur-md backdrop-saturate-150"
      />
      <div className="mx-auto grid h-full w-full max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-6">
        {/* Left Section - Mobile Menu + Nav Links */}
        <div className="flex items-center gap-3 lg:gap-8">
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
            onClick={toggleMobileMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-espresso transition-colors duration-200 hover:bg-brand-gold-100 hover:text-brand-copper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-500 lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={pathname === item.href}
              />
            ))}
          </nav>
        </div>

        {/* Center Section - Logo */}
        <div className="flex justify-center">
          <Link href="/" className="inline-flex min-w-[120px] items-center justify-center" aria-label="Mannequin Care home">
            <Logo />
          </Link>
        </div>

        {/* Right Section - Icons */}
        <div className="flex items-center justify-end gap-3 lg:gap-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <IconButton
              label="Wishlist"
              icon={<Heart className="h-[22px] w-[22px]" strokeWidth={1.75} />}
              href="/wishlist"
              badgeCount={wishlistCount}
              onClick={closeMobileMenu}
            />
            <UserMenu
              user={user}
              onSignOut={async () => {
                await signOut({ callbackUrl: "/" });
              }}
            />
            <IconButton
              label="Cart"
              icon={<ShoppingBag className="h-[22px] w-[22px]" strokeWidth={1.75} />}
              href="/cart"
              badgeCount={cartCount}
              onClick={closeMobileMenu}
            />
          </div>
        </div>
      </div>

      {/* Mobile menu backdrop */}
      <div
        aria-hidden
        onClick={closeMobileMenu}
        className={cn(
          "fixed inset-0 z-40 bg-brand-espresso/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Mobile menu panel — full-screen slide-in from the right */}
      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!mobileMenuOpen}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-brand-cream px-6 py-6 shadow-hover transition-transform duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center" onClick={closeMobileMenu}>
            <Logo className="h-8" />
          </Link>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={toggleMobileMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-espresso transition-colors hover:bg-brand-gold-100 hover:text-brand-copper"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-12 flex flex-col gap-6">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileMenu}
              className={cn(
                "font-display text-5xl italic transition-colors duration-200",
                pathname === item.href
                  ? "text-brand-copper"
                  : "text-brand-espresso hover:text-brand-copper",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3">
          <Link
            href="/wishlist"
            onClick={closeMobileMenu}
            className="flex items-center justify-center gap-2 rounded-full border border-brand-sand px-4 py-3 font-sub text-xs font-medium uppercase tracking-[0.1em] text-brand-espresso transition-colors hover:bg-brand-gold-100"
          >
            <Heart className="h-4 w-4" /> Wishlist
            {wishlistCount > 0 ? ` (${wishlistCount})` : ""}
          </Link>
          <Link
            href="/cart"
            onClick={closeMobileMenu}
            className="flex items-center justify-center gap-2 rounded-full border border-brand-sand px-4 py-3 font-sub text-xs font-medium uppercase tracking-[0.1em] text-brand-espresso transition-colors hover:bg-brand-gold-100"
          >
            <ShoppingBag className="h-4 w-4" /> Cart
            {cartCount > 0 ? ` (${cartCount})` : ""}
          </Link>
          <Link
            href={user ? "/account" : "/auth/login"}
            onClick={closeMobileMenu}
            className="col-span-2 flex items-center justify-center gap-2 rounded-full bg-brand-gold-500 px-4 py-3 font-sub text-xs font-semibold uppercase tracking-[0.1em] text-brand-espresso transition-all hover:bg-brand-gold-600"
          >
            <User className="h-4 w-4" /> {user ? "My Account" : "Sign In"}
          </Link>
        </div>

        <div className="mt-auto pt-10">
          {user ? (
            <button
              type="button"
              onClick={async () => {
                await signOut({ callbackUrl: "/" });
                closeMobileMenu();
              }}
              className="flex items-center gap-2 font-sub text-sm font-medium uppercase tracking-[0.1em] text-brand-mocha transition-colors hover:text-brand-copper"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
