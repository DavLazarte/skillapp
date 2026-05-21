"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { AvatarCircle } from "@/components/shared/avatar-circle";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Dumbbell,
  Layers,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/coach", label: "Dashboard", icon: LayoutDashboard },
  { href: "/coach/alumnos", label: "Alumnos", icon: Users },
  { href: "/coach/planes", label: "Planes", icon: Layers },
  { href: "/coach/planificacion", label: "Planificación", icon: Calendar },
  { href: "/coach/pagos", label: "Pagos", icon: CreditCard },
  { href: "/coach/config", label: "Configuración", icon: Settings },
];

export function CoachSidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/coach") return pathname === "/coach";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen w-64 bg-sidebar flex flex-col border-r border-sidebar-border z-40 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/coach" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 bg-black">
              <img src="/iconlogo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-sidebar-foreground leading-tight">
                SkillFitness
              </h1>
              <p className="text-xs text-muted-foreground">Panel de Coach</p>
            </div>
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <AvatarCircle initials={user?.avatar || "?"} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.nombre}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
              >
                <Icon
                  className={cn("w-5 h-5", active && "text-sidebar-primary")}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
