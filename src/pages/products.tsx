import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, Upload, Star, X, Image as ImageIcon, Palette, Search, ImageOff, Package, GripVertical } from "lucide-react";
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
  useReorderImages,
} from "@/hooks/use-product-images";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useProductVariants,
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
  useBulkCreateVariants,
} from "@/hooks/use-product-variants";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const uploadImage = useUploadProductImage();
  const deleteImage = useDeleteProductImage();
  const setPrimary = useSetPrimaryImage();
  const reorderImages = useReorderImages();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);
  const [activeTab, setActiveTab] = useState("info");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: variants } = useProductVariants(editingProduct?.id || null);
  const createVariant = useCreateVariant();
  const updateVariant = useUpdateVariant();
  const deleteVariant = useDeleteVariant();
  const bulkCreateVariants = useBulkCreateVariants();

  // Variant states
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [bulkVariantDialogOpen, setBulkVariantDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any | null>(null);
  const [variantFormData, setVariantFormData] = useState({
    size: "",
    color_name: "",
    color_hex: "#000000",
    stock_quantity: "0",
    price_override: "",
  });

  // Bulk variant states
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<Array<{ name: string; hex: string }>>([]);
  const [bulkStockQuantity, setBulkStockQuantity] = useState("10");

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
    setActiveTab("info");
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
    setActiveTab("info");
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
    if (!editingProduct) return;
    if (confirm("¿Eliminar esta imagen?")) {
      await deleteImage.mutateAsync({ imageId, productId: editingProduct.id });
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!editingProduct) return;
    await setPrimary.mutateAsync({ imageId, productId: editingProduct.id });
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !editingProduct) return;

    const items = Array.from(editingProduct.product_images || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display_order for all images
    const updates = items.map((img, index) => ({
      imageId: img.id,
      newOrder: index,
    }));

    await reorderImages.mutateAsync(updates);
  };

  // Variant handlers
  const resetVariantForm = () => {
    setVariantFormData({
      size: "",
      color_name: "",
      color_hex: "#000000",
      stock_quantity: "0",
      price_override: "",
    });
    setEditingVariant(null);
  };

  const handleEditVariant = (variant: any) => {
    setEditingVariant(variant);
    setVariantFormData({
      size: variant.size || "",
      color_name: variant.color_name || "",
      color_hex: variant.color_hex || "#000000",
      stock_quantity: variant.stock_quantity?.toString() || "0",
      price_override: variant.price_override?.toString() || "",
    });
    setVariantDialogOpen(true);
  };

  const handleSubmitVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const variantData = {
      product_id: editingProduct.id,
      size: variantFormData.size || null,
      color_name: variantFormData.color_name || null,
      color_hex: variantFormData.color_hex || null,
      stock_quantity: parseInt(variantFormData.stock_quantity) || 0,
      price_override: variantFormData.price_override ? parseFloat(variantFormData.price_override) : null,
    };

    if (editingVariant) {
      await updateVariant.mutateAsync({
        id: editingVariant.id,
        productId: editingProduct.id,
        updates: variantData,
      });
    } else {
      await createVariant.mutateAsync(variantData);
    }

    setVariantDialogOpen(false);
    resetVariantForm();
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!editingProduct || !confirm("¿Eliminar esta variante?")) return;
    await deleteVariant.mutateAsync({ id: variantId, productId: editingProduct.id });
  };

  const handleBulkCreateVariants = async () => {
    if (!editingProduct || selectedSizes.length === 0 || selectedColors.length === 0) return;

    const variants = selectedSizes.flatMap(size =>
      selectedColors.map(color => ({
        size,
        color_name: color.name,
        color_hex: color.hex,
        stock_quantity: parseInt(bulkStockQuantity) || 0,
        price_override: null,
      }))
    );

    await bulkCreateVariants.mutateAsync({
      productId: editingProduct.id,
      variants,
    });

    setBulkVariantDialogOpen(false);
    setSelectedSizes([]);
    setSelectedColors([]);
    setBulkStockQuantity("10");
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

  // Filter products
  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || product.category_id === filterCategory;
    const matchesStatus = filterStatus === "all" || product.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setFilterCategory("all");
    setFilterStatus("all");
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-2">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold uppercase">
                {editingProduct ? "Editar Producto" : "Crear Producto"}
              </DialogTitle>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 border-2">
                <TabsTrigger value="info" className="uppercase">Información Básica</TabsTrigger>
                <TabsTrigger value="images" className="uppercase" disabled={!editingProduct}>
                  Imágenes
                </TabsTrigger>
                <TabsTrigger value="variants" className="uppercase" disabled={!editingProduct}>
                  Variantes {variants && variants.length > 0 && `(${variants.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4">
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
              </TabsContent>

              <TabsContent value="images" className="mt-4">
                {editingProduct && (
                  <div className="space-y-3 border-2 border-border p-4">
                    <Label className="uppercase text-sm font-bold">Imágenes del Producto</Label>
                    
                    {editingProduct.product_images && editingProduct.product_images.length > 0 ? (
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="images" direction="horizontal">
                          {(provided) => (
                            <div 
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="grid grid-cols-4 gap-3"
                            >
                              {editingProduct.product_images
                                .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                                .map((img, index) => (
                                  <Draggable key={img.id} draggableId={img.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`relative group border-2 border-border ${
                                          snapshot.isDragging ? "opacity-50" : ""
                                        }`}
                                        style={{ 
                                          borderRadius: "2px",
                                          ...provided.draggableProps.style,
                                        }}
                                      >
                                        <div 
                                          {...provided.dragHandleProps}
                                          className="absolute top-1 right-1 cursor-move z-10 bg-background/80 rounded p-1"
                                        >
                                          <GripVertical className="h-4 w-4" />
                                        </div>
                                        
                                        <Badge 
                                          variant="secondary" 
                                          className="absolute top-1 right-8 text-xs"
                                        >
                                          {index + 1}
                                        </Badge>

                                        <img
                                          src={img.image_url}
                                          alt={img.alt_text || "Product"}
                                          className="w-full h-20 object-cover"
                                        />
                                        
                                        {img.is_primary && (
                                          <Badge 
                                            className="absolute bottom-1 left-1 bg-green-600 text-white text-xs uppercase hover:bg-green-700"
                                          >
                                            <Star className="h-3 w-3 mr-1" />
                                            Principal
                                          </Badge>
                                        )}
                                        
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                          {!img.is_primary && (
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant="outline"
                                              className="h-8 px-2 text-xs"
                                              onClick={() => handleSetPrimary(img.id)}
                                            >
                                              <Star className="h-3 w-3 mr-1" />
                                              Marcar
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
                                    )}
                                  </Draggable>
                                ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
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
              </TabsContent>

              <TabsContent value="variants" className="mt-4">
                {editingProduct && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2 uppercase border-2"
                        onClick={() => {
                          resetVariantForm();
                          setVariantDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Nueva Variante
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2 uppercase border-2"
                        onClick={() => setBulkVariantDialogOpen(true)}
                      >
                        <Palette className="h-4 w-4" />
                        Generar Variantes en Masa
                      </Button>
                    </div>

                    {variants && variants.length > 0 ? (
                      <div className="border-2 border-border">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-b-2">
                              <TableHead className="font-bold uppercase">Talla</TableHead>
                              <TableHead className="font-bold uppercase">Color</TableHead>
                              <TableHead className="font-bold uppercase">Stock</TableHead>
                              <TableHead className="font-bold uppercase">Precio Adicional</TableHead>
                              <TableHead className="font-bold uppercase text-right">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {variants.map((variant) => (
                              <TableRow key={variant.id} className="border-b">
                                <TableCell className="font-medium">
                                  {variant.size || "-"}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {variant.color_hex && (
                                      <div
                                        className="w-5 h-5 border-2 border-border"
                                        style={{ 
                                          backgroundColor: variant.color_hex,
                                          borderRadius: "2px"
                                        }}
                                      />
                                    )}
                                    <span>{variant.color_name || "-"}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={variant.stock_quantity! > 0 ? "default" : "destructive"}>
                                    {variant.stock_quantity}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {variant.price_override ? formatCurrency(Number(variant.price_override)) : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditVariant(variant)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteVariant(variant.id)}
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
                    ) : (
                      <div className="flex items-center justify-center border-2 border-dashed border-border p-8 text-muted-foreground">
                        <div className="text-center">
                          <Palette className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm uppercase">Sin variantes</p>
                          <p className="text-xs mt-1">Crea variantes individuales o en masa</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Variant Dialog */}
        <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto border-2">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold uppercase">
                {editingVariant ? "Editar Variante" : "Nueva Variante"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitVariant} className="space-y-4">
              <div>
                <Label htmlFor="variant-size" className="uppercase">Talla</Label>
                <Input
                  id="variant-size"
                  placeholder="Ej: XS, S, M, L, XL"
                  value={variantFormData.size}
                  onChange={(e) => setVariantFormData({ ...variantFormData, size: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="variant-color-name" className="uppercase">Nombre Color</Label>
                <Input
                  id="variant-color-name"
                  placeholder="Ej: Negro, Blanco, Azul"
                  value={variantFormData.color_name}
                  onChange={(e) => setVariantFormData({ ...variantFormData, color_name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="variant-color-hex" className="uppercase">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="variant-color-hex"
                    type="color"
                    value={variantFormData.color_hex}
                    onChange={(e) => setVariantFormData({ ...variantFormData, color_hex: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={variantFormData.color_hex}
                    onChange={(e) => setVariantFormData({ ...variantFormData, color_hex: e.target.value })}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="variant-stock" className="uppercase">Stock *</Label>
                  <Input
                    id="variant-stock"
                    type="number"
                    value={variantFormData.stock_quantity}
                    onChange={(e) => setVariantFormData({ ...variantFormData, stock_quantity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="variant-price" className="uppercase">Precio Adicional</Label>
                  <Input
                    id="variant-price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={variantFormData.price_override}
                    onChange={(e) => setVariantFormData({ ...variantFormData, price_override: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1 uppercase" onClick={() => setVariantDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 uppercase">
                  {editingVariant ? "Actualizar" : "Crear"} Variante
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Bulk Variant Dialog */}
        <Dialog open={bulkVariantDialogOpen} onOpenChange={setBulkVariantDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold uppercase">
                Generar Variantes en Masa
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label className="uppercase font-bold mb-3 block">Selecciona Tallas</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["XS", "S", "M", "L", "XL", "2XL"].map((size) => (
                    <div key={size} className="flex items-center gap-2">
                      <Checkbox
                        id={`size-${size}`}
                        checked={selectedSizes.includes(size)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSizes([...selectedSizes, size]);
                          } else {
                            setSelectedSizes(selectedSizes.filter(s => s !== size));
                          }
                        }}
                      />
                      <Label htmlFor={`size-${size}`} className="uppercase cursor-pointer">
                        {size}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="uppercase font-bold mb-3 block">Selecciona Colores</Label>
                <div className="space-y-2 border-2 border-border p-3">
                  {[
                    { name: "Negro", hex: "#000000" },
                    { name: "Blanco", hex: "#FFFFFF" },
                    { name: "Gris", hex: "#808080" },
                    { name: "Azul", hex: "#0000FF" },
                    { name: "Rojo", hex: "#FF0000" },
                  ].map((color) => (
                    <div key={color.hex} className="flex items-center gap-2 border-b border-border pb-2 last:border-0">
                      <Checkbox
                        id={`color-${color.hex}`}
                        checked={selectedColors.some(c => c.hex === color.hex)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedColors([...selectedColors, color]);
                          } else {
                            setSelectedColors(selectedColors.filter(c => c.hex !== color.hex));
                          }
                        }}
                      />
                      <div
                        className="w-5 h-5 border-2 border-border"
                        style={{ backgroundColor: color.hex, borderRadius: "2px" }}
                      />
                      <Label htmlFor={`color-${color.hex}`} className="flex-1 cursor-pointer">
                        {color.name}
                      </Label>
                      <span className="text-xs text-muted-foreground">{color.hex}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="bulk-stock" className="uppercase">Stock Inicial por Variante *</Label>
                <Input
                  id="bulk-stock"
                  type="number"
                  value={bulkStockQuantity}
                  onChange={(e) => setBulkStockQuantity(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Se crearán {selectedSizes.length} × {selectedColors.length} = {selectedSizes.length * selectedColors.length} variantes
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 uppercase"
                  onClick={() => setBulkVariantDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="flex-1 uppercase"
                  onClick={handleBulkCreateVariants}
                  disabled={selectedSizes.length === 0 || selectedColors.length === 0}
                >
                  Crear {selectedSizes.length * selectedColors.length} Variantes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 items-center border-2 p-4 rounded-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 border-2 uppercase placeholder:normal-case"
          />
        </div>

        <div className="w-48">
          <Label className="uppercase text-xs font-bold mb-2 block">Categoría</Label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="h-10 border-2 uppercase">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories?.filter(cat => cat.is_active).map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <Label className="uppercase text-xs font-bold mb-2 block">Estado</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-10 border-2 uppercase">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={clearFilters} className="h-10 uppercase">
          Limpiar filtros
        </Button>
      </div>

      <div className="rounded-sm border-2">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2">
              <TableHead className="font-bold uppercase">Imagen</TableHead>
              <TableHead className="font-bold uppercase">Nombre</TableHead>
              <TableHead className="font-bold uppercase">Categoría</TableHead>
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
                <TableCell colSpan={8} className="text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : !filteredProducts || filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {searchQuery || filterCategory !== "all" || filterStatus !== "all" 
                    ? "No se encontraron productos" 
                    : "No hay productos"}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                const primaryImage = product.product_images?.find(img => img.is_primary);
                const firstImage = product.product_images?.[0];
                const displayImage = primaryImage || firstImage;
                const hasVariants = product.product_variants && product.product_variants.length > 0;
                const totalStock = hasVariants 
                  ? product.product_variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0)
                  : product.stock_quantity || 0;

                return (
                  <TableRow key={product.id} className="border-b">
                    <TableCell>
                      {displayImage ? (
                        <img
                          src={displayImage.image_url}
                          alt={displayImage.alt_text || product.name}
                          className="w-[60px] h-[60px] object-cover border-2 border-border rounded"
                        />
                      ) : (
                        <div className="w-[60px] h-[60px] border-2 border-border rounded bg-muted flex items-center justify-center">
                          <ImageOff className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      {product.category ? (
                        <Badge variant="outline">{product.category.name}</Badge>
                      ) : (
                        <Badge variant="secondary">-</Badge>
                      )}
                    </TableCell>
                  <TableCell>{formatCurrency(Number(product.regular_price))}</TableCell>
                  <TableCell>
                    {product.sale_price
                      ? formatCurrency(Number(product.sale_price))
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {hasVariants ? (
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="gap-1">
                          <Package className="h-3 w-3" />
                          {product.product_variants.length} variantes
                        </Badge>
                        <Badge variant={totalStock > 0 ? "default" : "destructive"}>
                          Stock: {totalStock}
                        </Badge>
                      </div>
                    ) : (
                      <Badge variant={totalStock > 0 ? "default" : "destructive"}>
                        {totalStock}
                      </Badge>
                    )}
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
