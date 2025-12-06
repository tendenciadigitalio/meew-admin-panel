import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Cloud, FolderOpen, Palette } from "lucide-react";
import { MenuIconsTab } from "@/components/app-mods/menu-icons-tab";
import { UploadFilesTab } from "@/components/app-mods/upload-files-tab";
import { MyAssetsTab } from "@/components/app-mods/my-assets-tab";
import { AppBrandingTab } from "@/components/app-mods/app-branding-tab";

export default function AppMods() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">App Mods</h1>
        <p className="text-muted-foreground">
          Gestiona iconos y assets de la aplicación
        </p>
      </div>

      <Tabs defaultValue="menu-icons" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="menu-icons" className="gap-2">
            <Smartphone className="h-4 w-4" />
            Iconos del Menú
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2">
            <Palette className="h-4 w-4" />
            App Branding
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Cloud className="h-4 w-4" />
            Subir Archivos
          </TabsTrigger>
          <TabsTrigger value="assets" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            Mis Assets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="menu-icons" className="mt-6">
          <MenuIconsTab />
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <AppBrandingTab />
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <UploadFilesTab />
        </TabsContent>

        <TabsContent value="assets" className="mt-6">
          <MyAssetsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}