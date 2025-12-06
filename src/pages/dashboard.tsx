import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { AlertTriangle, DollarSign, Package, ShoppingCart, Sparkles, Star, Users, TrendingUp, ShoppingBag } from "lucide-react";
import { StatsCard } from "@/components/shared/stats-card";
import { useStats } from "@/hooks/use-stats";
import { useOrders } from "@/hooks/use-orders";
import {
  useSalesByPeriod,
  useTopSellingProducts,
  useSalesByCategory,
  useRecentActivity,
} from "@/hooks/use-analytics";
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
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [salesPeriod, setSalesPeriod] = useState<'week' | 'month' | 'year'>('month');
  
  const { data: stats, isLoading: loadingStats } = useStats();
  const { data: orders, isLoading: loadingOrders } = useOrders();
  const { data: salesData, isLoading: loadingSales } = useSalesByPeriod(salesPeriod);
  const { data: topProducts, isLoading: loadingTopProducts } = useTopSellingProducts(5);
  const { data: categoryData, isLoading: loadingCategories } = useSalesByCategory();
  const { data: recentActivity, isLoading: loadingActivity } = useRecentActivity(10);

  const recentOrders = orders?.slice(0, 5) || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  // Calculate max for sales chart
  const maxSales = Math.max(...(salesData || []).map(d => d.total_sales), 1);
  const totalPeriodSales = (salesData || []).reduce((sum, d) => sum + d.total_sales, 0);
  const totalPeriodOrders = (salesData || []).reduce((sum, d) => sum + d.order_count, 0);

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

      {/* Sales Chart with Period Selector */}
      <Card className="border-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold uppercase tracking-wide">
              Análisis de Ventas
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {formatCurrency(totalPeriodSales)} en {totalPeriodOrders} pedidos
            </p>
          </div>
          <Tabs value={salesPeriod} onValueChange={(v) => setSalesPeriod(v as any)}>
            <TabsList>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mes</TabsTrigger>
              <TabsTrigger value="year">Año</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loadingSales ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : salesData && salesData.length > 0 ? (
            <div className="space-y-3">
              {salesData.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 text-xs text-muted-foreground font-medium">
                    {item.period_label}
                  </div>
                  <div className="flex-1 h-8 bg-muted rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${(item.total_sales / maxSales) * 100}%` }}
                    />
                  </div>
                  <div className="w-28 text-right">
                    <div className="text-sm font-semibold">{formatCurrency(item.total_sales)}</div>
                    <div className="text-xs text-muted-foreground">{item.order_count} pedidos</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mb-2" />
              <p className="text-sm">No hay datos de ventas para este período</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two Column Grid: Top Products & Sales by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold uppercase">Top Productos Vendidos</CardTitle>
            <CardDescription>Los 5 productos más vendidos</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTopProducts ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topProducts && topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.product_id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded bg-muted text-sm font-bold">
                      {product.product_image ? (
                        <img 
                          src={product.product_image} 
                          alt={product.product_name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <span className="text-muted-foreground">#{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{product.product_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {product.total_sold} vendidos
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatCurrency(product.total_revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Package className="h-10 w-10 mb-2" />
                <p className="text-sm">No hay datos de productos</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold uppercase">Ventas por Categoría</CardTitle>
            <CardDescription>Distribución de ventas</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCategories ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : categoryData && categoryData.length > 0 ? (
              <div className="space-y-4">
                {categoryData.map((cat) => (
                  <div key={cat.category_name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{cat.category_name}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(cat.total_sales)} ({cat.percentage}%)
                      </span>
                    </div>
                    <Progress value={cat.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <TrendingUp className="h-10 w-10 mb-2" />
                <p className="text-sm">No hay datos de categorías</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg font-bold uppercase">Actividad Reciente</CardTitle>
          <CardDescription>Últimas acciones en tu tienda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-y-auto pr-2">
            {loadingActivity ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-2">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
                    <div className={`p-2 rounded-full ${activity.activity_type === 'order' ? 'bg-primary/10' : 'bg-warning/10'}`}>
                      {activity.activity_type === 'order' ? (
                        <ShoppingBag className="h-4 w-4 text-primary" />
                      ) : (
                        <Star className="h-4 w-4 text-warning" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{activity.description}</div>
                      {activity.activity_type === 'order' && activity.metadata?.total && (
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(activity.metadata.total)}
                        </div>
                      )}
                      {activity.activity_type === 'review' && activity.metadata?.rating && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < activity.metadata.rating ? 'fill-warning text-warning' : 'text-muted'}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: es })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <ShoppingBag className="h-10 w-10 mb-2" />
                <p className="text-sm">No hay actividad reciente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Original Sales Chart (kept) */}
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
