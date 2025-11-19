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
    <div className="flex h-screen w-[280px] flex-col bg-sidebar">
      {/* Logo Area - 80px height */}
      <div className="flex h-20 items-center justify-center border-b border-gray-800">
        <h1 className="text-base font-bold uppercase tracking-[0.15em] text-white">
          MEEW ADMIN
        </h1>
      </div>

      {/* Navigation - 48px height each */}
      <nav className="flex-1 space-y-0 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/"}
            className={cn(
              "flex h-12 items-center gap-3 px-6 text-sm font-medium uppercase tracking-wide transition-all duration-fast",
              "text-gray-400 hover:bg-sidebar-hover hover:text-white"
            )}
            activeClassName="bg-sidebar-active text-white font-semibold border-l-[3px] border-white"
          >
            <item.icon className="h-5 w-5" strokeWidth={1.5} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile - Bottom */}
      <div className="border-t border-gray-800 p-6">
        <div className="mb-4 space-y-1">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Conectado como
          </div>
          <div className="truncate text-sm font-medium text-white">
            {user?.email}
          </div>
        </div>
        <Button
          onClick={signOut}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-400 hover:bg-sidebar-hover hover:text-white"
        >
          <LogOut className="mr-2 h-4 w-4" strokeWidth={1.5} />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
