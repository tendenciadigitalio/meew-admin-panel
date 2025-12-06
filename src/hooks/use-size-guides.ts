import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SizeGuide {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  sizes: string[];
  measurements: Record<string, Record<string, string>>;
  unit: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  category?: { id: string; name: string } | null;
}

export interface SizeGuideFormData {
  category_id?: string | null;
  name: string;
  description?: string;
  sizes: string[];
  measurements: Record<string, Record<string, string>>;
  unit?: string;
  is_active?: boolean;
}

// Helper to get typed client for size_guides table
const getSizeGuidesTable = () => {
  return supabase.from("size_guides" as any);
};

export function useSizeGuides(categoryId?: string) {
  return useQuery({
    queryKey: ["size-guides", categoryId],
    queryFn: async () => {
      let query = getSizeGuidesTable()
        .select("*, category:categories(id, name)")
        .order("display_order", { ascending: true });

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as SizeGuide[];
    },
  });
}

export function useSizeGuide(id: string) {
  return useQuery({
    queryKey: ["size-guide", id],
    queryFn: async () => {
      const { data, error } = await getSizeGuidesTable()
        .select("*, category:categories(id, name)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as SizeGuide;
    },
    enabled: !!id,
  });
}

export function useCreateSizeGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SizeGuideFormData) => {
      const { error } = await getSizeGuidesTable().insert({
        ...data,
        sizes: JSON.stringify(data.sizes),
        measurements: JSON.stringify(data.measurements),
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["size-guides"] });
      toast.success("Guía de tallas creada correctamente");
    },
    onError: (error: Error) => {
      toast.error("Error al crear la guía de tallas: " + error.message);
    },
  });
}

export function useUpdateSizeGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SizeGuideFormData> }) => {
      const updateData: any = { ...data, updated_at: new Date().toISOString() };
      if (data.sizes) updateData.sizes = JSON.stringify(data.sizes);
      if (data.measurements) updateData.measurements = JSON.stringify(data.measurements);
      
      const { error } = await getSizeGuidesTable()
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["size-guides"] });
      toast.success("Guía de tallas actualizada correctamente");
    },
    onError: (error: Error) => {
      toast.error("Error al actualizar la guía de tallas: " + error.message);
    },
  });
}

export function useDeleteSizeGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getSizeGuidesTable().delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["size-guides"] });
      toast.success("Guía de tallas eliminada correctamente");
    },
    onError: (error: Error) => {
      toast.error("Error al eliminar la guía de tallas: " + error.message);
    },
  });
}

export function useToggleSizeGuideStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await getSizeGuidesTable()
        .update({ is_active: isActive } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["size-guides"] });
    },
    onError: (error: Error) => {
      toast.error("Error al cambiar el estado: " + error.message);
    },
  });
}
