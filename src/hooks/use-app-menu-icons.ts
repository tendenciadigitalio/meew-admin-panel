import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface AppMenuIcon {
  id: string;
  menu_key: string;
  icon_url: string | null;
  active_icon_url: string | null;
  label: string;
  is_visible: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface AppMenuIconUpdate {
  icon_url?: string | null;
  active_icon_url?: string | null;
  label?: string;
  is_visible?: boolean;
  order_index?: number;
}

// Fetch all menu icons
export function useAppMenuIcons() {
  return useQuery({
    queryKey: ["app-menu-icons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_menu_icons")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as AppMenuIcon[];
    },
  });
}

// Update single menu icon
export function useUpdateAppMenuIcon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: AppMenuIconUpdate;
    }) => {
      const { data, error } = await supabase
        .from("app_menu_icons")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-menu-icons"] });
      toast({
        title: "Ícono actualizado",
        description: "Los cambios se guardaron correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Batch update multiple menu icons
export function useBatchUpdateAppMenuIcons() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: { id: string; updates: AppMenuIconUpdate }[]
    ) => {
      const promises = updates.map(({ id, updates: itemUpdates }) =>
        supabase
          .from("app_menu_icons")
          .update(itemUpdates)
          .eq("id", id)
          .select()
      );

      const results = await Promise.all(promises);
      const errors = results.filter((r) => r.error);

      if (errors.length > 0) {
        throw new Error("Error al actualizar algunos iconos");
      }

      return results.map((r) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-menu-icons"] });
      toast({
        title: "Cambios guardados",
        description: "Todos los iconos se actualizaron correctamente",
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

// Reset icon to default (Material Icons)
export function useResetAppMenuIcon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("app_menu_icons")
        .update({
          icon_url: null,
          active_icon_url: null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-menu-icons"] });
      toast({
        title: "Ícono restablecido",
        description: "Se usarán los iconos Material por defecto",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al restablecer",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Upload icon to storage
export async function uploadMenuIcon(
  file: File,
  menuKey: string,
  type: "active" | "inactive"
): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const filePath = `menu-icons/${menuKey}/${type}.${fileExt}`;

  // Delete existing file if any
  await supabase.storage.from("meew_cloud").remove([filePath]);

  // Upload new file
  const { error: uploadError } = await supabase.storage
    .from("meew_cloud")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("meew_cloud").getPublicUrl(filePath);

  return publicUrl;
}
