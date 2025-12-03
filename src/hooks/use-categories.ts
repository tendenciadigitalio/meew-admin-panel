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
        .order("display_order", { ascending: true, nullsFirst: false })
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
      is_active: boolean;
      is_featured?: boolean;
      display_order?: number | null;
      image_url?: string | null;
      parent_id?: string | null;
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

export function useToggleFeaturedCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      const { error } = await supabase
        .from("categories")
        .update({ is_featured })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Estado destacado actualizado");
    },
    onError: () => {
      toast.error("Error al actualizar");
    },
  });
}

export function useUpdateCategoryOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from("categories")
        .update({ display_order: newOrder })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUploadCategoryImage() {
  return useMutation({
    mutationFn: async ({ categoryId, file }: { categoryId: string; file: File }) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `categories/${categoryId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("category_images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("category_images")
        .getPublicUrl(fileName);

      return publicUrl;
    },
    onError: () => {
      toast.error("Error al subir imagen");
    },
  });
}

export function useUpdateCategoryImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, image_url }: { id: string; image_url: string }) => {
      const { error } = await supabase
        .from("categories")
        .update({ image_url })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Imagen actualizada");
    },
  });
}
