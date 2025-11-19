import { LayoutDashboard, Package, Tag, ShoppingCart, Users, Image, LogOut, Ticket } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Productos", href: "/products", icon: Package },
  { name: "Categorías", href: "/categories", icon: Tag },
  { name: "Banners", href: "/banners", icon: Image },
  { name: "Cupones", href: "/coupons", icon: Ticket },
  { name: "Pedidos", href: "/orders", icon: ShoppingCart },
  { name: "Usuarios", href: "/users", icon: Users },
];

export function Sidebar() {
  const { signOut, user } = useAuth();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <h1 className="text-xl font-bold uppercase tracking-wider text-sidebar-foreground">
          Mercado Meew Admin
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
      <div className="border-t border-sidebar-border p-4 space-y-3">
        <div className="text-xs text-sidebar-foreground/60 uppercase truncate">
          {user?.email}
        </div>
        <Button
          onClick={signOut}
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
