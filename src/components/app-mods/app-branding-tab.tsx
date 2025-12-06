import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Upload, Loader2, Trash2, GripVertical, Image as ImageIcon, Plus, Smartphone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  useAppBranding,
  useCreateBranding,
  useUpdateBranding,
  useDeleteBranding,
  useBatchUpdateOrder,
  uploadBrandingImage,
  type AppBranding,
} from "@/hooks/use-app-branding";

export function AppBrandingTab() {
  const { data: allBranding = [], isLoading } = useAppBranding();
  const createBranding = useCreateBranding();
  const updateBranding = useUpdateBranding();
  const deleteBranding = useDeleteBranding();
  const batchUpdateOrder = useBatchUpdateOrder();

  const [uploadingSplash, setUploadingSplash] = useState(false);
  const [uploadingOnboarding, setUploadingOnboarding] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const splashInputRef = useRef<HTMLInputElement>(null);
  const onboardingInputRef = useRef<HTMLInputElement>(null);

  const splashItem = allBranding.find((item) => item.type === "splash");
  const onboardingItems = allBranding
    .filter((item) => item.type === "onboarding")
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const handleSplashUpload = async (file: File) => {
    if (!validateFile(file)) return;

    setUploadingSplash(true);
    try {
      const imageUrl = await uploadBrandingImage(file, "splash");

      if (splashItem) {
        await updateBranding.mutateAsync({
          id: splashItem.id,
          updates: { image_url: imageUrl },
        });
      } else {
        await createBranding.mutateAsync({
          type: "splash",
          image_url: imageUrl,
          display_order: 0,
          is_active: true,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error al subir imagen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingSplash(false);
    }
  };

  const handleOnboardingUpload = async (file: File) => {
    if (!validateFile(file)) return;

    if (onboardingItems.length >= 5) {
      toast({
        title: "Límite alcanzado",
        description: "Solo puedes tener hasta 5 imágenes de onboarding",
        variant: "destructive",
      });
      return;
    }

    setUploadingOnboarding(true);
    try {
      const imageUrl = await uploadBrandingImage(file, "onboarding");
      const nextOrder = onboardingItems.length + 1;

      await createBranding.mutateAsync({
        type: "onboarding",
        image_url: imageUrl,
        display_order: nextOrder,
        is_active: true,
      });
    } catch (error: any) {
      toast({
        title: "Error al subir imagen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingOnboarding(false);
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Solo se permiten archivos JPG, PNG o GIF",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "El tamaño máximo es 5 MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(onboardingItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updates = items.map((item, index) => ({
      id: item.id,
      display_order: index + 1,
    }));

    batchUpdateOrder.mutate(updates);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteBranding.mutate(itemToDelete);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleUpdateField = (
    id: string,
    field: "title" | "description" | "is_active",
    value: string | boolean
  ) => {
    updateBranding.mutate({ id, updates: { [field]: value } });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Splash Screen Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            IMAGEN DE SPLASH
          </CardTitle>
          <CardDescription>
            Imagen que aparece al iniciar la aplicación • Dimensiones recomendadas: 1080 x 1920 px
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 items-start">
            {/* Preview */}
            <div className="w-[180px] flex-shrink-0">
              <div
                className="aspect-[9/16] rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/30 overflow-hidden"
              >
                {splashItem?.image_url ? (
                  <img
                    src={splashItem.image_url}
                    alt="Splash screen"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">Sin imagen</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">Vista previa</p>
            </div>

            {/* Controls */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Estado</Label>
                  <p className="text-sm text-muted-foreground">
                    {splashItem?.is_active ? "Activo" : "Inactivo"}
                  </p>
                </div>
                {splashItem && (
                  <Switch
                    checked={splashItem.is_active ?? true}
                    onCheckedChange={(checked) =>
                      handleUpdateField(splashItem.id, "is_active", checked)
                    }
                  />
                )}
              </div>

              <div>
                <Button
                  variant="outline"
                  onClick={() => splashInputRef.current?.click()}
                  disabled={uploadingSplash}
                  className="w-full"
                >
                  {uploadingSplash ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {splashItem ? "Cambiar imagen" : "Subir imagen"}
                    </>
                  )}
                </Button>
                <input
                  ref={splashInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleSplashUpload(file);
                    e.target.value = "";
                  }}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG o GIF • Máximo 5 MB
                </p>
              </div>

              {splashItem && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setItemToDelete(splashItem.id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar imagen
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                IMÁGENES DE ONBOARDING
              </CardTitle>
              <CardDescription>
                Imágenes del tutorial inicial (hasta 5) • Dimensiones recomendadas: 1080 x 1920 px
              </CardDescription>
            </div>
            <Button
              onClick={() => onboardingInputRef.current?.click()}
              disabled={uploadingOnboarding || onboardingItems.length >= 5}
            >
              {uploadingOnboarding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar imagen
                </>
              )}
            </Button>
            <input
              ref={onboardingInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleOnboardingUpload(file);
                e.target.value = "";
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {onboardingItems.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay imágenes de onboarding</p>
              <p className="text-sm text-muted-foreground">
                Agrega imágenes para el tutorial inicial de la app
              </p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="onboarding-list">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-4"
                  >
                    {onboardingItems.map((item, index) => (
                      <OnboardingItem
                        key={item.id}
                        item={item}
                        index={index}
                        onUpdate={handleUpdateField}
                        onDelete={(id) => {
                          setItemToDelete(id);
                          setDeleteDialogOpen(true);
                        }}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La imagen será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface OnboardingItemProps {
  item: AppBranding;
  index: number;
  onUpdate: (id: string, field: "title" | "description" | "is_active", value: string | boolean) => void;
  onDelete: (id: string) => void;
}

function OnboardingItem({ item, index, onUpdate, onDelete }: OnboardingItemProps) {
  const [title, setTitle] = useState(item.title || "");
  const [description, setDescription] = useState(item.description || "");

  const handleBlur = (field: "title" | "description", value: string) => {
    if ((field === "title" && value !== item.title) || 
        (field === "description" && value !== item.description)) {
      onUpdate(item.id, field, value);
    }
  };

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex gap-4 p-4 border rounded-lg bg-card ${
            snapshot.isDragging ? "shadow-lg ring-2 ring-primary" : ""
          }`}
        >
          {/* Drag Handle */}
          <div
            {...provided.dragHandleProps}
            className="flex items-center justify-center w-8 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Order Badge */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">
            {index + 1}
          </div>

          {/* Image Preview */}
          <div className="w-[100px] flex-shrink-0">
            <div className="aspect-[9/16] rounded-lg border overflow-hidden bg-muted/30">
              <img
                src={item.image_url}
                alt={`Onboarding ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Fields */}
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <Label htmlFor={`title-${item.id}`}>Título (opcional)</Label>
              <Input
                id={`title-${item.id}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleBlur("title", title)}
                placeholder="Título del slide"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`desc-${item.id}`}>Descripción (opcional)</Label>
              <Textarea
                id={`desc-${item.id}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => handleBlur("description", description)}
                placeholder="Descripción del slide"
                rows={2}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Activo</Label>
              <Switch
                checked={item.is_active ?? true}
                onCheckedChange={(checked) => onUpdate(item.id, "is_active", checked)}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Draggable>
  );
}
