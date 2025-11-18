import { useState } from "react";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
  useUpdateBannerOrder,
  useUploadBannerImage,
  type Banner,
  type BannerFormData,
} from "@/hooks/use-banners";
import { useCategories } from "@/hooks/use-categories";

const bannerSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(100, "Máximo 100 caracteres"),
  subtitle: z.string().max(200, "Máximo 200 caracteres").optional(),
  image_url: z.string().min(1, "La imagen es requerida"),
  link_type: z.enum(["none", "category", "product", "external"]),
  link_value: z.string().optional(),
  is_active: z.boolean(),
  display_order: z.number().min(0),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.end_date) > new Date(data.start_date);
  }
  return true;
}, {
  message: "La fecha de fin debe ser posterior a la fecha de inicio",
  path: ["end_date"],
});

type BannerFormValues = z.infer<typeof bannerSchema>;

export default function Banners() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  const { data: banners, isLoading } = useBanners();
  const { data: categories } = useCategories();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();
  const updateBannerOrder = useUpdateBannerOrder();
  const uploadImage = useUploadBannerImage();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      image_url: "",
      link_type: "none",
      link_value: "",
      is_active: true,
      display_order: 0,
      start_date: "",
      end_date: "",
    },
  });

  const linkType = watch("link_type");

  const handleOpenDialog = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setValue("title", banner.title);
      setValue("subtitle", banner.subtitle || "");
      setValue("image_url", banner.image_url);
      setValue("link_type", banner.link_type as any);
      setValue("link_value", banner.link_value || "");
      setValue("is_active", banner.is_active ?? true);
      setValue("display_order", banner.display_order ?? 0);
      setValue("start_date", banner.start_date || "");
      setValue("end_date", banner.end_date || "");
      setImagePreview(banner.image_url);
    } else {
      setEditingBanner(null);
      reset();
      setImagePreview(null);
      const maxOrder = banners?.reduce((max, b) => Math.max(max, b.display_order ?? 0), 0) ?? 0;
      setValue("display_order", maxOrder + 1);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBanner(null);
    reset();
    setImagePreview(null);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar los 5MB");
      return;
    }

    // Validar tipo
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Solo se permiten imágenes JPG, PNG o WebP");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    const url = await uploadImage.mutateAsync(file);
    setValue("image_url", url);
  };

  const onSubmit = async (data: BannerFormValues) => {
    const formData: BannerFormData = {
      title: data.title,
      subtitle: data.subtitle,
      image_url: data.image_url,
      link_type: data.link_type,
      link_value: data.link_value,
      is_active: data.is_active,
      display_order: data.display_order,
      start_date: data.start_date,
      end_date: data.end_date,
    };

    if (editingBanner) {
      await updateBanner.mutateAsync({ id: editingBanner.id, formData });
    } else {
      await createBanner.mutateAsync(formData);
    }
    handleCloseDialog();
  };

  const handleDelete = async () => {
    if (bannerToDelete) {
      await deleteBanner.mutateAsync(bannerToDelete);
      setIsDeleteDialogOpen(false);
      setBannerToDelete(null);
    }
  };

  const handleMoveUp = async (banner: Banner, index: number) => {
    if (index === 0 || !banners) return;
    const previousBanner = banners[index - 1];
    await Promise.all([
      updateBannerOrder.mutateAsync({
        id: banner.id,
        newOrder: previousBanner.display_order ?? 0,
      }),
      updateBannerOrder.mutateAsync({
        id: previousBanner.id,
        newOrder: banner.display_order ?? 0,
      }),
    ]);
  };

  const handleMoveDown = async (banner: Banner, index: number) => {
    if (!banners || index === banners.length - 1) return;
    const nextBanner = banners[index + 1];
    await Promise.all([
      updateBannerOrder.mutateAsync({
        id: banner.id,
        newOrder: nextBanner.display_order ?? 0,
      }),
      updateBannerOrder.mutateAsync({
        id: nextBanner.id,
        newOrder: banner.display_order ?? 0,
      }),
    ]);
  };

  const filteredBanners = banners?.filter((banner) => {
    if (filterStatus === "active") return banner.is_active;
    if (filterStatus === "inactive") return !banner.is_active;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg uppercase font-bold">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider">Banners</h1>
          <p className="text-muted-foreground mt-2">Gestiona los banners del carrusel principal</p>
        </div>
        <Button onClick={() => handleOpenDialog()} size="lg" className="uppercase">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Banner
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Label className="text-sm uppercase font-bold">Filtrar por estado:</Label>
        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border-2 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="uppercase text-xs font-bold">
              <TableHead>Preview</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Tipo Enlace</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead>Fechas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBanners?.map((banner, index) => (
              <TableRow key={banner.id}>
                <TableCell>
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-20 h-15 object-cover rounded border-2"
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-bold uppercase text-sm">{banner.title}</div>
                    {banner.subtitle && (
                      <div className="text-xs text-muted-foreground">{banner.subtitle}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="uppercase text-xs">
                    {banner.link_type === "none" && "Ninguno"}
                    {banner.link_type === "category" && "Categoría"}
                    {banner.link_type === "product" && "Producto"}
                    {banner.link_type === "external" && "Externo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {banner.is_active ? (
                    <Badge className="bg-green-600 text-white uppercase text-xs">Activo</Badge>
                  ) : (
                    <Badge variant="secondary" className="uppercase text-xs">Inactivo</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{banner.display_order}</span>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMoveUp(banner, index)}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMoveDown(banner, index)}
                        disabled={!banners || index === banners.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs space-y-1">
                    {banner.start_date && (
                      <div>Inicio: {format(new Date(banner.start_date), "dd/MM/yyyy")}</div>
                    )}
                    {banner.end_date && (
                      <div>Fin: {format(new Date(banner.end_date), "dd/MM/yyyy")}</div>
                    )}
                    {!banner.start_date && !banner.end_date && (
                      <div className="text-muted-foreground">Sin fechas</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(banner)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setBannerToDelete(banner.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl uppercase font-bold">
              {editingBanner ? "Editar Banner" : "Nuevo Banner"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="uppercase text-xs font-bold">
                Título *
              </Label>
              <Input id="title" {...register("title")} placeholder="Ej: Nueva Colección" />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle" className="uppercase text-xs font-bold">
                Subtítulo
              </Label>
              <Input
                id="subtitle"
                {...register("subtitle")}
                placeholder="Ej: Descubre las últimas tendencias"
              />
              {errors.subtitle && (
                <p className="text-xs text-destructive">{errors.subtitle.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="uppercase text-xs font-bold">
                Imagen * (JPG, PNG, WebP - Max 5MB)
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2 border-2 rounded-lg p-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
              )}
              {errors.image_url && (
                <p className="text-xs text-destructive">{errors.image_url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="link_type" className="uppercase text-xs font-bold">
                Tipo de Enlace
              </Label>
              <Select
                value={linkType}
                onValueChange={(value: any) => setValue("link_type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguno</SelectItem>
                  <SelectItem value="category">Categoría</SelectItem>
                  <SelectItem value="product">Producto</SelectItem>
                  <SelectItem value="external">URL Externa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {linkType === "category" && (
              <div className="space-y-2">
                <Label htmlFor="link_value" className="uppercase text-xs font-bold">
                  Categoría *
                </Label>
                <Select
                  value={watch("link_value")}
                  onValueChange={(value) => setValue("link_value", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {linkType === "product" && (
              <div className="space-y-2">
                <Label htmlFor="link_value" className="uppercase text-xs font-bold">
                  ID del Producto *
                </Label>
                <Input
                  id="link_value"
                  {...register("link_value")}
                  placeholder="Ingresa el ID del producto"
                />
              </div>
            )}

            {linkType === "external" && (
              <div className="space-y-2">
                <Label htmlFor="link_value" className="uppercase text-xs font-bold">
                  URL Externa *
                </Label>
                <Input
                  id="link_value"
                  {...register("link_value")}
                  placeholder="https://ejemplo.com"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="uppercase text-xs font-bold">
                  Fecha de Inicio
                </Label>
                <Input id="start_date" type="date" {...register("start_date")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date" className="uppercase text-xs font-bold">
                  Fecha de Fin
                </Label>
                <Input id="end_date" type="date" {...register("end_date")} />
                {errors.end_date && (
                  <p className="text-xs text-destructive">{errors.end_date.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order" className="uppercase text-xs font-bold">
                Orden de Visualización
              </Label>
              <Input
                id="display_order"
                type="number"
                {...register("display_order", { valueAsNumber: true })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={watch("is_active")}
                onCheckedChange={(checked) => setValue("is_active", checked)}
              />
              <Label htmlFor="is_active" className="uppercase text-xs font-bold">
                Banner Activo
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createBanner.isPending || updateBanner.isPending}
              >
                {editingBanner ? "Guardar Cambios" : "Crear Banner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase font-bold">
              ¿Eliminar Banner?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El banner será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
