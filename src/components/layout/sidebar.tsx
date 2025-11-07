import { LayoutDashboard, Package, ShoppingCart, Users } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Productos", href: "/products", icon: Package },
  { name: "Pedidos", href: "/orders", icon: ShoppingCart },
  { name: "Usuarios", href: "/users", icon: Users },
];

export function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <h1 className="text-xl font-bold uppercase tracking-wider text-sidebar-foreground">
          Meew Admin
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/"}
            className={cn(
              "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium uppercase tracking-wide transition-colors",
              "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
            activeClassName="bg-sidebar-accent border-l-2 border-sidebar-foreground"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-sidebar-accent">
            <span className="text-sm font-bold uppercase text-sidebar-foreground">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-sidebar-foreground">Admin</p>
            <p className="text-xs text-sidebar-foreground/60">admin@meew.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
