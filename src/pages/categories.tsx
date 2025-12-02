import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, ChevronUp, ChevronDown, ImageIcon, X, Star } from "lucide-react";
import { toast } from "sonner";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useToggleFeaturedCategory,
  useUpdateCategoryOrder,
  useUploadCategoryImage,
  CategoryWithCount,
} from "@/hooks/use-categories";

const Categories = () => {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const toggleFeatured = useToggleFeaturedCategory();
  const updateOrder = useUpdateCategoryOrder();
  const uploadImage = useUploadCategoryImage();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    is_active: true,
    is_featured: false,
    display_order: null as number | null,
    image_url: null as string | null,
  });

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name || "",
        description: editingCategory.description || "",
        slug: editingCategory.slug || "",
        is_active: editingCategory.is_active ?? true,
        is_featured: editingCategory.is_featured ?? false,
        display_order: editingCategory.display_order ?? null,
        image_url: editingCategory.image_url || null,
      });
      setImagePreview(editingCategory.image_url || null);
    }
  }, [editingCategory]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : generateSlug(name),
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 5MB");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Solo se permiten imágenes JPG, PNG o WebP");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.slug.trim()) {
      return;
    }

    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        const categoryId = editingCategory?.id || crypto.randomUUID();
        imageUrl = await uploadImage.mutateAsync({
          categoryId,
          file: imageFile,
        });
      }

      const dataToSave = {
        name: formData.name,
        description: formData.description,
        slug: formData.slug,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        display_order: formData.display_order,
        image_url: imageUrl,
      };

      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          updates: dataToSave,
        });
      } else {
        await createCategory.mutateAsync(dataToSave);
      }

      handleCloseDialog();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setImageFile(null);
    setImagePreview(null);
    setFormData({
      name: "",
      description: "",
      slug: "",
      is_active: true,
      is_featured: false,
      display_order: null,
      image_url: null,
    });
  };

  const handleEdit = (category: CategoryWithCount) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteCategory.mutateAsync(deleteId);
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const handleMoveUp = async (category: CategoryWithCount, index: number) => {
    if (index === 0 || !categories) return;

    const previousCategory = categories[index - 1];

    await Promise.all([
      updateOrder.mutateAsync({
        id: category.id,
        newOrder: previousCategory.display_order ?? index - 1,
      }),
      updateOrder.mutateAsync({
        id: previousCategory.id,
        newOrder: category.display_order ?? index,
      }),
    ]);
  };

  const handleMoveDown = async (category: CategoryWithCount, index: number) => {
    if (!categories || index === categories.length - 1) return;

    const nextCategory = categories[index + 1];

    await Promise.all([
      updateOrder.mutateAsync({
        id: category.id,
        newOrder: nextCategory.display_order ?? index + 1,
      }),
      updateOrder.mutateAsync({
        id: nextCategory.id,
        newOrder: category.display_order ?? index,
      }),
    ]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-wider">
          CATEGORÍAS
        </h1>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="uppercase tracking-wide"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      <div className="border-2 border-border rounded-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-border">
              <TableHead className="uppercase tracking-wide font-bold w-16">
                Imagen
              </TableHead>
              <TableHead className="uppercase tracking-wide font-bold">
                Nombre
              </TableHead>
              <TableHead className="uppercase tracking-wide font-bold hidden md:table-cell">
                Descripción
              </TableHead>
              <TableHead className="uppercase tracking-wide font-bold text-center w-28">
                Destacada
              </TableHead>
              <TableHead className="uppercase tracking-wide font-bold text-center w-32">
                Orden
              </TableHead>
              <TableHead className="uppercase tracking-wide font-bold text-center w-24">
                Productos
              </TableHead>
              <TableHead className="uppercase tracking-wide font-bold text-center w-24">
                Estado
              </TableHead>
              <TableHead className="uppercase tracking-wide font-bold text-right w-32">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No hay categorías registradas
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category, index) => (
                <TableRow key={category.id} className="border-b border-border">
                  {/* Columna de imagen */}
                  <TableCell>
                    {category.image_url ? (
                      <img 
                        src={category.image_url} 
                        alt={category.name}
                        className="w-12 h-12 object-cover rounded border-2 border-border"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center border-2 border-border">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>

                  {/* Nombre */}
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {category.name}
                      {category.is_featured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                  </TableCell>

                  {/* Descripción */}
                  <TableCell className="max-w-md truncate hidden md:table-cell">
                    {category.description || "-"}
                  </TableCell>

                  {/* Switch Destacada */}
                  <TableCell className="text-center">
                    <Switch
                      checked={category.is_featured || false}
                      onCheckedChange={(checked) =>
                        toggleFeatured.mutate({
                          id: category.id,
                          is_featured: checked
                        })
                      }
                    />
                  </TableCell>

                  {/* Orden con botones arriba/abajo */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleMoveUp(category, index)}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-mono min-w-[2ch]">
                        {category.display_order ?? "-"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleMoveDown(category, index)}
                        disabled={index === categories.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>

                  {/* Productos */}
                  <TableCell className="text-center">
                    <Badge variant="outline">{category.product_count}</Badge>
                  </TableCell>

                  {/* Estado */}
                  <TableCell className="text-center">
                    <Badge
                      variant={category.is_active ? "default" : "secondary"}
                    >
                      {category.is_active ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Crear/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-2">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-wider">
              {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="uppercase tracking-wide text-xs">
                Nombre *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="border-2"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="uppercase tracking-wide text-xs">
                Slug *
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                className="border-2 font-mono text-sm"
                required
                pattern="[a-z0-9-]+"
                title="Solo letras minúsculas, números y guiones"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="uppercase tracking-wide text-xs">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="border-2"
              />
            </div>

            {/* Campo de imagen */}
            <div className="space-y-2">
              <Label htmlFor="image" className="uppercase tracking-wide text-xs">
                Imagen de Categoría
              </Label>

              {imagePreview && (
                <div className="relative w-full h-48 border-2 border-border rounded-sm overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                      setFormData((prev) => ({ ...prev, image_url: null }));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="border-2"
              />
              <p className="text-xs text-muted-foreground">
                Formatos: JPG, PNG, WebP. Máximo 5MB. Recomendado: 800x600px
              </p>
            </div>

            {/* Switch destacada */}
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="is_featured" className="uppercase tracking-wide text-xs">
                Categoría Destacada
              </Label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {formData.is_featured ? "Sí" : "No"}
                </span>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured || false}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_featured: checked }))
                  }
                />
              </div>
            </div>

            {/* Campo display_order */}
            <div className="space-y-2">
              <Label htmlFor="display_order" className="uppercase tracking-wide text-xs">
                Orden de Visualización
              </Label>
              <Input
                id="display_order"
                type="number"
                min="0"
                value={formData.display_order ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    display_order: e.target.value ? parseInt(e.target.value) : null
                  }))
                }
                className="border-2"
                placeholder="0, 1, 2..."
              />
              <p className="text-xs text-muted-foreground">
                Menor número = mayor prioridad en el carrusel
              </p>
            </div>

            <div className="flex items-center justify-between py-2">
              <Label htmlFor="is_active" className="uppercase tracking-wide text-xs">
                Estado
              </Label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {formData.is_active ? "Activa" : "Inactiva"}
                </span>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_active: checked }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="uppercase tracking-wide"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  createCategory.isPending || updateCategory.isPending || uploadImage.isPending
                }
                className="uppercase tracking-wide"
              >
                {editingCategory ? "Guardar Cambios" : "Crear Categoría"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Eliminación */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase tracking-wider">
              ¿Eliminar categoría?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La categoría será eliminada
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="uppercase tracking-wide">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="uppercase tracking-wide bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCategory.isPending}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Categories;
