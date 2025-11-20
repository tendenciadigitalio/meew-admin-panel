import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MessageSquare,
  TrendingUp,
  Clock,
  Calendar,
} from "lucide-react";
import {
  usePopUps,
  usePopUpStats,
  useCreatePopUp,
  useUpdatePopUp,
  useDeletePopUp,
  useTogglePopUpStatus,
  PopUp,
  PopUpFormData,
} from "@/hooks/use-popups";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

export default function PopUpsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [ctaTypeFilter, setCtaTypeFilter] = useState<string>("all");
  const [validityFilter, setValidityFilter] = useState<"all" | "current" | "expired" | "future">("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPopUp, setEditingPopUp] = useState<PopUp | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [ctaType, setCtaType] = useState<string>("none");

  const { data: popups, isLoading } = usePopUps({
    status: statusFilter,
    ctaType: ctaTypeFilter === "all" ? undefined : ctaTypeFilter,
    validity: validityFilter,
    search,
  });

  const { data: stats } = usePopUpStats();

  const createMutation = useCreatePopUp();
  const updateMutation = useUpdatePopUp();
  const deleteMutation = useDeletePopUp();
  const toggleMutation = useTogglePopUpStatus();

  const handleOpenDialog = (popup?: PopUp) => {
    setEditingPopUp(popup || null);
    setCtaType(popup?.cta_type || "none");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPopUp(null);
    setCtaType("none");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: PopUpFormData = {
      title: formData.get("title") as string || undefined,
      description: formData.get("description") as string || undefined,
      image_url: formData.get("image_url") as string || undefined,
      is_full_screen_image: formData.get("is_full_screen_image") === "on",
      cta_text: formData.get("cta_text") as string || undefined,
      cta_type: formData.get("cta_type") as "none" | "category" | "product" | "external_url",
      cta_value: formData.get("cta_value") as string || undefined,
      priority: parseInt(formData.get("priority") as string) || 0,
      start_date: formData.get("start_date")
        ? new Date(formData.get("start_date") as string).toISOString()
        : undefined,
      end_date: formData.get("end_date")
        ? new Date(formData.get("end_date") as string).toISOString()
        : undefined,
      is_active: formData.get("is_active") === "on",
    };

    // Validaciones
    if (data.is_full_screen_image && !data.image_url) {
      toast.error("La imagen es requerida para el modo pantalla completa");
      return;
    }

    if (data.cta_type !== "none" && (!data.cta_text || !data.cta_value)) {
      toast.error("El texto y valor del CTA son requeridos");
      return;
    }

    if (editingPopUp) {
      await updateMutation.mutateAsync({ id: editingPopUp.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }

    handleCloseDialog();
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteMutation.mutateAsync(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const getValidityStatus = (popup: PopUp) => {
    const now = new Date();
    const startDate = popup.start_date ? new Date(popup.start_date) : null;
    const endDate = popup.end_date ? new Date(popup.end_date) : null;

    if (endDate && endDate < now) {
      return { label: "Expirado", variant: "destructive" as const };
    }
    if (startDate && startDate > now) {
      return { label: "Futuro", variant: "default" as const };
    }
    if ((startDate && startDate <= now) || !startDate) {
      if ((endDate && endDate >= now) || !endDate) {
        return { label: "Vigente", variant: "secondary" as const };
      }
    }
    return { label: "Sin programar", variant: "outline" as const };
  };

  const getPriorityBadgeVariant = (priority: number | null) => {
    if (!priority) return "outline" as const;
    if (priority > 5) return "default" as const;
    return "secondary" as const;
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Sin fecha";
    return format(new Date(date), "d 'de' MMM, yyyy", { locale: es });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando popups...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Popups Promocionales</h1>
        <Button onClick={() => handleOpenDialog()} size="sm">
          <Plus className="h-4 w-4" />
          Nuevo Popup
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200 rounded-md hover:border-gray-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="text-sm font-normal text-gray-500">Total Activos</div>
              <MessageSquare className="h-5 w-5 text-gray-400 stroke-[1.5]" />
            </div>
            <div className="text-3xl font-bold text-gray-900 tabular-nums">
              {stats?.totalActive || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-md hover:border-gray-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="text-sm font-normal text-gray-500">Programados</div>
              <Calendar className="h-5 w-5 text-gray-400 stroke-[1.5]" />
            </div>
            <div className="text-3xl font-bold text-gray-900 tabular-nums">
              {stats?.totalScheduled || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-md hover:border-gray-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="text-sm font-normal text-gray-500">Por Expirar</div>
              <Clock className="h-5 w-5 text-gray-400 stroke-[1.5]" />
            </div>
            <div className="text-3xl font-bold text-gray-900 tabular-nums">
              {stats?.expiringSoon || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-md hover:border-gray-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="text-sm font-normal text-gray-500">Mayor Prioridad</div>
              <TrendingUp className="h-5 w-5 text-gray-400 stroke-[1.5]" />
            </div>
            <div className="text-3xl font-bold text-gray-900 tabular-nums">
              {stats?.highestPriority?.priority || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={ctaTypeFilter} onValueChange={setCtaTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de CTA" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="none">Sin CTA</SelectItem>
            <SelectItem value="category">Categoría</SelectItem>
            <SelectItem value="product">Producto</SelectItem>
            <SelectItem value="external_url">URL Externa</SelectItem>
          </SelectContent>
        </Select>

        <Select value={validityFilter} onValueChange={(value: any) => setValidityFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Vigencia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="current">Vigentes</SelectItem>
            <SelectItem value="expired">Expirados</SelectItem>
            <SelectItem value="future">Futuros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="text-gray-500 font-semibold text-xs uppercase tracking-wider">
                Título
              </TableHead>
              <TableHead className="text-gray-500 font-semibold text-xs uppercase tracking-wider">
                Modo
              </TableHead>
              <TableHead className="text-gray-500 font-semibold text-xs uppercase tracking-wider">
                CTA
              </TableHead>
              <TableHead className="text-gray-500 font-semibold text-xs uppercase tracking-wider">
                Prioridad
              </TableHead>
              <TableHead className="text-gray-500 font-semibold text-xs uppercase tracking-wider">
                Vigencia
              </TableHead>
              <TableHead className="text-gray-500 font-semibold text-xs uppercase tracking-wider">
                Estado
              </TableHead>
              <TableHead className="text-gray-500 font-semibold text-xs uppercase tracking-wider text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {popups && popups.length > 0 ? (
              popups.map((popup) => {
                const validityStatus = getValidityStatus(popup);
                return (
                  <TableRow key={popup.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      {popup.title || "Sin título"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={popup.is_full_screen_image ? "default" : "secondary"}>
                        {popup.is_full_screen_image ? "Imagen Completa" : "Estándar"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{popup.cta_type || "none"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(popup.priority)}>
                        {popup.priority || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={validityStatus.variant}>{validityStatus.label}</Badge>
                        {popup.start_date && (
                          <div className="text-xs text-gray-500">
                            Inicio: {formatDate(popup.start_date)}
                          </div>
                        )}
                        {popup.end_date && (
                          <div className="text-xs text-gray-500">
                            Fin: {formatDate(popup.end_date)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={popup.is_active || false}
                        onCheckedChange={(checked) =>
                          toggleMutation.mutate({ id: popup.id, isActive: checked })
                        }
                        disabled={toggleMutation.isPending}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(popup)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(popup.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No se encontraron popups
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPopUp ? "Editar Popup" : "Crear Nuevo Popup"}</DialogTitle>
            <DialogDescription>
              {editingPopUp
                ? "Actualiza la información del popup promocional"
                : "Completa el formulario para crear un nuevo popup"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingPopUp?.title || ""}
                  placeholder="Título del popup (opcional)"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingPopUp?.description || ""}
                  placeholder="Descripción del popup (opcional)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="image_url">URL de Imagen</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  defaultValue={editingPopUp?.image_url || ""}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_full_screen_image"
                  name="is_full_screen_image"
                  defaultChecked={editingPopUp?.is_full_screen_image || false}
                />
                <Label htmlFor="is_full_screen_image" className="font-normal cursor-pointer">
                  Imagen a pantalla completa
                </Label>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-4">Call to Action (CTA)</h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cta_text">Texto del Botón</Label>
                    <Input
                      id="cta_text"
                      name="cta_text"
                      defaultValue={editingPopUp?.cta_text || ""}
                      placeholder="Ej: Ver productos"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cta_type">Tipo de CTA</Label>
                    <Select
                      name="cta_type"
                      defaultValue={editingPopUp?.cta_type || "none"}
                      onValueChange={setCtaType}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin acción</SelectItem>
                        <SelectItem value="category">Categoría</SelectItem>
                        <SelectItem value="product">Producto</SelectItem>
                        <SelectItem value="external_url">URL Externa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {ctaType !== "none" && (
                    <div>
                      <Label htmlFor="cta_value">Valor del CTA</Label>
                      <Input
                        id="cta_value"
                        name="cta_value"
                        defaultValue={editingPopUp?.cta_value || ""}
                        placeholder={
                          ctaType === "category"
                            ? "ID de categoría"
                            : ctaType === "product"
                            ? "ID o slug del producto"
                            : "https://ejemplo.com"
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-4">Programación</h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="priority">Prioridad</Label>
                    <Input
                      id="priority"
                      name="priority"
                      type="number"
                      defaultValue={editingPopUp?.priority || 0}
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Mayor número = mayor prioridad
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="start_date">Fecha de Inicio</Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="datetime-local"
                      defaultValue={
                        editingPopUp?.start_date
                          ? new Date(editingPopUp.start_date).toISOString().slice(0, 16)
                          : ""
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date">Fecha de Fin</Label>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="datetime-local"
                      defaultValue={
                        editingPopUp?.end_date
                          ? new Date(editingPopUp.end_date).toISOString().slice(0, 16)
                          : ""
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_active"
                      name="is_active"
                      defaultChecked={editingPopUp?.is_active ?? true}
                    />
                    <Label htmlFor="is_active" className="font-normal cursor-pointer">
                      Activo
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingPopUp ? "Actualizar" : "Crear"} Popup
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El popup será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
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
