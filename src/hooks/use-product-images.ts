import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUploadProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, file }: { productId: string; file: File }) => {
      // Upload to Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${productId}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("product_images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("product_images")
        .getPublicUrl(fileName);

      // Check if this is the first image for this product
      const { data: existingImages } = await supabase
        .from("product_images")
        .select("id")
        .eq("product_id", productId);

      const isFirstImage = !existingImages || existingImages.length === 0;

      // Insert into product_images table
      const { error: dbError } = await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          image_url: publicUrl,
          is_primary: isFirstImage,
          display_order: (existingImages?.length || 0) + 1,
        });

      if (dbError) throw dbError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Imagen subida correctamente");
    },
    onError: (error) => {
      console.error("Error uploading image:", error);
      toast.error("Error al subir la imagen");
    },
  });
};

export const useDeleteProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageId: string) => {
      // Get image data first
      const { data: image } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("id", imageId)
        .single();

      if (!image) throw new Error("Image not found");

      // Extract file path from URL
      const url = new URL(image.image_url);
      const pathParts = url.pathname.split("/");
      const filePath = pathParts.slice(-2).join("/"); // product_id/filename

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("product_images")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("product_images")
        .delete()
        .eq("id", imageId);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Imagen eliminada");
    },
    onError: (error) => {
      console.error("Error deleting image:", error);
      toast.error("Error al eliminar la imagen");
    },
  });
};

export const useSetPrimaryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageId, productId }: { imageId: string; productId: string }) => {
      // Set all images of this product as non-primary
      const { error: resetError } = await supabase
        .from("product_images")
        .update({ is_primary: false })
        .eq("product_id", productId);

      if (resetError) throw resetError;

      // Set selected image as primary
      const { error: setPrimaryError } = await supabase
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", imageId);

      if (setPrimaryError) throw setPrimaryError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Imagen principal actualizada");
    },
    onError: (error) => {
      console.error("Error setting primary image:", error);
      toast.error("Error al actualizar imagen principal");
    },
  });
};

export const useUpdateImageOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageId, displayOrder }: { imageId: string; displayOrder: number }) => {
      const { error } = await supabase
        .from("product_images")
        .update({ display_order: displayOrder })
        .eq("id", imageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.error("Error updating image order:", error);
      toast.error("Error al reordenar imagen");
    },
  });
};
