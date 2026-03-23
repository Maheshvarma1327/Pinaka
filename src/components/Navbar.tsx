import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, ChevronDown, Ham, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Dressing", path: "/dressing" },
  { label: "Supply", path: "/supply" },
  {
    label: "Inventory",
    children: [
      { label: "Inventory In", path: "/inventory/in" },
      { label: "Inventory Out", path: "/inventory/out" },
    ],
  },
  { label: "Billing", path: "/billing" },
  { label: "Costs", path: "/costs" },
  { label: "Reports", path: "/reports" },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [invOpen, setInvOpen] = useState(false);

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const isInventoryActive = navItems
    .find((n) => n.label === "Inventory")
    ?.children?.some((c) => isActive(c.path));

  return (
    <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
      {/* Row 1 */}
      <div className="container flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2">
          <Ham className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary">Pinaka</span>
        </Link>
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-md hover:bg-secondary">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
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
          {navItems.map((item) =>
            item.children ? (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors outline-none",
                    isInventoryActive
                      ? "text-primary bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44">
                  {item.children.map((child) => (
                    <DropdownMenuItem asChild key={child.path}>
                      <Link
                        to={child.path}
                        className={cn(
                          "w-full cursor-pointer",
                          isActive(child.path) ? "text-primary font-medium" : "text-muted-foreground"
                        )}
                      >
                        {child.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
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
            )
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="sm:hidden border-t bg-card px-4 pb-4 pt-2 space-y-1">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.label}>
                <button
                  onClick={() => setInvOpen(!invOpen)}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-sm font-medium rounded-md",
                    isInventoryActive ? "text-primary bg-accent" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", invOpen && "rotate-180")} />
                </button>
                {invOpen &&
                  item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block pl-8 pr-3 py-2 text-sm rounded-md",
                        isActive(child.path) ? "text-primary bg-accent" : "text-muted-foreground"
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
              </div>
            ) : (
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
            )
          )}
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
