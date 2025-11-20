import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PopUp {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  is_full_screen_image: boolean | null;
  cta_text: string | null;
  cta_type: string | null;
  cta_value: string | null;
  is_active: boolean | null;
  priority: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PopUpFormData {
  title?: string;
  description?: string;
  image_url?: string;
  is_full_screen_image: boolean;
  cta_text?: string;
  cta_type: "none" | "category" | "product" | "external_url";
  cta_value?: string;
  is_active: boolean;
  priority: number;
  start_date?: string;
  end_date?: string;
}

export function usePopUps(filters?: {
  status?: "active" | "inactive" | "all";
  ctaType?: string;
  validity?: "all" | "current" | "expired" | "future";
  search?: string;
}) {
  return useQuery({
    queryKey: ["pop-ups", filters],
    queryFn: async () => {
      let query = supabase
        .from("pop_ups")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      // Filtro por estado
      if (filters?.status === "active") {
        query = query.eq("is_active", true);
      } else if (filters?.status === "inactive") {
        query = query.eq("is_active", false);
      }

      // Filtro por tipo de CTA
      if (filters?.ctaType && filters.ctaType !== "all") {
        query = query.eq("cta_type", filters.ctaType);
      }

      // Búsqueda por título
      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filtro de vigencia en el cliente
      if (filters?.validity && filters.validity !== "all") {
        const now = new Date();
        return data?.filter((popup) => {
          const startDate = popup.start_date ? new Date(popup.start_date) : null;
          const endDate = popup.end_date ? new Date(popup.end_date) : null;

          if (filters.validity === "current") {
            const afterStart = !startDate || startDate <= now;
            const beforeEnd = !endDate || endDate >= now;
            return afterStart && beforeEnd;
          } else if (filters.validity === "expired") {
            return endDate && endDate < now;
          } else if (filters.validity === "future") {
            return startDate && startDate > now;
          }
          return true;
        });
      }

      return data as PopUp[];
    },
  });
}

export function usePopUpStats() {
  return useQuery({
    queryKey: ["pop-up-stats"],
    queryFn: async () => {
      const { data: popups, error } = await supabase.from("pop_ups").select("*");

      if (error) throw error;

      const now = new Date();
      const activePopups = popups?.filter((p) => p.is_active) || [];
      
      const scheduledPopups = popups?.filter((p) => {
        const startDate = p.start_date ? new Date(p.start_date) : null;
        return startDate && startDate > now;
      }) || [];

      const expiringSoon = popups?.filter((p) => {
        if (!p.end_date) return false;
        const endDate = new Date(p.end_date);
        const daysUntilExpiry = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
      }) || [];

      const highestPriority = [...(popups || [])]
        .filter((p) => p.is_active)
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];

      return {
        totalActive: activePopups.length,
        totalScheduled: scheduledPopups.length,
        expiringSoon: expiringSoon.length,
        highestPriority: highestPriority || null,
      };
    },
  });
}

export function useCreatePopUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PopUpFormData) => {
      const { data: newPopUp, error } = await supabase
        .from("pop_ups")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return newPopUp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pop-ups"] });
      queryClient.invalidateQueries({ queryKey: ["pop-up-stats"] });
      toast.success("Popup creado exitosamente");
    },
    onError: () => {
      toast.error("Error al crear el popup");
    },
  });
}

export function useUpdatePopUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PopUpFormData> }) => {
      const { data: updatedPopUp, error } = await supabase
        .from("pop_ups")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updatedPopUp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pop-ups"] });
      queryClient.invalidateQueries({ queryKey: ["pop-up-stats"] });
      toast.success("Popup actualizado exitosamente");
    },
    onError: () => {
      toast.error("Error al actualizar el popup");
    },
  });
}

export function useDeletePopUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pop_ups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pop-ups"] });
      queryClient.invalidateQueries({ queryKey: ["pop-up-stats"] });
      toast.success("Popup eliminado exitosamente");
    },
    onError: () => {
      toast.error("Error al eliminar el popup");
    },
  });
}

export function useTogglePopUpStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("pop_ups")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pop-ups"] });
      queryClient.invalidateQueries({ queryKey: ["pop-up-stats"] });
    },
    onError: () => {
      toast.error("Error al cambiar el estado del popup");
    },
  });
}
