import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  minimum_purchase: number | null;
  maximum_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  applicable_to: string | null;
  applicable_category_ids: string[] | null;
  applicable_product_ids: string[] | null;
  uses_per_customer: number | null;
  created_at: string;
  updated_at: string;
}

export interface CouponFormData {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  minimum_purchase?: number;
  maximum_uses?: number;
  expires_at?: string;
  is_active: boolean;
  applicable_to?: string;
  uses_per_customer?: number;
}

export function useCoupons(filters?: {
  status?: "active" | "inactive" | "all";
  type?: string;
  expired?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: ["coupons", filters],
    queryFn: async () => {
      let query = supabase.from("coupons").select("*").order("created_at", { ascending: false });

      // Filtro por estado
      if (filters?.status === "active") {
        query = query.eq("is_active", true);
      } else if (filters?.status === "inactive") {
        query = query.eq("is_active", false);
      }

      // Filtro por tipo de descuento
      if (filters?.type) {
        query = query.eq("discount_type", filters.type);
      }

      // Búsqueda por código
      if (filters?.search) {
        query = query.ilike("code", `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filtro de expirados en el cliente
      if (filters?.expired !== undefined) {
        const now = new Date();
        return data?.filter((coupon) => {
          if (!coupon.expires_at) return !filters.expired;
          const expiresAt = new Date(coupon.expires_at);
          return filters.expired ? expiresAt < now : expiresAt >= now;
        });
      }

      return data as Coupon[];
    },
  });
}

export function useCouponStats() {
  return useQuery({
    queryKey: ["coupon-stats"],
    queryFn: async () => {
      const { data: coupons, error } = await supabase
        .from("coupons")
        .select("*");

      if (error) throw error;

      const now = new Date();
      const activeCoupons = coupons?.filter((c) => c.is_active) || [];
      const expiringSoon = coupons?.filter((c) => {
        if (!c.expires_at) return false;
        const expiresAt = new Date(c.expires_at);
        const daysUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
      }) || [];

      const mostUsed = [...(coupons || [])]
        .sort((a, b) => (b.current_uses || 0) - (a.current_uses || 0))
        .slice(0, 5);

      const totalUses = coupons?.reduce((sum, c) => sum + (c.current_uses || 0), 0) || 0;

      return {
        totalActive: activeCoupons.length,
        totalCoupons: coupons?.length || 0,
        expiringSoon: expiringSoon.length,
        mostUsed,
        totalUses,
      };
    },
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CouponFormData) => {
      // Convertir código a mayúsculas
      const couponData = {
        ...data,
        code: data.code.toUpperCase(),
        current_uses: 0,
      };

      const { data: newCoupon, error } = await supabase
        .from("coupons")
        .insert(couponData)
        .select()
        .single();

      if (error) throw error;
      return newCoupon;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      queryClient.invalidateQueries({ queryKey: ["coupon-stats"] });
      toast.success("Cupón creado exitosamente");
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast.error("Ya existe un cupón con ese código");
      } else {
        toast.error("Error al crear el cupón");
      }
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CouponFormData> }) => {
      const { data: updatedCoupon, error } = await supabase
        .from("coupons")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updatedCoupon;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      queryClient.invalidateQueries({ queryKey: ["coupon-stats"] });
      toast.success("Cupón actualizado exitosamente");
    },
    onError: () => {
      toast.error("Error al actualizar el cupón");
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      queryClient.invalidateQueries({ queryKey: ["coupon-stats"] });
      toast.success("Cupón eliminado exitosamente");
    },
    onError: () => {
      toast.error("Error al eliminar el cupón");
    },
  });
}

export function useToggleCouponStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("coupons")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      queryClient.invalidateQueries({ queryKey: ["coupon-stats"] });
    },
    onError: () => {
      toast.error("Error al cambiar el estado del cupón");
    },
  });
}
