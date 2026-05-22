import { Outlet } from "react-router-dom";
import { AppSidebar } from "../AppSidebar";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import "./mainlayout.css";

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="main-content">
        <div className="main-toolbar">
          <SidebarTrigger className="sidebar-trigger-custom" />
        </div>
        <div className="main-outlet">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
