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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/blogs", label: "Blogs", icon: BookOpen },
  { href: "/admin/reviews", label: "Reviews", icon: MessageCircle },
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
    <div className="flex min-h-screen bg-background text-foreground">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow"
        aria-label="Open admin navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-hidden
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r bg-white transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-primary/10 text-primary">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={48}
                height={48}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm font-semibold uppercase">
                {initials || <UserRound className="h-5 w-5" />}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold">{displayName || "Admin"}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNavigate(item.href)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="border-t px-4 py-4">
          <Button
            type="button"
            className="w-full gap-2"
            variant="destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 bg-slate-50 lg:pl-72">
        <div className="min-h-screen px-4 pb-10 pt-20 lg:px-8 lg:pt-10">{children}</div>
      </main>
    </div>
  );
}
