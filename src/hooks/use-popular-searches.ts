import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PopularSearch {
  id: string;
  query: string;
  total_count: number;
  updated_at: string;
}

export interface PopularSearchFormData {
  query: string;
  total_count: number;
}

interface PopularSearchFilters {
  search?: string;
  minCount?: number;
}

// Helper to get typed client for popular_searches table
const getPopularSearchesTable = () => {
  return supabase.from("popular_searches" as any);
};

export function usePopularSearches(filters?: PopularSearchFilters) {
  return useQuery({
    queryKey: ["popular-searches", filters],
    queryFn: async () => {
      let query = getPopularSearchesTable()
        .select("*")
        .order("total_count", { ascending: false });

      if (filters?.search) {
        query = query.ilike("query", `%${filters.search}%`);
      }

      if (filters?.minCount) {
        query = query.gte("total_count", filters.minCount);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as unknown as PopularSearch[];
    },
  });
}

export function usePopularSearchStats() {
  return useQuery({
    queryKey: ["popular-searches", "stats"],
    queryFn: async () => {
      const { data, error } = await getPopularSearchesTable()
        .select("*")
        .order("total_count", { ascending: false });

      if (error) throw error;

      const searches = (data || []) as unknown as PopularSearch[];
      const totalTerms = searches.length;
      const totalSearches = searches.reduce((sum, s) => sum + s.total_count, 0);
      const topSearch = searches[0] || null;
      const averageSearches = totalTerms > 0 ? Math.round(totalSearches / totalTerms) : 0;

      return {
        totalTerms,
        totalSearches,
        topSearch,
        averageSearches,
        top5: searches.slice(0, 5),
      };
    },
  });
}

export function useAddPopularSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PopularSearchFormData) => {
      const { data: result, error } = await getPopularSearchesTable()
        .insert({
          query: data.query,
          total_count: data.total_count,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return result as unknown as PopularSearch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popular-searches"] });
      toast.success("Tendencia agregada correctamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al agregar tendencia: ${error.message}`);
    },
  });
}

export function useUpdatePopularSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PopularSearchFormData> }) => {
      const { error } = await getPopularSearchesTable()
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popular-searches"] });
      toast.success("Tendencia actualizada correctamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar tendencia: ${error.message}`);
    },
  });
}

export function useDeletePopularSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getPopularSearchesTable()
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popular-searches"] });
      toast.success("Tendencia eliminada correctamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar tendencia: ${error.message}`);
    },
  });
}
