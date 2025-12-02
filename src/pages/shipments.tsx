import { useState, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Clock,
  Truck,
  CheckCircle,
  AlertTriangle,
  Search,
  Calendar,
  X,
  Package,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { StatsCard } from "@/components/shared/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useShipments,
  useShipmentStats,
  useShipmentEvents,
  useUpdateShipment,
  useFreeShippingDates,
  useCreateFreeShippingDate,
  useUpdateFreeShippingDate,
  useDeleteFreeShippingDate,
  ShipmentWithOrder,
  FreeShippingDate,
} from "@/hooks/use-shipments";

// Constants
const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline"; color: string }> = {
  pending: { label: "Pendiente", variant: "warning", color: "bg-yellow-500" },
  processing: { label: "Procesando", variant: "warning", color: "bg-orange-500" },
  shipped: { label: "Enviado", variant: "default", color: "bg-blue-500" },
  in_transit: { label: "En camino", variant: "default", color: "bg-blue-500" },
  out_for_delivery: { label: "En reparto", variant: "secondary", color: "bg-purple-500" },
  delivered: { label: "Entregado", variant: "success", color: "bg-green-500" },
  cancelled: { label: "Cancelado", variant: "outline", color: "bg-gray-500" },
  problem: { label: "Problema", variant: "destructive", color: "bg-red-500" },
};

const METHOD_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "success" }> = {
  express: { label: "EXPRESS", variant: "default" },
  standard: { label: "ESTÁNDAR", variant: "secondary" },
  free: { label: "GRATIS", variant: "success" },
};

const CARRIER_NAMES: Record<string, string> = {
  jt_express: "J&T Express",
  estafeta: "Estafeta",
  dhl: "DHL",
  fedex: "FedEx",
};

