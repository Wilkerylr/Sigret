# SGRT - Sistema de Gestión de Reportes Técnicos

Monorepo del proyecto SGRT, un sistema para la gestión de reportes técnicos.

## Estructura del proyecto

```
Sgrt/
├── frontend/          # Frontend en React + Vite + TypeScript
│   ├── src/
│   │   ├── componentes/   # Componentes reutilizables
│   │   ├── pages/         # Páginas de la aplicación
│   │   └── ...
│   └── ...
├── backend/           # Backend en Node.js + Express + TypeScript
│   ├── src/
│   │   └── index.ts       # Punto de entrada del servidor
│   └── ...
└── .gitignore
```

## Requisitos

- Node.js >= 20
- npm >= 10

## Instalación

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## Scripts disponibles

### Frontend
- `npm run dev` - Inicia servidor de desarrollo (Vite)
- `npm run build` - Compila y construye para producción
- `npm run lint` - Ejecuta linter

### Backend
- `npm run dev` - Inicia servidor con hot-reload (tsx watch)
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Inicia servidor en producción
- `npm run lint` - Ejecuta linter