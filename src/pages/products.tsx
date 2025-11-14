import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, Upload, Star, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCategories,
} from "@/hooks/use-products";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Product, ProductWithRelations } from "@/types/database";
import {
  useUploadProductImage,
  useDeleteProductImage,
  useSetPrimaryImage,
} from "@/hooks/use-product-images";

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const uploadImage = useUploadProductImage();
  const deleteImage = useDeleteProductImage();
  const setPrimary = useSetPrimaryImage();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    regular_price: "",
    sale_price: "",
    stock_quantity: "",
    category_id: "",
    brand: "",
    sku: "",
    slug: "",
    is_featured: false,
    status: "active",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      regular_price: "",
      sale_price: "",
      stock_quantity: "",
      category_id: "",
      brand: "",
      sku: "",
      slug: "",
      is_featured: false,
      status: "active",
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: ProductWithRelations) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      regular_price: product.regular_price.toString(),
      sale_price: product.sale_price?.toString() || "",
      stock_quantity: product.stock_quantity?.toString() || "0",
      category_id: product.category_id || "",
      brand: product.brand || "",
      sku: product.sku,
      slug: product.slug,
      is_featured: product.is_featured || false,
      status: product.status || "active",
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !editingProduct) return;
    
    const file = e.target.files[0];
    await uploadImage.mutateAsync({ productId: editingProduct.id, file });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (confirm("¿Eliminar esta imagen?")) {
      await deleteImage.mutateAsync(imageId);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!editingProduct) return;
    await setPrimary.mutateAsync({ imageId, productId: editingProduct.id });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Generar slug si está vacío
    const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-");
    const sku = formData.sku || `SKU-${Date.now()}`;

    const productData = {
      name: formData.name,
      description: formData.description,
      regular_price: parseFloat(formData.regular_price),
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      category_id: formData.category_id || null,
      brand: formData.brand || null,
      sku,
      slug,
      is_featured: formData.is_featured,
      status: formData.status,
    };

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          updates: productData,
        });
      } else {
        await createProduct.mutateAsync(productData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      await deleteProduct.mutateAsync(id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-tight">Productos</h1>
          <p className="mt-2 text-muted-foreground">
            Gestiona el catálogo de productos
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 uppercase">
              <Plus className="h-4 w-4" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto border-2">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold uppercase">
                {editingProduct ? "Editar Producto" : "Crear Producto"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="uppercase">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="uppercase">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              {editingProduct && (
                <div className="space-y-3 border-2 border-border p-4">
                  <Label className="uppercase text-sm font-bold">Imágenes</Label>
                  
                  {editingProduct.product_images && editingProduct.product_images.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3">
                      {editingProduct.product_images
                        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                        .map((img) => (
                          <div
                            key={img.id}
                            className="relative group border-2 border-border"
                            style={{ borderRadius: "2px" }}
                          >
                            <img
                              src={img.image_url}
                              alt={img.alt_text || "Product"}
                              className="w-full h-20 object-cover"
                            />
                            {img.is_primary && (
                              <div className="absolute top-1 left-1 bg-primary text-primary-foreground px-1 py-0.5 text-xs uppercase">
                                Principal
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                              {!img.is_primary && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleSetPrimary(img.id)}
                                >
                                  <Star className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="h-7 w-7 p-0"
                                onClick={() => handleDeleteImage(img.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center border-2 border-dashed border-border p-6 text-muted-foreground">
                      <div className="text-center">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm uppercase">Sin imágenes</p>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2 uppercase border-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadImage.isPending}
                  >
                    <Upload className="h-4 w-4" />
                    {uploadImage.isPending ? "Subiendo..." : "Subir Imagen"}
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="regular_price" className="uppercase">Precio Regular *</Label>
                  <Input
                    id="regular_price"
                    type="number"
                    step="0.01"
                    value={formData.regular_price}
                    onChange={(e) => setFormData({ ...formData, regular_price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sale_price" className="uppercase">Precio Oferta</Label>
                  <Input
                    id="sale_price"
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stock_quantity" className="uppercase">Stock *</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="brand" className="uppercase">Marca</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category" className="uppercase">Categoría</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_featured: checked as boolean })
                  }
                />
                <Label htmlFor="is_featured" className="uppercase">Destacado</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 uppercase">
                  {editingProduct ? "Actualizar" : "Crear"} Producto
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-sm border-2">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2">
              <TableHead className="font-bold uppercase">Imagen</TableHead>
              <TableHead className="font-bold uppercase">Nombre</TableHead>
              <TableHead className="font-bold uppercase">Precio Regular</TableHead>
              <TableHead className="font-bold uppercase">Precio Oferta</TableHead>
              <TableHead className="font-bold uppercase">Stock</TableHead>
              <TableHead className="font-bold uppercase">Estado</TableHead>
              <TableHead className="font-bold uppercase text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : products?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No hay productos
                </TableCell>
              </TableRow>
            ) : (
              products?.map((product) => {
                const primaryImage = product.product_images?.find(img => img.is_primary);
                return (
                  <TableRow key={product.id} className="border-b">
                    <TableCell>
                      {primaryImage ? (
                        <img
                          src={primaryImage.image_url}
                          alt={primaryImage.alt_text || product.name}
                          className="w-20 h-20 object-cover border-2 border-border"
                          style={{ borderRadius: "2px" }}
                        />
                      ) : (
                        <div className="w-20 h-20 border-2 border-dashed border-border flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{formatCurrency(Number(product.regular_price))}</TableCell>
                  <TableCell>
                    {product.sale_price
                      ? formatCurrency(Number(product.sale_price))
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.stock_quantity! > 0 ? "default" : "destructive"}>
                      {product.stock_quantity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status === "active" ? "default" : "secondary"}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