const PROBLEM_TYPES: Record<string, string> = {
  not_delivered: "No se pudo entregar",
  wrong_address: "Dirección incorrecta",
  returned: "Devuelto a remitente",
  lost: "Paquete perdido",
  refund: "Devolución/Reembolso",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

export default function Shipments() {
  const [activeTab, setActiveTab] = useState("shipments");
  const [selectedShipment, setSelectedShipment] = useState<ShipmentWithOrder | null>(null);
  const [editingFreeDate, setEditingFreeDate] = useState<FreeShippingDate | null>(null);
  const [isFreeDateDialogOpen, setIsFreeDateDialogOpen] = useState(false);
  const [deleteFreeDateId, setDeleteFreeDateId] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [carrierFilter, setCarrierFilter] = useState<string>("all");
  const [problemFilter, setProblemFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Data hooks
  const { data: shipments, isLoading: shipmentsLoading } = useShipments();
  const { data: stats, isLoading: statsLoading } = useShipmentStats();
  const { data: freeShippingDates, isLoading: freeDatesLoading } = useFreeShippingDates();

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    if (!shipments) return [];
    
    return shipments.filter((shipment) => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesOrder = shipment.order?.order_number?.toLowerCase().includes(search);
        const matchesName = shipment.order?.shipping_full_name?.toLowerCase().includes(search);
        const matchesTracking = shipment.tracking_number?.toLowerCase().includes(search);
        if (!matchesOrder && !matchesName && !matchesTracking) return false;
      }

      // Method filter
      if (methodFilter !== "all" && shipment.shipping_method !== methodFilter) return false;

      // Status filter
      if (statusFilter !== "all" && shipment.status !== statusFilter) return false;

      // Carrier filter
      if (carrierFilter !== "all") {
        if (carrierFilter === "null" && shipment.carrier !== null) return false;
        if (carrierFilter !== "null" && shipment.carrier !== carrierFilter) return false;
      }

      // Problem filter
      if (problemFilter !== "all") {
        if (problemFilter === "none" && shipment.problem_type !== null) return false;
        if (problemFilter !== "none" && shipment.problem_type !== problemFilter) return false;
      }

      // Date range filter
      if (dateRange.from && shipment.created_at) {
        const createdAt = new Date(shipment.created_at);
        if (createdAt < dateRange.from) return false;
      }
      if (dateRange.to && shipment.created_at) {
        const createdAt = new Date(shipment.created_at);
        const endOfDay = new Date(dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);
        if (createdAt > endOfDay) return false;
      }

      return true;
    });
  }, [shipments, searchTerm, methodFilter, statusFilter, carrierFilter, problemFilter, dateRange]);

  const applyStatusFilter = (status: string) => {
    setStatusFilter(status);
    setActiveTab("shipments");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setMethodFilter("all");
    setStatusFilter("all");
    setCarrierFilter("all");
    setProblemFilter("all");
    setDateRange({ from: undefined, to: undefined });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground">
          Gestión de Envíos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Administra los envíos y fechas de envío gratis
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => applyStatusFilter("pending")} className="cursor-pointer">
          <StatsCard
            title="Pendientes"
            value={statsLoading ? "..." : stats?.pending || 0}
            icon={Clock}
            description="Esperando procesamiento"
          />
        </div>
        <div onClick={() => setStatusFilter("all")} className="cursor-pointer">
          <StatsCard
            title="En Proceso"
            value={statsLoading ? "..." : stats?.in_process || 0}
            icon={Truck}
            description="En camino al cliente"
          />
        </div>
        <div onClick={() => applyStatusFilter("delivered")} className="cursor-pointer">
          <StatsCard
            title="Entregados Hoy"
            value={statsLoading ? "..." : stats?.delivered_today || 0}
            icon={CheckCircle}
            description="Completados hoy"
          />
        </div>
        <div onClick={() => applyStatusFilter("problem")} className="cursor-pointer">
          <StatsCard
            title="Con Problemas"
            value={statsLoading ? "..." : stats?.problems || 0}
            icon={AlertTriangle}
            description="Requieren atención"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="shipments">Envíos</TabsTrigger>
          <TabsTrigger value="free-dates">Fechas Especiales</TabsTrigger>
        </TabsList>

        {/* Shipments Tab */}
        <TabsContent value="shipments" className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 p-4 bg-muted/30 rounded-lg border-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pedido, cliente, tracking..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-2"
              />
            </div>

            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="border-2">
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los métodos</SelectItem>
                <SelectItem value="express">Express</SelectItem>
                <SelectItem value="standard">Estándar</SelectItem>
                <SelectItem value="free">Gratis</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-2">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="processing">Procesando</SelectItem>
                <SelectItem value="shipped">Enviado</SelectItem>
                <SelectItem value="in_transit">En camino</SelectItem>
                <SelectItem value="out_for_delivery">En reparto</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="problem">Problema</SelectItem>
              </SelectContent>
            </Select>

            <Select value={carrierFilter} onValueChange={setCarrierFilter}>
              <SelectTrigger className="border-2">
                <SelectValue placeholder="Carrier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los carriers</SelectItem>
                <SelectItem value="jt_express">J&T Express</SelectItem>
                <SelectItem value="estafeta">Estafeta</SelectItem>
                <SelectItem value="dhl">DHL</SelectItem>
                <SelectItem value="fedex">FedEx</SelectItem>
                <SelectItem value="null">Sin asignar</SelectItem>
              </SelectContent>
            </Select>

            <Select value={problemFilter} onValueChange={setProblemFilter}>
              <SelectTrigger className="border-2">
                <SelectValue placeholder="Problemas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="none">Sin problemas</SelectItem>
                <SelectItem value="not_delivered">No entregado</SelectItem>
                <SelectItem value="wrong_address">Dirección incorrecta</SelectItem>
                <SelectItem value="returned">Devuelto</SelectItem>
                <SelectItem value="lost">Perdido</SelectItem>
                <SelectItem value="refund">Reembolso</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-2 justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      `${format(dateRange.from, "dd/MM")} - ${format(dateRange.to, "dd/MM")}`
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy")
                    )
                  ) : (
                    "Fecha"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  locale={es}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
              <X className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
          </div>

          {/* Shipments Table */}
          <div className="border-2 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2">
                  <TableHead className="uppercase text-xs">Pedido</TableHead>
                  <TableHead className="uppercase text-xs">Cliente</TableHead>
                  <TableHead className="uppercase text-xs">Fecha</TableHead>
                  <TableHead className="uppercase text-xs">Método</TableHead>
                  <TableHead className="uppercase text-xs">Costo</TableHead>
                  <TableHead className="uppercase text-xs">Carrier</TableHead>
                  <TableHead className="uppercase text-xs">Tracking</TableHead>
                  <TableHead className="uppercase text-xs">Estado</TableHead>
                  <TableHead className="uppercase text-xs text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipmentsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredShipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      No se encontraron envíos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredShipments.map((shipment) => (
                    <TableRow key={shipment.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">
                        {shipment.order?.order_number || "—"}
                      </TableCell>
                      <TableCell>{shipment.order?.shipping_full_name || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {shipment.created_at
                          ? format(new Date(shipment.created_at), "dd/MM/yyyy", { locale: es })
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={METHOD_CONFIG[shipment.shipping_method]?.variant || "secondary"}>
                          {METHOD_CONFIG[shipment.shipping_method]?.label || shipment.shipping_method}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(shipment.shipping_cost)}</TableCell>
                      <TableCell>
                        {shipment.carrier ? CARRIER_NAMES[shipment.carrier] || shipment.carrier : (
                          <span className="text-muted-foreground">Sin asignar</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {shipment.tracking_number || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_CONFIG[shipment.status]?.variant || "secondary"}>
                          {STATUS_CONFIG[shipment.status]?.label || shipment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedShipment(shipment)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Free Shipping Dates Tab */}
        <TabsContent value="free-dates" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingFreeDate(null); setIsFreeDateDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Fecha Especial
            </Button>
          </div>

          <div className="border-2 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2">
                  <TableHead className="uppercase text-xs">Nombre</TableHead>
                  <TableHead className="uppercase text-xs">Descripción</TableHead>
                  <TableHead className="uppercase text-xs">Fecha Inicio</TableHead>
                  <TableHead className="uppercase text-xs">Fecha Fin</TableHead>
                  <TableHead className="uppercase text-xs">Monto Mínimo</TableHead>
                  <TableHead className="uppercase text-xs">Estado</TableHead>
                  <TableHead className="uppercase text-xs text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {freeDatesLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : !freeShippingDates?.length ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      No hay fechas especiales configuradas
                    </TableCell>
                  </TableRow>
                ) : (
                  freeShippingDates.map((freeDate) => {
                    const today = new Date();
                    const startDate = new Date(freeDate.start_date);
                    const endDate = new Date(freeDate.end_date);
                    let statusBadge: { label: string; variant: "success" | "warning" | "secondary" } = { label: "INACTIVA", variant: "secondary" };
                    
                    if (freeDate.is_active) {
                      if (today >= startDate && today <= endDate) {
                        statusBadge = { label: "ACTIVA", variant: "success" };
                      } else if (today < startDate) {
                        statusBadge = { label: "PROGRAMADA", variant: "warning" };
                      } else {
                        statusBadge = { label: "EXPIRADA", variant: "secondary" };
                      }
                    }

                    return (
                      <TableRow key={freeDate.id}>
                        <TableCell className="font-medium">{freeDate.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                          {freeDate.description || "—"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(freeDate.start_date), "dd/MM/yyyy", { locale: es })}
                        </TableCell>
                        <TableCell>
                          {format(new Date(freeDate.end_date), "dd/MM/yyyy", { locale: es })}
                        </TableCell>
                        <TableCell>
                          {freeDate.min_amount && freeDate.min_amount > 0
                            ? formatCurrency(freeDate.min_amount)
                            : "Sin mínimo"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setEditingFreeDate(freeDate); setIsFreeDateDialogOpen(true); }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteFreeDateId(freeDate.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Shipment Edit Modal */}
      {selectedShipment && (
        <ShipmentEditModal
          shipment={selectedShipment}
          onClose={() => setSelectedShipment(null)}
        />
      )}

      {/* Free Date Dialog */}
      <FreeDateDialog
        open={isFreeDateDialogOpen}
        onOpenChange={setIsFreeDateDialogOpen}
        editingDate={editingFreeDate}
      />

      {/* Delete Confirmation */}
      <DeleteFreeDateAlert
        open={!!deleteFreeDateId}
        onOpenChange={(open) => !open && setDeleteFreeDateId(null)}
        dateId={deleteFreeDateId}
      />
    </div>
  );
}

// Shipment Edit Modal Component
function ShipmentEditModal({
  shipment,
  onClose,
}: {
  shipment: ShipmentWithOrder;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    carrier: shipment.carrier || "",
    tracking_number: shipment.tracking_number || "",
    status: shipment.status,
    estimated_delivery: shipment.estimated_delivery || "",
    problem_type: shipment.problem_type || "",
    problem_notes: shipment.problem_notes || "",
  });

  const { data: events, isLoading: eventsLoading } = useShipmentEvents(shipment.id);
  const updateShipment = useUpdateShipment();

  const handleSubmit = async () => {
    await updateShipment.mutateAsync({
      id: shipment.id,
      updates: {
        carrier: formData.carrier || null,
        tracking_number: formData.tracking_number || null,
        status: formData.status,
        estimated_delivery: formData.estimated_delivery || null,
        problem_type: formData.status === 'problem' ? formData.problem_type || null : null,
        problem_notes: formData.status === 'problem' ? formData.problem_notes || null : null,
      },
      previousStatus: shipment.status,
    });
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-wide">
            Editar Envío - {shipment.order?.order_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info (Read-only) */}
          <div className="p-4 bg-muted/30 rounded-lg border-2 space-y-3">
            <h3 className="font-semibold uppercase text-xs tracking-wide text-muted-foreground">
              Información del Pedido
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Cliente:</span>{" "}
                <span className="font-medium">{shipment.order?.shipping_full_name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Teléfono:</span>{" "}
                <span className="font-medium">{shipment.order?.shipping_phone}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Dirección:</span>{" "}
                <span className="font-medium">
                  {shipment.order?.shipping_address_line_1}
                  {shipment.order?.shipping_address_line_2 && `, ${shipment.order.shipping_address_line_2}`}
                  {`, ${shipment.order?.shipping_city}, ${shipment.order?.shipping_state} ${shipment.order?.shipping_postal_code}`}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Total:</span>{" "}
                <span className="font-medium">{formatCurrency(shipment.order?.total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Shipment Data (Editable) */}
          <div className="space-y-4">
            <h3 className="font-semibold uppercase text-xs tracking-wide text-muted-foreground">
              Datos del Envío
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="uppercase text-xs">Carrier</Label>
                <Select
                  value={formData.carrier}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, carrier: v }))}
                >
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="Seleccionar carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jt_express">J&T Express</SelectItem>
                    <SelectItem value="estafeta">Estafeta</SelectItem>
                    <SelectItem value="dhl">DHL</SelectItem>
                    <SelectItem value="fedex">FedEx</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="uppercase text-xs">Tracking Number</Label>
                <Input
                  value={formData.tracking_number}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tracking_number: e.target.value }))}
                  className="border-2 font-mono"
                  placeholder="Número de rastreo"
                />
              </div>

              <div className="space-y-2">
                <Label className="uppercase text-xs">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, status: v }))}
                >
                  <SelectTrigger className="border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="uppercase text-xs">Fecha Estimada de Entrega</Label>
                <Input
                  type="date"
                  value={formData.estimated_delivery}
                  onChange={(e) => setFormData((prev) => ({ ...prev, estimated_delivery: e.target.value }))}
                  className="border-2"
                />
              </div>
            </div>
          </div>

          {/* Problem Section */}
          {formData.status === "problem" && (
            <div className="space-y-4 p-4 bg-destructive/5 rounded-lg border-2 border-destructive/20">
              <h3 className="font-semibold uppercase text-xs tracking-wide text-destructive">
                Problema de Logística
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="uppercase text-xs">Tipo de Problema</Label>
                  <Select
                    value={formData.problem_type}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, problem_type: v }))}
                  >
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROBLEM_TYPES).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-xs">Notas</Label>
                  <Textarea
                    value={formData.problem_notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, problem_notes: e.target.value }))}
                    className="border-2"
                    placeholder="Detalles del problema..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold uppercase text-xs tracking-wide text-muted-foreground">
              Timeline de Eventos
            </h3>
            <div className="border-2 rounded-lg p-4 max-h-[200px] overflow-y-auto">
              {eventsLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : !events?.length ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  Sin eventos registrados
                </p>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 text-sm">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-1.5",
                        STATUS_CONFIG[event.status]?.color || "bg-gray-400"
                      )} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {STATUS_CONFIG[event.status]?.label || event.status}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {event.created_at
                              ? format(new Date(event.created_at), "dd/MM/yyyy HH:mm", { locale: es })
                              : ""}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-muted-foreground">{event.description}</p>
                        )}
                        {event.location && (
                          <p className="text-muted-foreground text-xs">{event.location}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={updateShipment.isPending}>
              {updateShipment.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Free Date Dialog Component
function FreeDateDialog({
  open,
  onOpenChange,
  editingDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingDate: FreeShippingDate | null;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    min_amount: 0,
    is_active: true,
  });

  const createFreeDate = useCreateFreeShippingDate();
  const updateFreeDate = useUpdateFreeShippingDate();

  // Reset form when dialog opens/closes or editing changes
  useState(() => {
    if (editingDate) {
      setFormData({
        name: editingDate.name,
        description: editingDate.description || "",
        start_date: editingDate.start_date,
        end_date: editingDate.end_date,
        min_amount: editingDate.min_amount || 0,
        is_active: editingDate.is_active ?? true,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        min_amount: 0,
        is_active: true,
      });
    }
  });

  // Update form when editingDate changes
  useMemo(() => {
    if (open) {
      if (editingDate) {
        setFormData({
          name: editingDate.name,
          description: editingDate.description || "",
          start_date: editingDate.start_date,
          end_date: editingDate.end_date,
          min_amount: editingDate.min_amount || 0,
          is_active: editingDate.is_active ?? true,
        });
      } else {
        setFormData({
          name: "",
          description: "",
          start_date: "",
          end_date: "",
          min_amount: 0,
          is_active: true,
        });
      }
    }
  }, [open, editingDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.start_date || !formData.end_date) {
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      return;
    }

    if (editingDate) {
      await updateFreeDate.mutateAsync({
        id: editingDate.id,
        updates: formData,
      });
    } else {
      await createFreeDate.mutateAsync(formData);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="uppercase tracking-wide">
            {editingDate ? "Editar" : "Agregar"} Fecha Especial
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="uppercase text-xs">Nombre *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="border-2"
              placeholder="Ej: Buen Fin 2025"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="uppercase text-xs">Descripción</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="border-2"
              placeholder="Descripción opcional..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="uppercase text-xs">Fecha Inicio *</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                className="border-2"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase text-xs">Fecha Fin *</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                className="border-2"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="uppercase text-xs">Monto Mínimo (MXN)</Label>
            <Input
              type="number"
              min={0}
              value={formData.min_amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, min_amount: parseFloat(e.target.value) || 0 }))}
              className="border-2"
              placeholder="0 = Sin mínimo"
            />
            <p className="text-xs text-muted-foreground">
              Deja en 0 para envío gratis sin monto mínimo
            </p>
          </div>

          <div className="flex items-center justify-between py-2">
            <Label className="uppercase text-xs">Activo</Label>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createFreeDate.isPending || updateFreeDate.isPending}>
              {editingDate ? "Guardar Cambios" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Delete Free Date Alert
function DeleteFreeDateAlert({
  open,
  onOpenChange,
  dateId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateId: string | null;
}) {
  const deleteFreeDate = useDeleteFreeShippingDate();

  const handleDelete = async () => {
    if (dateId) {
      await deleteFreeDate.mutateAsync(dateId);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar fecha especial?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. La fecha especial será eliminada permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
