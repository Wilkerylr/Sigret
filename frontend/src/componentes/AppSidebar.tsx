import { useNavigate, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/componentes/ui/sidebar"
import { useAuthContext, type UserRole, type Permission } from "@/context/AuthContext"
import type { ComponentType } from "react"
import { 
  ChartArea, 
  Search, 
  StickyNotePlus,
  DatabaseSearch,
  UserSearch,
  LogOut,
 } from "lucide-react"
import "./AppSidebar.css"

interface MenuItem {
  title: string;
  icon: ComponentType;
  path: string;
  allowedRoles: UserRole[];
  /** Permiso individual requerido para ver este menú (nuevo sistema dinámico) */
  requiredPermission?: Permission;
}

const menuItems: MenuItem[] = [
  {
    title: "Inicio",
    icon: ChartArea,
    path: "/home",
    allowedRoles: ["admin", "tecnico", "administrativo"],
    requiredPermission: "view-estadisticas",
  },
  {
    title: "Registrar Reportes",
    icon: StickyNotePlus,
    path: "/home/registro-reportes",
    allowedRoles: ["admin", "administrativo"],
    requiredPermission: "view-registro-reportes",
  },
  {
    title: "Búsqueda de Reportes",
    icon: Search,
    path: "/home/busqueda-reportes",
    allowedRoles: ["admin", "tecnico", "administrativo"],
    requiredPermission: "view-busqueda-reportes",
  },
  {
    title: "Gestión de Registros",
    icon: DatabaseSearch,
    path: "/home/gestion-registros",
    allowedRoles: ["admin", "administrativo"],
    requiredPermission: "view-gestion-registros",
  },
  {
    title: "Gestión de Usuarios",
    icon: UserSearch,
    path: "/home/gestion-usuarios",
    allowedRoles: ["admin"],
    requiredPermission: "view-gestion-usuarios",
  },
]

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthContext();

  // Filtrar items según rol del usuario Y permisos individuales
  const filteredItems = menuItems.filter(
    (item) =>
      user &&
      item.allowedRoles.includes(user.role) &&
      (item.requiredPermission
        ? user.permissions.includes(item.requiredPermission)
        : true)
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Sidebar className="sidebar-container">
      <SidebarHeader className="sidebar-header">Sigret</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="sidebar-group-label">
            {user ? `Bienvenido, ${user.username}` : "Navegación"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
          <SidebarMenu>
            {filteredItems.map((item) => (
              <SidebarMenuItem key={item.path} className="sidebar-menu-item">
                <SidebarMenuButton
                  isActive={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  tooltip={item.title}
                  className={`sidebar-menu-button${location.pathname === item.path ? " active" : ""}`}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="sidebar-footer">
        <SidebarMenu>
          <SidebarMenuItem className="sidebar-menu-item sidebar-logout-item">
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Cerrar sesión"
              className="sidebar-menu-button sidebar-logout-button"
            >
              <LogOut />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function CustomTrigger() {
  const { toggleSidebar } = useSidebar()
 
  return <button onClick={toggleSidebar}>Toggle Sidebar</button>
}