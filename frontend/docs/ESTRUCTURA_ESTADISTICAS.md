# 📊 Estructura de Estadísticas (Gráficos)

> **Versión:** 1.0  
> **Última actualización:** Junio 2026

---

## 📂 Estructura de Archivos

```
src/
├── componentes/
│   ├── ui/
│   │   ├── card.tsx              ← Componente Card de shadcn/ui (contenedor con bordes y sombra)
│   │   ├── chart.tsx             ← Componente Chart de shadcn/ui (gráficos con Recharts)
│   │   └── select.tsx            ← Componente Select de shadcn/ui (filtro de período)
│   │
│   └── estadisticas/
│       ├── estadisticas.css      ← Estilos propios de la página de estadísticas
│       ├── components/
│       │   ├── index.ts          ← Exporta todos los componentes de estadísticas
│       │   └── GraficoReportes.tsx  ← Gráfico de área interactivo: Reportes por período
│       │   └── ... (futuros gráficos)
│       │
│       └── ... (hooks, utils, types si se necesitan en el futuro)
│
└── pages/
    └── Estadisticas_page.tsx     ← Página de inicio/estadísticas
```

---

## 🧩 Componentes Instalados

### `ui/card.tsx`
Componente base de shadcn/ui que provee una tarjeta con diseño consistente. Exporta:
- `Card` - Contenedor principal
- `CardHeader` - Encabezado de la tarjeta
- `CardTitle` - Título
- `CardDescription` - Descripción
- `CardContent` - Contenido
- `CardFooter` - Pie

### `ui/chart.tsx`
Componente base de shadcn/ui que envuelve la librería **Recharts**. Exporta:
- `ChartContainer` - Contenedor que conecta los datos con Recharts
- `ChartTooltip` y `ChartTooltipContent` - Tooltip interactivo
- `ChartLegend` y `ChartLegendContent` - Leyenda del gráfico
- `ChartStyle` - Estilos dinámicos por CSS variables
- `ChartConfig` - Tipo para configurar colores y etiquetas

---

## 📊 Gráfico Actual

### `GraficoReportes.tsx`

**Tipo:** Gráfico de barras (BarChart)

**Datos:** Muestra reportes por mes (simulados actualmente).
```typescript
const datosReportes = [
  { mes: "Enero", reportes: 45 },
  { mes: "Febrero", reportes: 38 },
  // ...
]
```

**Configuración visual:**
- Usa `var(--color-fondo-oscuro)` como color de las barras (herencia de Global.css)
- Tooltip interactivo al pasar el mouse
- Ejes X (meses) y Y (cantidad) sin líneas decorativas
- Bordes redondeados en las barras

---

## 🔧 Cómo agregar un nuevo gráfico

1. Crear el componente en `componentes/estadisticas/components/`:
```typescript
// Ej: componentes/estadisticas/components/GraficoTecnicos.tsx
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/componentes/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/componentes/ui/chart"

const GraficoTecnicos: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reportes por Técnico</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{...}}>
          {/* Tu gráfico de Recharts aquí */}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
export default GraficoTecnicos
```

2. Exportarlo en `components/index.ts`:
```typescript
export { default as GraficoReportes } from "./GraficoReportes"
export { default as GraficoTecnicos } from "./GraficoTecnicos"  // ← nuevo
```

3. Agregarlo a la página `Estadisticas_page.tsx`:
```tsx
import { GraficoReportes, GraficoTecnicos } from "@/componentes/estadisticas/components"
// ...
<GraficoTecnicos />
```

---

## 📦 Dependencias

- **recharts** - Librería de gráficos para React (ya incluida en `package.json`)
- **shadcn/ui** - Componentes base (`card.tsx` y `chart.tsx`)

Para verificar que recharts está instalado:
```bash
npm list recharts --prefix frontend
```

Si no está, instalarlo:
```bash
npm install recharts --prefix frontend
```

---

## 🎨 Personalización de Colores

Los colores de los gráficos se definen en la configuración `ChartConfig`:

```typescript
const chartConfig: ChartConfig = {
  reportes: {
    label: "Reportes",
    color: "var(--color-fondo-oscuro)",  // Usa variable global
  },
}
```

Si se usan colores por tema (light/dark), se puede usar `theme` en lugar de `color`:
```typescript
const chartConfig: ChartConfig = {
  reportes: {
    label: "Reportes",
    theme: {
      light: "#021F54",  // Color en modo claro
      dark: "#D4E3FC",   // Color en modo oscuro
    },
  },
}
```

---

## 📐 Layout de la Página

La página `Estadisticas_page.tsx` usa un grid responsive:
```tsx
<div className="grid gap-6 md:grid-cols-2">
  {/* md:grid-cols-2 = 2 columnas en pantallas medianas+ */}
  {/* 1 columna en móviles */}
  <GraficoReportes />
</div>
```

Esto significa que los gráficos se apilan verticalmente en móvil y se colocan en 2 columnas en desktop.