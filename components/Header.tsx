

"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { getGuestCart } from "@/lib/services/guest-cart";
import {
  Heart,
  LogIn,
  LogOut,
  Menu,
  Search,
  Settings,
  ShoppingBag,
  User,
  X,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/about-us", label: "About Us" },
  { href: "/shop", label: "Shop" },
  { href: "/contact-us", label: "Contact Us" },
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
        "relative text-sm font-medium transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      <span
        aria-hidden
        className={cn(
          "absolute -bottom-2 left-0 h-0.5 w-full origin-left scale-x-0 bg-foreground transition-transform duration-200",
          isActive && "scale-x-100",
        )}
      />
    </Link>
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
    <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-muted/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
      {icon}
      {typeof badgeCount === "number" && badgeCount > 0 ? (
        <span className="absolute -right-1 -top-1 min-w-[1.4rem] rounded-full bg-primary px-1 text-[0.65rem] font-semibold leading-4 text-primary-foreground">
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
  session: Session | null;
  onSignOut: () => Promise<void>;
};

function UserMenu({ session, onSignOut }: UserMenuProps) {
  const router = useRouter();
  const user = session?.user ?? null;
  const name =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.user_metadata?.name ||
    user?.email ||
    "Account";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
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
      className="h-10 w-10 rounded-full object-cover"
    />
  ) : (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary">
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
              <span className="block text-sm font-medium">{name}</span>
              <span className="block text-xs text-muted-foreground">{user.email}</span>
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
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const toggleMobileMenu = useCallback(
    () => setMobileMenuOpen((prev) => !prev),
    [],
  );

  const fetchCounts = useCallback(async () => {
    if (session?.user) {
      const [{ count: wishlist }, { count: cart }] = await Promise.all([
        supabase
          .from("wishlist_items")
          .select("id", { count: "exact", head: true })
          .eq("user_id", session.user.id),
        supabase
          .from("cart_items")
          .select("id", { count: "exact", head: true })
          .eq("user_id", session.user.id),
      ]);

      setWishlistCount(typeof wishlist === "number" ? wishlist : 0);
      setCartCount(typeof cart === "number" ? cart : 0);
    } else {
      const guestCart = getGuestCart();
      setCartCount(guestCart.reduce((sum, item) => sum + item.quantity, 0));
      setWishlistCount(0);
    }
  }, [session, supabase]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
    };
    void getInitialSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    void fetchCounts();
  }, [session, fetchCounts]);

  useEffect(() => {
    if (session?.user) {
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
  }, [session?.user]);

  useEffect(() => {
    if (!session?.user) {
      return;
    }
    const wishlistChannel = supabase
      .channel("wishlist-items-count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wishlist_items", filter: `user_id=eq.${session.user.id}` },
        () => {
          void fetchCounts();
        },
      )
      .subscribe();

    const cartChannel = supabase
      .channel("cart-items-count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cart_items", filter: `user_id=eq.${session.user.id}` },
        () => {
          void fetchCounts();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(wishlistChannel);
      supabase.removeChannel(cartChannel);
    };
  }, [session, supabase, fetchCounts]);

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
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-4 md:px-6">
        {/* Left Section - Mobile Menu + Nav Links */}
        <div className="flex items-center gap-3 lg:gap-8">
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
            onClick={toggleMobileMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-muted/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.slice(0, 4).map((item) => (
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
          <Link href="/" className="inline-flex items-center" aria-label="Mannequin Care home">
            <Image
              src="/logo.jpg"
              alt="Mannequin Care"
              width={140}
              height={40}
              className="h-10 w-auto transition-all duration-300"
              style={{ width: "auto" }}
              priority
            />
          </Link>
        </div>

        {/* Right Section - Nav Links + Icons */}
        <div className="flex items-center justify-end gap-3 lg:gap-8">
          {/* <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.slice(2).map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={pathname === item.href}
              />
            ))}
          </nav> */}

          <div className="flex items-center gap-2 sm:gap-3">
            <IconButton
              label="Wishlist"
              icon={<Heart className="h-5 w-5" />}
              href="/wishlist"
              badgeCount={wishlistCount}
              onClick={closeMobileMenu}
            />
            <UserMenu
              session={session}
              onSignOut={async () => {
                await supabase.auth.signOut();
              }}
            />
            <IconButton
              label="Cart"
              icon={<ShoppingBag className="h-5 w-5" />}
              href="/cart"
              badgeCount={cartCount}
              onClick={closeMobileMenu}
            />
          </div>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" aria-hidden onClick={closeMobileMenu} />
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col bg-background px-4 py-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <Link href="/" className="inline-flex items-center gap-2" onClick={closeMobileMenu}>
                <Image
                  src="/logo.jpg"
                  alt="Mannequin Care"
                  width={120}
                  height={32}
                  className="h-8 w-auto"
                  style={{ width: "auto" }}
                />
              </Link>
              <button
                type="button"
                aria-label="Close navigation"
                onClick={toggleMobileMenu}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-8 flex flex-col gap-4 text-base font-medium">
              {NAV_LINKS.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  isActive={pathname === item.href}
                  onNavigate={closeMobileMenu}
                />
              ))}
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3">
              <IconButton
                label="Wishlist"
                icon={<Heart className="h-5 w-5" />}
                href="/wishlist"
                badgeCount={wishlistCount}
                onClick={closeMobileMenu}
              />
              <IconButton
                label="Cart"
                icon={<ShoppingBag className="h-5 w-5" />}
                href="/cart"
                badgeCount={cartCount}
                onClick={closeMobileMenu}
              />
              <IconButton
                label="Account"
                icon={<User className="h-5 w-5" />}
                href={session?.user ? "/account" : "/auth/login"}
                onClick={closeMobileMenu}
              />
            </div>
            <div className="mt-auto">
              <UserMenu
                session={session}
                onSignOut={async () => {
                  await supabase.auth.signOut();
                  closeMobileMenu();
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}