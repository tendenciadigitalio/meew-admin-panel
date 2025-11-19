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
    <div className="fixed left-0 top-0 flex h-screen w-[280px] flex-col bg-sidebar">
      {/* Logo Area */}
      <div className="flex h-20 items-center px-6 border-b border-sidebar-border flex-shrink-0">
        <h1 className="text-base font-semibold tracking-tight text-sidebar-foreground">
          MEEW Admin Panel
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/"}
            className={cn(
              "flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-all duration-normal",
              "text-gray-400 hover:bg-sidebar-accent hover:text-white"
            )}
            activeClassName="bg-sidebar-active text-white border-l-3 border-white font-semibold"
          >
            <item.icon className="h-5 w-5 stroke-[1.5]" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="border-t border-sidebar-border p-4 flex-shrink-0">
        <div className="mb-3 px-2">
          <div className="text-xs font-medium text-sidebar-foreground/90 truncate mb-0.5">
            {user?.email?.split('@')[0]}
          </div>
          <div className="text-xs text-gray-400 truncate">
            {user?.email}
          </div>
        </div>
        <Button
          onClick={signOut}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-400 hover:bg-sidebar-accent hover:text-white transition-all"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
