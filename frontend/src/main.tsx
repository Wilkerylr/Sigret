import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import { ProtectedRoute } from "./componentes/ProtectedRoute.tsx";
import "./componentes/Global.css"
import EstadisticasPage from "./pages/Estadisticas_page.tsx"
import BusquedaReportesPage from './pages/Busqueda_reportes_page.tsx'
import LoginPage from './pages/Login_page.tsx'
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
    path: "/home",
    element: (
      <ProtectedRoute allowedRoles={["admin", "tecnico", "administrativo"]}>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={["admin", "tecnico", "administrativo"]}>
            <EstadisticasPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "busqueda-reportes",
        element: (
          <ProtectedRoute allowedRoles={["admin", "tecnico", "administrativo"]}>
            <BusquedaReportesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "registro-reportes",
        element: (
          <ProtectedRoute allowedRoles={["admin", "administrativo"]}>
            <RegistroReportesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "gestion-registros",
        element: (
          <ProtectedRoute allowedRoles={["admin", "administrativo"]}>
            <GestionRegistrosPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "gestion-usuarios",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
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
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);