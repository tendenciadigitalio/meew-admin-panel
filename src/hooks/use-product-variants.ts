import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductVariant } from "@/types/database";

interface CreateVariantData {
  product_id: string;
  size?: string | null;
  color_name?: string | null;
  color_hex?: string | null;
  stock_quantity: number;
  price_override?: number | null;
}

export function useProductVariants(productId: string | null) {
  return useQuery({
    queryKey: ["product-variants", productId],
    queryFn: async () => {
      if (!productId) return [];
      
      const { data, error } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId)
        .eq("is_active", true)
        .order("size")
        .order("color_name");

      if (error) throw error;
      return data as ProductVariant[];
    },
    enabled: !!productId,
  });
}

export function useCreateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variantData: CreateVariantData) => {
      const { data, error } = await supabase
        .from("product_variants")
        .insert(variantData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-variants", variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Variante creada exitosamente");
    },
    onError: (error: any) => {
      toast.error(`Error al crear variante: ${error.message}`);
    },
  });
}

export function useUpdateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, productId, updates }: { id: string; productId: string; updates: Partial<ProductVariant> }) => {
      const { data, error } = await supabase
        .from("product_variants")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-variants", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Variante actualizada exitosamente");
    },
    onError: (error: any) => {
      toast.error(`Error al actualizar variante: ${error.message}`);
    },
  });
}

export function useDeleteVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, productId }: { id: string; productId: string }) => {
      const { error } = await supabase
        .from("product_variants")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-variants", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Variante eliminada exitosamente");
    },
    onError: (error: any) => {
      toast.error(`Error al eliminar variante: ${error.message}`);
    },
  });
}

export function useBulkCreateVariants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, variants }: { productId: string; variants: Omit<CreateVariantData, "product_id">[] }) => {
      const variantsWithProductId = variants.map(v => ({ ...v, product_id: productId }));
      
      const { data, error } = await supabase
        .from("product_variants")
        .insert(variantsWithProductId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-variants", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`${data.length} variantes creadas exitosamente`);
    },
    onError: (error: any) => {
      toast.error(`Error al crear variantes: ${error.message}`);
    },
  });
}
