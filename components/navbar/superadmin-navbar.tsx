"use client";

import { useRouter } from "next/navigation";
import {
  Shirt,
  LogOut,
  ChevronDown,
  Database,
  Users,
  UserCircle,
  Package,
} from "lucide-react";

import { useAuthStore } from "@/lib/store/use-auth-store";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SuperadminNavbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6 shadow-sm">
      <div className="flex items-center gap-6">
        {/* Logo & Brand */}
        <div
          className="flex items-center gap-2 font-bold text-lg tracking-tight cursor-pointer"
          onClick={() => router.push("/master")}
        >
          <Shirt className="h-5 w-5 text-primary" />
          <span>Ala Collection</span>
        </div>

        {/* Navigation Dropdown */}
        <nav className="hidden md:flex items-center gap-2 border-l pl-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 font-medium"
              >
                <Database className="h-4 w-4 text-muted-foreground" />
                Master
                <ChevronDown className="h-3 w-3 opacity-50 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem
                onClick={() => router.push("/master/user")}
                className="cursor-pointer"
              >
                <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Data User</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/master/karyawan")}
                className="cursor-pointer"
              >
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Karyawan</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/master/product")}
                className="cursor-pointer"
              >
                <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Product</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>

      {/* Right Side: User Info, Theme Toggle, & Logout */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-right hidden sm:block">
          <p className="font-medium leading-none">
            {user?.namaLengkap || "Super Administrator"}
          </p>
          <p className="text-muted-foreground text-xs mt-1 capitalize">
            {user?.peran || "Superadmin"}
          </p>
        </div>
        <ThemeToggle />
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" /> Keluar
        </Button>
      </div>
    </header>
  );
}
