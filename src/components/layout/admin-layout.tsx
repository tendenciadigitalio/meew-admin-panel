import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";

export function AdminLayout() {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        {/* Top Header Bar - 72px height */}
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-gray-200 bg-white px-8">
          <h2 className="page-header">MEEW Admin Panel</h2>
          
          {/* Future: Search, notifications, user menu */}
          <div className="flex items-center gap-4">
            {/* Placeholder for search and other header actions */}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="container mx-auto p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
