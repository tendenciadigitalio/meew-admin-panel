import { useState } from "react";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OrderWithItems } from "@/types/database";

const statusColors: Record<string, string> = {
  pending: "bg-warning text-warning-foreground",
  processing: "bg-blue-600 text-white",
  shipped: "bg-purple-600 text-white",
  delivered: "bg-success text-success-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

export default function Orders() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [newStatus, setNewStatus] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  const handleStatusUpdate = async () => {
    if (selectedOrder && newStatus) {
      await updateStatus.mutateAsync({
        id: selectedOrder.id,
        status: newStatus,
      });
      setSelectedOrder(null);
      setNewStatus("");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold uppercase tracking-tight">Pedidos</h1>
        <p className="mt-2 text-muted-foreground">
          Gestiona todos los pedidos del marketplace
        </p>
      </div>

      <div className="rounded-sm border-2">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2">
              <TableHead className="font-bold uppercase">ID</TableHead>
              <TableHead className="font-bold uppercase">Cliente</TableHead>
              <TableHead className="font-bold uppercase">Total</TableHead>
              <TableHead className="font-bold uppercase">Estado</TableHead>
              <TableHead className="font-bold uppercase">Fecha</TableHead>
              <TableHead className="font-bold uppercase text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : orders?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No hay pedidos
                </TableCell>
              </TableRow>
            ) : (
              orders?.map((order) => (
                <TableRow key={order.id} className="border-b">
                  <TableCell className="font-mono text-xs">
                    {order.order_number}
                  </TableCell>
                  <TableCell>{order.user?.email || "N/A"}</TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(Number(order.total))}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[order.status || "pending"]} uppercase`}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at!).toLocaleDateString("es-ES")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      className="uppercase"
                    >
                      Ver Detalle
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl border-2">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold uppercase">
              Detalle del Pedido
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="uppercase text-muted-foreground">Order Number</Label>
                  <p className="font-mono font-bold">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <Label className="uppercase text-muted-foreground">Cliente</Label>
                  <p className="font-medium">{selectedOrder.user?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.user?.email}</p>
                </div>
              </div>

              <div>
                <Label className="uppercase text-muted-foreground">Productos</Label>
                <div className="mt-2 space-y-2">
                  {selectedOrder.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold">
                        {formatCurrency(Number(item.subtotal))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(Number(selectedOrder.subtotal))}
                  </span>
                </div>
                {selectedOrder.shipping_amount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío:</span>
                    <span className="font-medium">
                      {formatCurrency(Number(selectedOrder.shipping_amount))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold uppercase">Total:</span>
                  <span className="text-xl font-bold">
                    {formatCurrency(Number(selectedOrder.total))}
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="status" className="uppercase">Actualizar Estado</Label>
                <div className="mt-2 flex gap-2">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleStatusUpdate} className="uppercase">
                    Actualizar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
