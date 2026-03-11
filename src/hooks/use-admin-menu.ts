import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface AdminMenuItem {
  id: string;
  menu_key: string;
  label: string;
  icon_name: string;
  href: string;
  order_index: number;
  is_visible: boolean;
  allowed_roles: string[];
  created_at: string;
  updated_at: string;
}

export interface AdminMenuItemUpdate {
  label?: string;
  order_index?: number;
  is_visible?: boolean;
  allowed_roles?: string[];
}

export function useAdminMenu() {
  return useQuery({
    queryKey: ["admin-menu-config"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("admin_menu_config")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as AdminMenuItem[];
    },
  });
}

export function useBatchUpdateAdminMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: { id: string; updates: AdminMenuItemUpdate }[]
    ) => {
      const promises = updates.map(({ id, updates: itemUpdates }) =>
        (supabase as any)
          .from("admin_menu_config")
          .update({ ...itemUpdates, updated_at: new Date().toISOString() })
          .eq("id", id)
          .select()
      );

      const results = await Promise.all(promises);
      const errors = results.filter((r: any) => r.error);

      if (errors.length > 0) {
        throw new Error("Error al actualizar algunos ítems del menú");
      }

      return results.map((r: any) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menu-config"] });
      toast({
        title: "Menú actualizado",
        description: "Los cambios se guardaron correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
