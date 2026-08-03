"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  UserRound,
  Users,
  X,
  MessageCircle,
  Layers,
  Inbox,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/coupons", label: "Promo Codes", icon: Ticket },
  { href: "/admin/blogs", label: "Blogs", icon: BookOpen },
  { href: "/admin/reviews", label: "Reviews", icon: MessageCircle },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export type AdminShellProps = {
  displayName: string;
  email: string;
  avatarUrl?: string | null;
  onSignOut: () => Promise<void>;
  children: React.ReactNode;
};

export function AdminShell({ displayName, email, avatarUrl, onSignOut, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = useMemo(() => {
    if (avatarUrl) return "";
    const source = displayName || email || "Admin";
    return source
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  }, [avatarUrl, displayName, email]);

  const handleNavigate = (href: string) => {
    router.push(href);
    setSidebarOpen(false);
  };

  const handleSignOut = async () => {
    await onSignOut();
    router.push("/auth/login");
  };

  return (
    <div className="flex bg-background text-foreground relative min-h-[calc(100vh-5rem)] md:min-h-[calc(100vh-6rem)]">
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-[100px] left-4 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow"
        aria-label="Open admin navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-hidden
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      {/* Sidebar (Mobile Fixed, Desktop Sticky & Hover) */}
      <aside
        className={cn(
          // Mobile classes
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-white transition-all duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop classes
          "lg:sticky lg:top-20 md:lg:top-24 lg:translate-x-0 lg:z-30 lg:h-[calc(100vh-5rem)] md:lg:h-[calc(100vh-6rem)] lg:w-[72px] lg:hover:w-72 overflow-hidden group"
        )}
      >
        <div className="flex items-center gap-3 px-4 py-5 border-b shrink-0 h-[88px]">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary/10 text-primary flex items-center justify-center">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={40}
                height={40}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-sm font-semibold uppercase">
                {initials || <UserRound className="h-5 w-5" />}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-hidden lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <p className="truncate text-sm font-semibold">{displayName || "Admin"}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNavigate(item.href)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-black text-white shadow"
                    : "text-muted-foreground hover:bg-gray-100 hover:text-foreground",
                )}
                title={item.label}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
        <div className="border-t px-3 py-4 shrink-0">
          <Button
            type="button"
            className="w-full justify-start gap-3 px-3 overflow-hidden"
            variant="destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="truncate lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Sign out
            </span>
          </Button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 bg-slate-50 min-w-0">
        <div className="min-h-full px-4 pb-10 pt-20 lg:px-8 lg:pt-6">{children}</div>
      </main>
    </div>
  );
}
