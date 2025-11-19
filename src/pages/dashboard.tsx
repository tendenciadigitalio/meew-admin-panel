import { AlertTriangle, DollarSign, Package, ShoppingCart, Sparkles, Star, Users } from "lucide-react";
import { StatsCard } from "@/components/shared/stats-card";
import { useStats } from "@/hooks/use-stats";
import { useOrders } from "@/hooks/use-orders";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const statusVariants: Record<string, "warning" | "success" | "destructive" | "secondary"> = {
  pending: "warning",
  processing: "secondary",
  shipped: "secondary",
  delivered: "success",
  cancelled: "destructive",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  processing: "Procesando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default function Dashboard() {
  const { data: stats, isLoading: loadingStats } = useStats();
  const { data: orders, isLoading: loadingOrders } = useOrders();

  const recentOrders = orders?.slice(0, 5) || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Vista general de tu negocio
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <StatsCard
          title="Total Pedidos"
          value={loadingStats ? "..." : stats?.totalOrders || 0}
          icon={ShoppingCart}
        />
        <StatsCard
          title="Total Usuarios"
          value={loadingStats ? "..." : stats?.totalUsers || 0}
          icon={Users}
        />
        <StatsCard
          title="Ingresos Totales"
          value={loadingStats ? "..." : formatCurrency(stats?.totalRevenue || 0)}
          icon={DollarSign}
        />
        <StatsCard
          title="Total Productos"
          value={loadingStats ? "..." : stats?.totalProducts || 0}
          icon={Package}
        />
      </div>

      {/* Product Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-md">
              <div className="p-2 bg-white rounded-md border border-gray-200">
                <Star className="h-4 w-4 text-gray-700" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Destacados</div>
                <div className="text-lg font-semibold text-gray-900">
                  {loadingStats ? "..." : stats?.featuredProducts || 0}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-md">
              <div className="p-2 bg-white rounded-md border border-gray-200">
                <Sparkles className="h-4 w-4 text-gray-700" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Nuevos</div>
                <div className="text-lg font-semibold text-gray-900">
                  {loadingStats ? "..." : stats?.newProducts || 0}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-warning-soft rounded-md">
              <div className="p-2 bg-white rounded-md border border-warning/20">
                <AlertTriangle className="h-4 w-4 text-warning" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Stock Bajo</div>
                <div className="text-lg font-semibold text-gray-900">
                  {loadingStats ? "..." : stats?.lowStockProducts || 0}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Chart */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl font-bold uppercase tracking-wide">
            Ventas Últimos 7 Días
          </CardTitle>
          <p className="text-sm text-muted-foreground">Análisis de tendencias</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "2px solid hsl(var(--border))",
                  borderRadius: "0.125rem",
                }}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recientes</CardTitle>
          <CardDescription>Últimos 5 pedidos realizados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b-2">
                <TableHead className="font-bold uppercase">ID</TableHead>
                <TableHead className="font-bold uppercase">Cliente</TableHead>
                <TableHead className="font-bold uppercase">Total</TableHead>
                <TableHead className="font-bold uppercase">Estado</TableHead>
                <TableHead className="font-bold uppercase">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingOrders ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <ShoppingCart className="h-12 w-12" />
                      <p className="text-sm">No hay pedidos recientes</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order) => (
                  <TableRow key={order.id} className="border-b">
                    <TableCell className="font-mono text-xs">
                      {order.order_number}
                    </TableCell>
                    <TableCell>{order.user?.email || "N/A"}</TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(Number(order.total))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[order.status || "pending"]}>
                        {statusLabels[order.status || "pending"]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at!).toLocaleDateString("es-ES")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
