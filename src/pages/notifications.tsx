import { useState, useMemo } from "react";
import { Bell, Plus, Send, Clock, Copy, X, Loader2, Calendar, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  useNotifications,
  useCreateNotification,
  useUpdateNotification,
  useDeleteNotification,
  useSendNotification,
  PromoNotification,
} from "@/hooks/use-notifications";
import { useCategories } from "@/hooks/use-categories";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline"; className?: string }> = {
  draft: { label: "Borrador", variant: "secondary" },
  scheduled: { label: "Programada", variant: "warning" },
  sending: { label: "Enviando", variant: "outline", className: "animate-pulse bg-info/10 text-info border-info/20" },
  sent: { label: "Enviada", variant: "success" },
  failed: { label: "Fallida", variant: "destructive" },
  cancelled: { label: "Cancelada", variant: "secondary", className: "line-through opacity-60" },
};

const AUDIENCE_LABELS: Record<string, string> = {
  all: "Todos",
  registered: "Registrados",
  guests: "Invitados",
};

const GENDER_LABELS: Record<string, string> = {
  mujer: "Mujer",
  hombre: "Hombre",
  kids: "Kids",
};

const ACTION_LABELS: Record<string, string> = {
  home: "Ir a inicio",
  category: "Ir a categoría",
  product: "Ir a producto",
  url: "Abrir URL",
};

type FormData = {
  title: string;
  body: string;
  image_url: string;
  target_audience: string;
  target_gender: string;
  action_type: string;
  action_value: string;
  scheduled_at: string;
  isScheduled: boolean;
};

const initialFormData: FormData = {
  title: "",
  body: "",
  image_url: "",
  target_audience: "all",
  target_gender: "",
  action_type: "home",
  action_value: "",
  scheduled_at: "",
  isScheduled: false,
};

