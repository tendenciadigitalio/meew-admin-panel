import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_type: string;
  link_value: string | null;
  is_active: boolean | null;
  display_order: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface BannerFormData {
  title: string;
  subtitle?: string;
  image_url: string;
  link_type: "none" | "category" | "product" | "external";
  link_value?: string;
  is_active: boolean;
  display_order: number;
  start_date?: string;
  end_date?: string;
}

export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Banner[];
    },
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: BannerFormData) => {
      const { data, error } = await supabase
        .from("banners")
        .insert({
          title: formData.title,
          subtitle: formData.subtitle || null,
          image_url: formData.image_url,
          link_type: formData.link_type,
          link_value: formData.link_value || null,
          is_active: formData.is_active,
          display_order: formData.display_order,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({
        title: "Banner creado",
        description: "El banner se ha creado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear el banner",
        variant: "destructive",
      });
      console.error(error);
    },
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: BannerFormData }) => {
      const { data, error } = await supabase
        .from("banners")
        .update({
          title: formData.title,
          subtitle: formData.subtitle || null,
          image_url: formData.image_url,
          link_type: formData.link_type,
          link_value: formData.link_value || null,
          is_active: formData.is_active,
          display_order: formData.display_order,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({
        title: "Banner actualizado",
        description: "El banner se ha actualizado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el banner",
        variant: "destructive",
      });
      console.error(error);
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("banners")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({
        title: "Banner eliminado",
        description: "El banner se ha eliminado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el banner",
        variant: "destructive",
      });
      console.error(error);
    },
  });
}

export function useUpdateBannerOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from("banners")
        .update({ display_order: newOrder })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el orden",
        variant: "destructive",
      });
      console.error(error);
    },
  });
}

export function useUploadBannerImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("banners")
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("banners")
        .getPublicUrl(fileName);

      return publicUrl;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive",
      });
      console.error(error);
    },
  });
}
