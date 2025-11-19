import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Copy,
  Tag,
  TrendingUp,
  Clock,
  Package,
} from "lucide-react";
import {
  useCoupons,
  useCouponStats,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  useToggleCouponStatus,
  Coupon,
  CouponFormData,
} from "@/hooks/use-coupons";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function CouponsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showExpired, setShowExpired] = useState<boolean | undefined>(undefined);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: coupons, isLoading } = useCoupons({
    status: statusFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
    expired: showExpired,
    search,
  });

  const { data: stats } = useCouponStats();

  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const deleteMutation = useDeleteCoupon();
  const toggleMutation = useToggleCouponStatus();

  const handleOpenDialog = (coupon?: Coupon) => {
    setEditingCoupon(coupon || null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: CouponFormData = {
      code: formData.get("code") as string,
      discount_type: formData.get("discount_type") as "percentage" | "fixed",
      discount_value: parseFloat(formData.get("discount_value") as string),
      minimum_purchase: formData.get("minimum_purchase")
        ? parseFloat(formData.get("minimum_purchase") as string)
        : undefined,
      maximum_uses: formData.get("maximum_uses")
        ? parseInt(formData.get("maximum_uses") as string)
        : undefined,
      expires_at: formData.get("expires_at")
        ? new Date(formData.get("expires_at") as string).toISOString()
        : undefined,
      is_active: formData.get("is_active") === "on",
      uses_per_customer: formData.get("uses_per_customer")
        ? parseInt(formData.get("uses_per_customer") as string)
        : undefined,
    };

    if (editingCoupon) {
      await updateMutation.mutateAsync({ id: editingCoupon.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }

    handleCloseDialog();
  };

  const handleDuplicate = (coupon: Coupon) => {
    handleOpenDialog({
      ...coupon,
      id: "",
      code: `${coupon.code}_COPY`,
      current_uses: 0,
    } as Coupon);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    setDeleteConfirm(null);
  };

  const formatDiscount = (type: string, value: number) => {
    return type === "percentage" ? `${value}%` : `$${value.toFixed(2)}`;
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isExhausted = (coupon: Coupon) => {
    if (!coupon.maximum_uses) return false;
    return coupon.current_uses >= coupon.maximum_uses;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cupones</h1>
          <p className="text-muted-foreground">Gestiona los cupones de descuento</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cupón
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cupones Activos</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalActive || 0}</div>
            <p className="text-xs text-muted-foreground">de {stats?.totalCoupons || 0} totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUses || 0}</div>
            <p className="text-xs text-muted-foreground">redempciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expiran Pronto</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.expiringSoon || 0}</div>
            <p className="text-xs text-muted-foreground">en los próximos 7 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Más Usado</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.mostUsed?.[0]?.code || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.mostUsed?.[0]?.current_uses || 0} usos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="percentage">Porcentaje</SelectItem>
                <SelectItem value="fixed">Monto fijo</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={showExpired === undefined ? "all" : showExpired ? "expired" : "valid"}
              onValueChange={(v) =>
                setShowExpired(v === "all" ? undefined : v === "expired")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Vencimiento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="valid">Vigentes</SelectItem>
                <SelectItem value="expired">Expirados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descuento</TableHead>
                <TableHead>Compra Mínima</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Expira</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : coupons?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No se encontraron cupones
                  </TableCell>
                </TableRow>
              ) : (
                coupons?.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {formatDiscount(coupon.discount_type, coupon.discount_value)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {coupon.minimum_purchase
                        ? `$${coupon.minimum_purchase.toFixed(2)}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {coupon.current_uses}
                      {coupon.maximum_uses ? ` / ${coupon.maximum_uses}` : " / ∞"}
                      {isExhausted(coupon) && (
                        <Badge variant="destructive" className="ml-2">
                          Agotado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {coupon.expires_at ? (
                        <div>
                          {format(new Date(coupon.expires_at), "dd MMM yyyy", { locale: es })}
                          {isExpired(coupon.expires_at) && (
                            <Badge variant="destructive" className="ml-2">
                              Expirado
                            </Badge>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={coupon.is_active}
                          onCheckedChange={(checked) =>
                            toggleMutation.mutate({ id: coupon.id, isActive: checked })
                          }
                        />
                        <Badge variant={coupon.is_active ? "default" : "secondary"}>
                          {coupon.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(coupon)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicate(coupon)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirm(coupon.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Crear/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? "Editar Cupón" : "Crear Nuevo Cupón"}
              </DialogTitle>
              <DialogDescription>
                {editingCoupon
                  ? "Modifica los detalles del cupón"
                  : "Completa los campos para crear un nuevo cupón"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  name="code"
                  defaultValue={editingCoupon?.code}
                  placeholder="VERANO2024"
                  required
                  disabled={!!editingCoupon}
                  className="uppercase"
                />
                <p className="text-xs text-muted-foreground">
                  Se convertirá automáticamente a mayúsculas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_type">Tipo de Descuento *</Label>
                <Select
                  name="discount_type"
                  defaultValue={editingCoupon?.discount_type || "percentage"}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                    <SelectItem value="fixed">Monto Fijo ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_value">Valor del Descuento *</Label>
                <Input
                  id="discount_value"
                  name="discount_value"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={editingCoupon?.discount_value}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimum_purchase">Compra Mínima</Label>
                <Input
                  id="minimum_purchase"
                  name="minimum_purchase"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={editingCoupon?.minimum_purchase || ""}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maximum_uses">Usos Máximos</Label>
                <Input
                  id="maximum_uses"
                  name="maximum_uses"
                  type="number"
                  min="1"
                  defaultValue={editingCoupon?.maximum_uses || ""}
                  placeholder="Ilimitado"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uses_per_customer">Usos por Cliente</Label>
                <Input
                  id="uses_per_customer"
                  name="uses_per_customer"
                  type="number"
                  min="1"
                  defaultValue={editingCoupon?.uses_per_customer || ""}
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires_at">Fecha de Expiración</Label>
                <Input
                  id="expires_at"
                  name="expires_at"
                  type="datetime-local"
                  defaultValue={
                    editingCoupon?.expires_at
                      ? new Date(editingCoupon.expires_at).toISOString().slice(0, 16)
                      : ""
                  }
                />
              </div>

              {editingCoupon && (
                <div className="space-y-2">
                  <Label>Usos Actuales</Label>
                  <Input value={editingCoupon.current_uses} disabled />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  name="is_active"
                  defaultChecked={editingCoupon?.is_active ?? true}
                />
                <Label htmlFor="is_active">Cupón Activo</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingCoupon ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmación de Eliminación */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El cupón será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
