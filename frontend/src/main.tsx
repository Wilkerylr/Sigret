import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import queryClient from "./lib/queryClient";
import { ProtectedRoute } from "./componentes/ProtectedRoute";
import "./componentes/Global.css"
import EstadisticasPage from "./pages/Estadisticas_page.tsx"
import BusquedaReportesPage from './pages/Busqueda_reportes_page.tsx'
import LoginPage from './pages/Login_page.tsx'
import PrimerLoginPage from './pages/PrimerLogin_page.tsx'
import Layout from "./componentes/layout/mainlayout.tsx";
import RegistroReportesPage from "./pages/Registro_reportes.tsx";
import GestionRegistrosPage from "./pages/Gestion_registros.tsx";
import GestionUsuariosPage from "./pages/Gestion_usuarios.tsx";

// Define las rutas de la aplicación
const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/primer-login",
    element: (
      <ProtectedRoute
        allowedRoles={["admin", "tecnico", "administrativo"]}
      >
        <PrimerLoginPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute
          allowedRoles={["admin", "tecnico", "administrativo"]}
          requiredPermissions={["view-estadisticas"]}
        >
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute
              allowedRoles={["admin", "tecnico", "administrativo"]}
              requiredPermissions={["view-estadisticas"]}
            >
            <EstadisticasPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "busqueda-reportes",
        element: (
          <ProtectedRoute
              allowedRoles={["admin", "tecnico", "administrativo"]}
              requiredPermissions={["view-busqueda-reportes"]}
            >
            <BusquedaReportesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "registro-reportes",
        element: (
          <ProtectedRoute
              allowedRoles={["admin", "administrativo"]}
              requiredPermissions={["view-registro-reportes"]}
            >
            <RegistroReportesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "gestion-registros",
        element: (
          <ProtectedRoute
              allowedRoles={["admin", "administrativo"]}
              requiredPermissions={["view-gestion-registros"]}
            >
            <GestionRegistrosPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "gestion-usuarios",
        element: (
          <ProtectedRoute
              allowedRoles={["admin"]}
              requiredPermissions={["view-gestion-usuarios"]}
            >
            <GestionUsuariosPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <LoginPage />
      }
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);