export default function Notifications() {
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: categories = [] } = useCategories();
  const createNotification = useCreateNotification();
  const updateNotification = useUpdateNotification();
  const deleteNotification = useDeleteNotification();
  const sendNotification = useSendNotification();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<PromoNotification | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<PromoNotification | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const filteredNotifications = useMemo(() => {
    if (filterStatus === "all") return notifications;
    return notifications.filter((n) => n.status === filterStatus);
  }, [notifications, filterStatus]);

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingNotification(null);
  };

  const handleOpenDialog = (notification?: PromoNotification) => {
    if (notification) {
      setEditingNotification(notification);
      setFormData({
        title: notification.title,
        body: notification.body,
        image_url: notification.image_url || "",
        target_audience: notification.target_audience,
        target_gender: notification.target_gender || "",
        action_type: notification.action_type,
        action_value: notification.action_value || "",
        scheduled_at: notification.scheduled_at ? notification.scheduled_at.slice(0, 16) : "",
        isScheduled: !!notification.scheduled_at,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSaveDraft = async () => {
    const data = {
      title: formData.title,
      body: formData.body,
      image_url: formData.image_url || null,
      target_audience: formData.target_audience,
      target_gender: formData.target_gender || null,
      action_type: formData.action_type,
      action_value: formData.action_value || null,
      scheduled_at: null,
      status: "draft",
    };

    if (editingNotification) {
      await updateNotification.mutateAsync({ id: editingNotification.id, ...data });
    } else {
      await createNotification.mutateAsync(data);
    }
    handleCloseDialog();
  };

  const handleSchedule = async () => {
    if (!formData.scheduled_at) return;

    const data = {
      title: formData.title,
      body: formData.body,
      image_url: formData.image_url || null,
      target_audience: formData.target_audience,
      target_gender: formData.target_gender || null,
      action_type: formData.action_type,
      action_value: formData.action_value || null,
      scheduled_at: new Date(formData.scheduled_at).toISOString(),
      status: "scheduled",
    };

    if (editingNotification) {
      await updateNotification.mutateAsync({ id: editingNotification.id, ...data });
    } else {
      await createNotification.mutateAsync(data);
    }
    handleCloseDialog();
  };

  const handleSendNow = async () => {
    let notificationId = editingNotification?.id;

    if (!notificationId) {
      const data = {
        title: formData.title,
        body: formData.body,
        image_url: formData.image_url || null,
        target_audience: formData.target_audience,
        target_gender: formData.target_gender || null,
        action_type: formData.action_type,
        action_value: formData.action_value || null,
        scheduled_at: null,
        status: "sending",
      };
      const result = await createNotification.mutateAsync(data);
      notificationId = result.id;
    } else {
      await updateNotification.mutateAsync({ id: notificationId, status: "sending" });
    }

    await sendNotification.mutateAsync(notificationId);
    handleCloseDialog();
  };

  const handleCancelScheduled = async (id: string) => {
    await updateNotification.mutateAsync({ id, status: "cancelled" });
  };

  const handleDuplicate = async (notification: PromoNotification) => {
    await createNotification.mutateAsync({
      title: `${notification.title} (copia)`,
      body: notification.body,
      image_url: notification.image_url,
      target_audience: notification.target_audience,
      target_gender: notification.target_gender,
      action_type: notification.action_type,
      action_value: notification.action_value,
      scheduled_at: null,
      status: "draft",
    });
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteNotification.mutateAsync(deleteId);
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const handleViewStats = (notification: PromoNotification) => {
    setSelectedNotification(notification);
    setIsStatsDialogOpen(true);
  };

  const isFormValid = formData.title.trim() && formData.body.trim();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground uppercase">
            Notificaciones
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las notificaciones push promocionales
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Notificación
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="draft">Borradores</SelectItem>
            <SelectItem value="scheduled">Programadas</SelectItem>
            <SelectItem value="sent">Enviadas</SelectItem>
            <SelectItem value="failed">Fallidas</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border-2 border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>TÍTULO</TableHead>
              <TableHead>ESTADO</TableHead>
              <TableHead>AUDIENCIA</TableHead>
              <TableHead>ENVIADAS</TableHead>
              <TableHead>FECHA</TableHead>
              <TableHead className="text-right">ACCIONES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredNotifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No hay notificaciones
                </TableCell>
              </TableRow>
            ) : (
              filteredNotifications.map((notification) => {
                const statusConfig = STATUS_CONFIG[notification.status] || STATUS_CONFIG.draft;
                return (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {notification.body}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig.variant} className={statusConfig.className}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {AUDIENCE_LABELS[notification.target_audience] || notification.target_audience}
                        {notification.target_gender && (
                          <span className="text-muted-foreground ml-1">
                            ({GENDER_LABELS[notification.target_gender] || notification.target_gender})
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {notification.status === "sent" ? (
                        <button
                          onClick={() => handleViewStats(notification)}
                          className="text-sm hover:underline text-info"
                        >
                          {notification.successful_sends || 0} / {notification.total_recipients || 0}
                        </button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {notification.sent_at
                          ? format(new Date(notification.sent_at), "dd MMM yyyy HH:mm", { locale: es })
                          : notification.scheduled_at
                          ? format(new Date(notification.scheduled_at), "dd MMM yyyy HH:mm", { locale: es })
                          : format(new Date(notification.created_at!), "dd MMM yyyy", { locale: es })}
                      </div>
                      {notification.scheduled_at && notification.status === "scheduled" && (
                        <div className="text-xs text-warning flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Programada
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {notification.status === "draft" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenDialog(notification)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-success hover:text-success"
                              onClick={async () => {
                                await updateNotification.mutateAsync({ id: notification.id, status: "sending" });
                                await sendNotification.mutateAsync(notification.id);
                              }}
                              title="Enviar ahora"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {notification.status === "scheduled" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleCancelScheduled(notification.id)}
                            title="Cancelar"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDuplicate(notification)}
                          title="Duplicar"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(notification.id)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingNotification ? "Editar Notificación" : "Nueva Notificación"}
            </DialogTitle>
            <DialogDescription>
              Configura los detalles de la notificación push
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value.slice(0, 50) })}
                placeholder="Título de la notificación"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.title.length}/50
              </p>
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label htmlFor="body">Mensaje *</Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value.slice(0, 200) })}
                placeholder="Cuerpo del mensaje"
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.body.length}/200
              </p>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image_url">URL de imagen (opcional)</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {formData.image_url && (
                <div className="mt-2">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="h-20 w-auto rounded border-2 border-border object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              )}
            </div>

            {/* Audience & Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Audiencia objetivo</Label>
                <Select
                  value={formData.target_audience}
                  onValueChange={(value) => setFormData({ ...formData, target_audience: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los usuarios</SelectItem>
                    <SelectItem value="registered">Solo registrados</SelectItem>
                    <SelectItem value="guests">Solo invitados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Género (opcional)</Label>
                <Select
                  value={formData.target_gender}
                  onValueChange={(value) => setFormData({ ...formData, target_gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_genders">Todos</SelectItem>
                    <SelectItem value="mujer">Mujer</SelectItem>
                    <SelectItem value="hombre">Hombre</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Type */}
            <div className="space-y-2">
              <Label>Acción al tap</Label>
              <Select
                value={formData.action_type}
                onValueChange={(value) => setFormData({ ...formData, action_type: value, action_value: "" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Ir a inicio</SelectItem>
                  <SelectItem value="category">Ir a categoría</SelectItem>
                  <SelectItem value="product">Ir a producto</SelectItem>
                  <SelectItem value="url">Abrir URL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Value - conditional */}
            {formData.action_type === "category" && (
              <div className="space-y-2">
                <Label>Seleccionar categoría</Label>
                <Select
                  value={formData.action_value}
                  onValueChange={(value) => setFormData({ ...formData, action_value: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.action_type === "product" && (
              <div className="space-y-2">
                <Label>ID del producto</Label>
                <Input
                  value={formData.action_value}
                  onChange={(e) => setFormData({ ...formData, action_value: e.target.value })}
                  placeholder="UUID del producto"
                />
              </div>
            )}

            {formData.action_type === "url" && (
              <div className="space-y-2">
                <Label>URL externa</Label>
                <Input
                  value={formData.action_value}
                  onChange={(e) => setFormData({ ...formData, action_value: e.target.value })}
                  placeholder="https://ejemplo.com"
                />
              </div>
            )}

            {/* Schedule Toggle */}
            <div className="flex items-center justify-between rounded-lg border-2 border-border p-4">
              <div className="space-y-0.5">
                <Label>Programar envío</Label>
                <p className="text-xs text-muted-foreground">
                  Programa la notificación para enviarla después
                </p>
              </div>
              <Switch
                checked={formData.isScheduled}
                onCheckedChange={(checked) => setFormData({ ...formData, isScheduled: checked })}
              />
            </div>

            {formData.isScheduled && (
              <div className="space-y-2">
                <Label>Fecha y hora de envío</Label>
                <Input
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={!isFormValid || createNotification.isPending || updateNotification.isPending}
            >
              Guardar borrador
            </Button>
            {formData.isScheduled ? (
              <Button
                onClick={handleSchedule}
                disabled={!isFormValid || !formData.scheduled_at || createNotification.isPending || updateNotification.isPending}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Programar
              </Button>
            ) : (
              <Button
                onClick={handleSendNow}
                disabled={!isFormValid || createNotification.isPending || sendNotification.isPending}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Enviar ahora
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar notificación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La notificación será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stats Dialog */}
      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Estadísticas de envío</DialogTitle>
            <DialogDescription>{selectedNotification?.title}</DialogDescription>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{selectedNotification.total_recipients || 0}</div>
                    <p className="text-xs text-muted-foreground">Total destinatarios</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-success">{selectedNotification.successful_sends || 0}</div>
                    <p className="text-xs text-muted-foreground">Envíos exitosos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-destructive">{selectedNotification.failed_sends || 0}</div>
                    <p className="text-xs text-muted-foreground">Envíos fallidos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">
                      {selectedNotification.total_recipients
                        ? Math.round(((selectedNotification.successful_sends || 0) / selectedNotification.total_recipients) * 100)
                        : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">Tasa de éxito</p>
                  </CardContent>
                </Card>
              </div>

              {selectedNotification.sent_at && (
                <p className="text-sm text-muted-foreground text-center">
                  Enviada el {format(new Date(selectedNotification.sent_at), "dd MMMM yyyy 'a las' HH:mm", { locale: es })}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatsDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
