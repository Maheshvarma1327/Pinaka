import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, Ham, Menu, X, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Dressing", path: "/dressing" },
  { label: "Inventory & Supply", path: "/supply" },
  { label: "Shop", path: "/shop" },
  { label: "Sales", path: "/sales" },
  { label: "Reports", path: "/reports" },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark" | "default">(() => {
    return (localStorage.getItem("theme") as "light" | "dark" | "default") || "default";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    
    if (theme === "default") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
      localStorage.removeItem("theme");
      return;
    }
    
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b shadow-md">
      {/* Row 1 */}
      <div className="container flex items-center justify-between h-14">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Ham className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary">Pinaka</span>
        </Link>
        <div className="flex items-center gap-3">
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 hover:bg-secondary border shadow-md bg-background transition-shadow">
                <Sun className="h-4 w-4 dark:hidden" />
                <Moon className="h-4 w-4 hidden dark:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuItem onClick={() => setTheme("default")} className="font-semibold cursor-pointer">
                System Default
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("light")} className="font-semibold cursor-pointer">
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="font-semibold cursor-pointer">
                Dark
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="relative p-2 hover:bg-secondary">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary" />
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm font-medium">B Manoj</span>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              BM
            </div>
          </div>
          <button
            className="sm:hidden p-2 rounded-md hover:bg-secondary"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Row 2 - Desktop */}
      <nav className="hidden sm:block border-t bg-card">
        <div className="container flex items-center gap-1 h-11">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path!}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive(item.path)
                  ? "text-primary bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="sm:hidden border-t bg-card px-4 pb-4 pt-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path!}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-3 py-2 text-sm font-medium rounded-md",
                isActive(item.path) ? "text-primary bg-accent" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 px-3 pt-2 border-t mt-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              BM
            </div>
            <span className="text-sm font-medium">B Manoj</span>
          </div>
        </nav>
      )}
    </header>
  );
}
