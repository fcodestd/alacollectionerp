"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shirt,
  LogOut,
  Home,
  Scissors,
  Layers,
  CalendarDays,
  User,
} from "lucide-react";

import { useAuthStore } from "@/lib/store/use-auth-store";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/hris", icon: Home },
  { name: "Jahit", href: "/hris/payroll/jahit", icon: Scissors },
  { name: "Potong", href: "/hris/payroll/potong", icon: Layers },
  { name: "Harian", href: "/hris/payroll/harian", icon: CalendarDays },
];

export function NavbarHris() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      {/* DESKTOP TOP NAVBAR (Hidden on Mobile) */}
      <header className="sticky top-0 z-50 hidden md:flex h-16 w-full items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <div
            className="flex items-center gap-2 font-bold text-lg tracking-tight cursor-pointer"
            onClick={() => router.push("/hris")}
          >
            <Shirt className="h-5 w-5 text-primary" />
            <span>Ala HRIS</span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isActive
                        ? "bg-muted"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-right mr-2 border-r pr-4">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {user?.namaLengkap || "Personalia"}
            </span>
          </div>
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Keluar
          </Button>
        </div>
      </header>

      {/* MOBILE BOTTOM TAB BAR (Hidden on Desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background/80 backdrop-blur-md pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon
                className={cn("h-5 w-5", isActive && "fill-primary/20")}
              />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* MOBILE TOP HEADER (For branding and logout on mobile) */}
      <header className="md:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2 font-bold text-md tracking-tight">
          <Shirt className="h-4 w-4 text-primary" />
          <span>Ala HRIS</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
    </>
  );
}
