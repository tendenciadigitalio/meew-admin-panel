import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUploadProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, file }: { productId: string; file: File }) => {
      console.log("[useUploadProductImage] Starting upload for product:", productId);
      console.log("[useUploadProductImage] File details:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      // Upload to Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${productId}/${Date.now()}.${fileExt}`;
      
      console.log("[useUploadProductImage] Uploading to path:", fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product_images")
        .upload(fileName, file);

      if (uploadError) {
        console.error("[useUploadProductImage] Storage upload error:", uploadError);
        throw new Error(`Error al subir archivo: ${uploadError.message}`);
      }

      console.log("[useUploadProductImage] Upload successful:", uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("product_images")
        .getPublicUrl(fileName);

      console.log("[useUploadProductImage] Public URL:", publicUrl);

      // Check if this is the first image for this product
      const { data: existingImages, error: fetchError } = await supabase
        .from("product_images")
        .select("id")
        .eq("product_id", productId);

      if (fetchError) {
        console.error("[useUploadProductImage] Error fetching existing images:", fetchError);
      }

      const isFirstImage = !existingImages || existingImages.length === 0;
      console.log("[useUploadProductImage] Is first image:", isFirstImage);

      // Insert into product_images table
      const { data: insertData, error: dbError } = await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          image_url: publicUrl,
          is_primary: isFirstImage,
          display_order: (existingImages?.length || 0) + 1,
        })
        .select();

      if (dbError) {
        console.error("[useUploadProductImage] Database insert error:", dbError);
        throw new Error(`Error al guardar en base de datos: ${dbError.message}`);
      }

      console.log("[useUploadProductImage] Database insert successful:", insertData);

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Imagen subida correctamente");
    },
    onError: (error: Error) => {
      console.error("[useUploadProductImage] Full error:", error);
      toast.error(error.message || "Error al subir la imagen");
    },
  });
};

export const useDeleteProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageId, productId }: { imageId: string; productId: string }) => {
      // Get image data first
      const { data: image } = await supabase
        .from("product_images")
        .select("image_url, is_primary")
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

      // If deleted image was primary, set the next image as primary
      if (image.is_primary) {
        const { data: remainingImages } = await supabase
          .from("product_images")
          .select("id")
          .eq("product_id", productId)
          .order("display_order")
          .limit(1);

        if (remainingImages && remainingImages.length > 0) {
          await supabase
            .from("product_images")
            .update({ is_primary: true, display_order: 0 })
            .eq("id", remainingImages[0].id);
        }
      }
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
      // Get all images for this product
      const { data: allImages } = await supabase
        .from("product_images")
        .select("id, display_order")
        .eq("product_id", productId)
        .order("display_order");

      if (!allImages) throw new Error("No images found");

      // Set all images as non-primary
      const { error: resetError } = await supabase
        .from("product_images")
        .update({ is_primary: false })
        .eq("product_id", productId);

      if (resetError) throw resetError;

      // Set selected image as primary with display_order = 0
      const { error: setPrimaryError } = await supabase
        .from("product_images")
        .update({ is_primary: true, display_order: 0 })
        .eq("id", imageId);

      if (setPrimaryError) throw setPrimaryError;

      // Reorder other images (1, 2, 3...)
      let newOrder = 1;
      for (const img of allImages) {
        if (img.id !== imageId) {
          await supabase
            .from("product_images")
            .update({ display_order: newOrder })
            .eq("id", img.id);
          newOrder++;
        }
      }
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

export const useReorderImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imagesWithNewOrder: { imageId: string; newOrder: number }[]) => {
      // Update all images in batch
      for (const { imageId, newOrder } of imagesWithNewOrder) {
        const { error } = await supabase
          .from("product_images")
          .update({ display_order: newOrder })
          .eq("id", imageId);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Orden actualizado");
    },
    onError: (error) => {
      console.error("Error updating image order:", error);
      toast.error("Error al reordenar imágenes");
    },
  });
};
