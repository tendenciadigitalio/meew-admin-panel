import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Cloud, X, Upload, Copy, Check } from "lucide-react";
import { useUploadFile } from "@/hooks/use-cloud-files";
import { toast } from "@/hooks/use-toast";

interface FileWithPreview extends File {
  preview?: string;
  progress?: number;
}

interface UploadedFile {
  name: string;
  url: string;
  thumbnail?: string;
}

export function UploadFilesTab() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [category, setCategory] = useState("images");
  const [saveToDatabase, setSaveToDatabase] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showUrlsModal, setShowUrlsModal] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const uploadFile = useUploadFile();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file) => {
      // Validate file type
      const validTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/svg+xml",
        "image/gif",
        "video/mp4",
        "video/quicktime",
        "application/pdf",
      ];

      if (!validTypes.includes(file.type)) {
        toast({
          title: "Tipo de archivo no válido",
          description: `${file.name} no es un tipo de archivo permitido`,
          variant: "destructive",
        });
        return false;
      }

      // Validate file size (50 MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: `${file.name} supera el tamaño máximo de 50 MB`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    const filesWithPreview = validFiles.map((file) => {
      const fileWithPreview = file as FileWithPreview;
      if (file.type.startsWith("image/")) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }
      fileWithPreview.progress = 0;
      return fileWithPreview;
    });

    setFiles((prev) => [...prev, ...filesWithPreview]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".svg", ".gif"],
      "video/*": [".mp4", ".mov"],
      "application/pdf": [".pdf"],
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const results: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // Update progress
        setFiles((prev) => {
          const newFiles = [...prev];
          newFiles[i].progress = 50;
          return newFiles;
        });

        const result = await uploadFile.mutateAsync({
          file,
          category,
          saveToDatabase,
        });

        // Update progress
        setFiles((prev) => {
          const newFiles = [...prev];
          newFiles[i].progress = 100;
          return newFiles;
        });

        results.push({
          name: result.fileName,
          url: result.publicUrl,
          thumbnail: file.preview,
        });
      } catch (error: any) {
        toast({
          title: "Error al subir archivo",
          description: `${file.name}: ${error.message}`,
          variant: "destructive",
        });
      }
    }

    setUploading(false);
    setUploadedFiles(results);
    setFiles([]);
    setShowUrlsModal(true);

    toast({
      title: "Archivos subidos",
      description: `${results.length} archivo(s) subido(s) correctamente`,
    });
  };

  const copyUrl = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: "URL copiada",
      description: "La URL se copió al portapapeles",
    });
  };

  const copyAllUrls = () => {
    const urls = uploadedFiles
      .map((file) => `- [${file.name}](${file.url})`)
      .join("\n");
    navigator.clipboard.writeText(urls);
    toast({
      title: "URLs copiadas",
      description: "Todas las URLs se copiaron al portapapeles",
    });
  };

  const getFileIcon = (file: FileWithPreview) => {
    if (file.type.startsWith("image/")) {
      return file.preview ? (
        <img
          src={file.preview}
          alt={file.name}
          className="w-12 h-12 object-cover rounded"
        />
      ) : (
        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xs">
          IMG
        </div>
      );
    }
    if (file.type.startsWith("video/")) {
      return (
        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xs">
          VIDEO
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xs">
        PDF
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Drag & Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-border"
        }`}
      >
        <input {...getInputProps()} />
        <Cloud className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">
          {isDragActive
            ? "Suelta los archivos aquí"
            : "Arrastra archivos aquí o haz click para seleccionar"}
        </p>
        <p className="text-sm text-muted-foreground">
          PNG, JPG, SVG, GIF, MP4, MOV, PDF • Máximo 50 MB por archivo
        </p>
      </div>

      {/* Files Queue */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            Archivos en cola ({files.length})
          </h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {file.progress !== undefined && file.progress > 0 && (
                    <Progress value={file.progress} className="mt-2" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Options */}
      <div className="space-y-4 rounded-lg border p-6">
        <h3 className="text-lg font-medium">Opciones de subida</h3>

        <div className="space-y-2">
          <Label>Carpeta destino</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="images">📷 Imágenes</SelectItem>
              <SelectItem value="videos">🎥 Videos</SelectItem>
              <SelectItem value="docs">📄 Documentos</SelectItem>
              <SelectItem value="misc">📦 Otros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="save-db"
            checked={saveToDatabase}
            onCheckedChange={(checked) => setSaveToDatabase(checked as boolean)}
          />
          <Label htmlFor="save-db" className="cursor-pointer">
            Guardar registro en base de datos
          </Label>
        </div>
      </div>

      {/* Upload Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          size="lg"
        >
          {uploading ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-pulse" />
              Subiendo archivos...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Subir {files.length} archivo(s)
            </>
          )}
        </Button>
      </div>

      {/* URLs Modal */}
      <Dialog open={showUrlsModal} onOpenChange={setShowUrlsModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>URLs Generadas</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                {file.thumbnail && (
                  <img
                    src={file.thumbnail}
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="font-medium truncate">{file.name}</p>
                  <div className="flex gap-2">
                    <Input value={file.url} readOnly className="text-sm" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyUrl(file.url, index)}
                    >
                      {copiedIndex === index ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowUrlsModal(false)}>
              Cerrar
            </Button>
            <Button onClick={copyAllUrls}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar todas las URLs
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
