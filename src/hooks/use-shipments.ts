import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ShipmentStatus = 'pending' | 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'problem';
export type ShippingMethod = 'express' | 'standard' | 'free';
export type Carrier = 'jt_express' | 'estafeta' | 'dhl' | 'fedex' | null;
export type ProblemType = 'not_delivered' | 'wrong_address' | 'returned' | 'lost' | 'refund' | null;

export interface ShipmentWithOrder {
  id: string;
  order_id: string | null;
  shipping_method: string;
  shipping_cost: number;
  carrier: string | null;
  tracking_number: string | null;
  label_url: string | null;
  status: string;
  problem_type: string | null;
  problem_notes: string | null;
  estimated_delivery: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  warehouse: string | null;
  created_at: string | null;
  updated_at: string | null;
  order: {
    id: string;
    order_number: string;
    total: number;
    status: string | null;
    shipping_full_name: string;
    shipping_phone: string;
    shipping_address_line_1: string;
    shipping_address_line_2: string | null;
    shipping_city: string;
    shipping_state: string;
    shipping_postal_code: string;
    shipping_country: string;
    subtotal: number;
    discount_amount: number | null;
    shipping_amount: number | null;
    user_id: string;
  } | null;
}

export interface ShipmentEvent {
  id: string;
  shipment_id: string | null;
  status: string;
  description: string | null;
  location: string | null;
  created_at: string | null;
}

export interface ShipmentStats {
  pending: number;
  in_process: number;
  delivered_today: number;
  problems: number;
}

// Helper to get automatic description for status change
export function getStatusDescription(status: string, problemType?: string | null): string {
  const descriptions: Record<string, string> = {
    pending: "Pedido confirmado",
    processing: "Preparando envío",
    shipped: "Entregado a paquetería",
    in_transit: "En camino",
    out_for_delivery: "En reparto",
    delivered: "Entregado",
    cancelled: "Envío cancelado",
  };
  
  if (status === 'problem' && problemType) {
    const problemDescriptions: Record<string, string> = {
      not_delivered: "No se pudo entregar",
      wrong_address: "Dirección incorrecta",
      returned: "Devuelto a remitente",
      lost: "Paquete perdido",
      refund: "Devolución/Reembolso",
    };
    return `Problema reportado: ${problemDescriptions[problemType] || problemType}`;
  }
  
  return descriptions[status] || status;
}

export function useShipments() {
  return useQuery({
    queryKey: ["shipments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipments")
        .select(`
          *,
          order:orders(
            id,
            order_number,
            total,
            status,
            shipping_full_name,
            shipping_phone,
            shipping_address_line_1,
            shipping_address_line_2,
            shipping_city,
            shipping_state,
            shipping_postal_code,
            shipping_country,
            subtotal,
            discount_amount,
            shipping_amount,
            user_id
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as ShipmentWithOrder[];
    },
  });
}

export function useShipmentStats() {
  return useQuery({
    queryKey: ["shipment-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("shipments")
        .select("status, delivered_at");

      if (error) throw error;

      const stats: ShipmentStats = {
        pending: 0,
        in_process: 0,
        delivered_today: 0,
        problems: 0,
      };

      (data || []).forEach((shipment) => {
        if (shipment.status === 'pending') {
          stats.pending++;
        } else if (['processing', 'shipped', 'in_transit', 'out_for_delivery'].includes(shipment.status)) {
          stats.in_process++;
        } else if (shipment.status === 'delivered' && shipment.delivered_at?.startsWith(today)) {
          stats.delivered_today++;
        } else if (shipment.status === 'problem') {
          stats.problems++;
        }
      });

      return stats;
    },
  });
}

export function useShipmentEvents(shipmentId: string | null) {
  return useQuery({
    queryKey: ["shipment-events", shipmentId],
    queryFn: async () => {
      if (!shipmentId) return [];
      
      const { data, error } = await supabase
        .from("shipment_events")
        .select("*")
        .eq("shipment_id", shipmentId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) as ShipmentEvent[];
    },
    enabled: !!shipmentId,
  });
}

export function useUpdateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
      previousStatus,
    }: {
      id: string;
      updates: {
        carrier?: string | null;
        tracking_number?: string | null;
        status?: string;
        estimated_delivery?: string | null;
        problem_type?: string | null;
        problem_notes?: string | null;
      };
      previousStatus?: string;
    }) => {
      // Prepare update data
      const updateData: Record<string, any> = { ...updates };
      
      // Set timestamps based on status
      if (updates.status === 'shipped' && previousStatus !== 'shipped') {
        updateData.shipped_at = new Date().toISOString();
      }
      if (updates.status === 'delivered' && previousStatus !== 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      // Update shipment
      const { error: updateError } = await supabase
        .from("shipments")
        .update(updateData)
        .eq("id", id);

      if (updateError) throw updateError;

      // If status changed, create event
      if (updates.status && updates.status !== previousStatus) {
        const { error: eventError } = await supabase
          .from("shipment_events")
          .insert({
            shipment_id: id,
            status: updates.status,
            description: getStatusDescription(updates.status, updates.problem_type),
          });

        if (eventError) throw eventError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["shipment-stats"] });
      queryClient.invalidateQueries({ queryKey: ["shipment-events"] });
      toast.success("Envío actualizado correctamente");
    },
    onError: (error: any) => {
      toast.error(`Error al actualizar envío: ${error.message}`);
    },
  });
}

// Free Shipping Dates hooks
export interface FreeShippingDate {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  min_amount: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useFreeShippingDates() {
  return useQuery({
    queryKey: ["free-shipping-dates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("free_shipping_dates")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      return (data || []) as FreeShippingDate[];
    },
  });
}

export function useCreateFreeShippingDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<FreeShippingDate, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from("free_shipping_dates")
        .insert(data);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["free-shipping-dates"] });
      toast.success("Fecha especial creada");
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useUpdateFreeShippingDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FreeShippingDate> }) => {
      const { error } = await supabase
        .from("free_shipping_dates")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["free-shipping-dates"] });
      toast.success("Fecha especial actualizada");
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useDeleteFreeShippingDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("free_shipping_dates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["free-shipping-dates"] });
      toast.success("Fecha especial eliminada");
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}
