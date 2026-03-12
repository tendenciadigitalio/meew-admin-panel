import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface AppBranding {
  id: string;
  type: string;
  image_url: string;
  title: string | null;
  description: string | null;
  display_order: number | null;
  is_active: boolean | null;
  media_x: number | null;
  media_y: number | null;
  media_width: number | null;
  media_height: number | null;
  media_opacity: number | null;
  media_fit: "cover" | "contain" | "fill" | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateBrandingParams {
  type: "splash" | "onboarding";
  image_url: string;
  title?: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
  media_x?: number;
  media_y?: number;
  media_width?: number;
  media_height?: number;
  media_opacity?: number;
  media_fit?: "cover" | "contain" | "fill";
}

export interface UpdateBrandingParams {
  id: string;
  updates: Partial<Omit<AppBranding, "id" | "created_at" | "updated_at">>;
}

// Fetch all branding items
export function useAppBranding(type?: "splash" | "onboarding") {
  return useQuery({
    queryKey: ["app-branding", type],
    queryFn: async () => {
      let query = supabase
        .from("app_branding")
        .select("*")
        .order("display_order", { ascending: true });

      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AppBranding[];
    },
  });
}

// Create branding item
export function useCreateBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateBrandingParams) => {
      const { data, error } = await supabase
        .from("app_branding")
        .insert(params)
        .select()
        .single();

      if (error) throw error;
      return data as AppBranding;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-branding"] });
      toast({
        title: "Imagen guardada",
        description: "La imagen se guardó correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Update branding item
export function useUpdateBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: UpdateBrandingParams) => {
      const { data, error } = await supabase
        .from("app_branding")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as AppBranding;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-branding"] });
      toast({
        title: "Cambios guardados",
        description: "Los cambios se guardaron correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Delete branding item
export function useDeleteBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First get the item to delete the image from storage
      const { data: item } = await supabase
        .from("app_branding")
        .select("image_url")
        .eq("id", id)
        .single();

      if (item?.image_url) {
        // Extract path from URL
        const url = new URL(item.image_url);
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/meew_cloud\/(.+)/);
        if (pathMatch) {
          await supabase.storage.from("meew_cloud").remove([pathMatch[1]]);
        }
      }

      const { error } = await supabase
        .from("app_branding")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-branding"] });
      toast({
        title: "Imagen eliminada",
        description: "La imagen se eliminó correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Batch update order
export function useBatchUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: { id: string; display_order: number }[]) => {
      for (const item of items) {
        const { error } = await supabase
          .from("app_branding")
          .update({ display_order: item.display_order })
          .eq("id", item.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-branding"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Upload branding asset to storage (images, video, lottie)
export async function uploadBrandingImage(
  file: File,
  type: "splash" | "onboarding"
): Promise<string> {
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileName = `${Date.now()}-${sanitizedName}`;
  const filePath = `branding/${type}/${fileName}`;

  // Determine content type — .lottie files need special handling
  const ext = file.name.split(".").pop()?.toLowerCase();
  let contentType = file.type;
  if (ext === "lottie") contentType = "application/json";
  if (ext === "json") contentType = "application/json";

  const { error: uploadError } = await supabase.storage
    .from("meew_cloud")
    .upload(filePath, file, {
      upsert: false,
      contentType,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("meew_cloud").getPublicUrl(filePath);

  return publicUrl;
}
