import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Category } from "@/types/database";

export type CategoryWithCount = Category & {
  product_count: number;
};

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select(`
          *,
          products(count)
        `)
        .order("name");

      if (error) throw error;
      
      return data.map(cat => ({
        ...cat,
        product_count: cat.products?.[0]?.count || 0
      })) as CategoryWithCount[];
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCategory: { 
      name: string; 
      description?: string; 
      slug: string; 
      is_active: boolean 
    }) => {
      // Verificar si el slug ya existe
      const { data: existing, error: checkError } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", newCategory.slug)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existing) {
        throw new Error("El slug ya existe. Por favor elige otro.");
      }

      const { data, error } = await supabase
        .from("categories")
        .insert(newCategory)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Categoría creada exitosamente");
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: Partial<Category> 
    }) => {
      // Si se actualiza el slug, verificar que sea único
      if (updates.slug) {
        const { data: existing, error: checkError } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", updates.slug)
          .neq("id", id)
          .maybeSingle();

        if (checkError) throw checkError;
        if (existing) {
          throw new Error("El slug ya existe. Por favor elige otro.");
        }
      }

      const { data, error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Categoría actualizada exitosamente");
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Verificar si tiene productos asignados
      const { data: products, error: checkError } = await supabase
        .from("products")
        .select("id")
        .eq("category_id", id);

      if (checkError) throw checkError;
      
      if (products && products.length > 0) {
        throw new Error(`No se puede eliminar. Tiene ${products.length} producto(s) asignado(s)`);
      }

      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Categoría eliminada exitosamente");
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}
