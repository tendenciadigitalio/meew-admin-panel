import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      // Total de pedidos
      const { count: totalOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      // Total de usuarios
      const { count: totalUsers } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      // Total de productos
      const { count: totalProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // Productos destacados
      const { count: featuredProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_featured", true);

      // Productos nuevos
      const { count: newProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_new", true);

      // Variantes con stock bajo
      const { count: lowStockProducts } = await supabase
        .from("product_variants")
        .select("*", { count: "exact", head: true })
        .lte("stock_quantity", 5);

      // Ingresos totales (pedidos entregados)
      const { data: deliveredOrders } = await supabase
        .from("orders")
        .select("total")
        .eq("status", "delivered");

      const totalRevenue = deliveredOrders?.reduce(
        (sum, order) => sum + Number(order.total),
        0
      ) || 0;

      // Ventas de los últimos 7 días
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentOrders } = await supabase
        .from("orders")
        .select("created_at, total")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      // Agrupar ventas por día
      const salesByDay = recentOrders?.reduce((acc: any, order) => {
        const date = new Date(order.created_at).toLocaleDateString("es-ES", {
          month: "short",
          day: "numeric",
        });
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += Number(order.total);
        return acc;
      }, {});

      const chartData = Object.entries(salesByDay || {}).map(([date, total]) => ({
        date,
        total: Number(total),
      }));

      return {
        totalOrders: totalOrders || 0,
        totalUsers: totalUsers || 0,
        totalRevenue,
        totalProducts: totalProducts || 0,
        featuredProducts: featuredProducts || 0,
        newProducts: newProducts || 0,
        lowStockProducts: lowStockProducts || 0,
        chartData,
      };
    },
  });
}
