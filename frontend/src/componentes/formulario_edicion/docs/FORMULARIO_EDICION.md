# FormularioEdicion — Componente de Edición Reutilizable

## 📋 Descripción

`FormularioEdicion` es un componente **genérico y configurable** que permite editar o crear cualquier tipo de entidad (reportes, clientes, técnicos, etiquetas, etc.) mediante una configuración declarativa de secciones y campos.

Está diseñado para ser **agnóstico a los datos**, lo que significa que puedes reutilizarlo en cualquier parte del proyecto simplemente definiendo la configuración de los campos que deseas mostrar.

---

## 🚀 Instalación

El componente ya está incluido en el proyecto. Solo debes importarlo:

```tsx
import { FormularioEdicion, CONFIG_REPORTE_RESUMIDO } from '@/componentes/formulario_edicion';
import type { EntidadEditable } from '@/componentes/formulario_edicion';
```

---

## 🧩 Uso Básico

### Editar un reporte desde búsqueda (modal)

```tsx
const [reporteEditar, setReporteEditar] = useState<ReporteResumen | null>(null);

const handleGuardarEdicion = async (datos: EntidadEditable): Promise<boolean> => {
  // Llamar a la API para guardar
  await api.actualizarReporte(datos);
  return true;
};

// En el JSX:
{reporteEditar && (
  <FormularioEdicion
    titulo="Reporte"
    entidad={reporteEditar}
    configuracion={CONFIG_REPORTE_RESUMIDO}
    onGuardar={handleGuardarEdicion}
    onCancelar={() => setReporteEditar(null)}
    modo="editar"
    modal={true}
  />
)}
```

### Crear un nuevo cliente (inline)

```tsx
<FormularioEdicion
  titulo="Cliente"
  entidad={{}}  // vacío para crear
  configuracion={CONFIG_CLIENTE}
  onGuardar={handleCrearCliente}
  onCancelar={handleCancelar}
  modo="crear"
  modal={false}  // inline, sin overlay
/>
```

---

## ⚙️ Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `titulo` | `string` | requerido | Título del formulario |
| `entidad` | `EntidadEditable` | requerido | Datos iniciales (vacío para crear) |
| `configuracion` | `SeccionConfig[]` | requerido | Define secciones y campos |
| `onGuardar` | `(datos) => Promise<boolean>` | requerido | Callback al guardar |
| `onCancelar` | `() => void` | requerido | Callback al cancelar |
| `modo` | `'crear' \| 'editar'` | `'editar'` | Modo del formulario |
| `modal` | `boolean` | `true` | Mostrar como modal overlay |
| `className` | `string` | `''` | Clase CSS adicional |
| `textoGuardar` | `string` | automático | Texto personalizado del botón guardar |
| `textocancelar` | `string` | `'Cancelar'` | Texto del botón cancelar |

---

## 🏗️ Configuración de Campos

### Tipos de campo soportados

| Tipo | Descripción | Props específicas |
|---|---|---|
| `'texto'` | Input de texto simple | `placeholder`, `ancho` |
| `'textarea'` | Área de texto multilínea | `placeholder`, `ancho` |
| `'numero'` | Input numérico | `min`, `max`, `ancho` |
| `'fecha'` | Selector de fecha | `min`, `max`, `ancho` |
| `'hora'` | Selector de hora | `ancho` |
| `'select'` | Select desplegable | `opciones`, `ancho` |
| `'combobox'` | Selector con búsqueda | `opciones`, `placeholder`, `ancho` |
| `'radio'` | Grupo de radio buttons | `opciones`, `ancho` |
| `'lista-items'` | Selector + tags (arrays) | `opciones`, `requerido`, `ancho` |

### Estructura de configuración

```typescript
interface CampoConfig {
  nombre: string;           // Nombre del campo en la entidad
  etiqueta: string;         // Label visible
  tipo: TipoCampo;          // Tipo de campo
  requerido?: boolean;      // Campo obligatorio
  opciones?: Array<{ value: string; label: string }>;  // Para select, combobox, radio, lista-items
  placeholder?: string;     // Placeholder
  ancho?: 'completo' | 'mitad' | 'tercio';  // Ancho del campo
  validacion?: (valor: any, datosCompletos?: EntidadEditable) => string | null;  // Validación personalizada
  min?: string | number;    // Valor mínimo
  max?: string | number;    // Valor máximo
  deshabilitado?: boolean;  // Campo deshabilitado
  dependeDe?: string[];     // Campos de los que depende (para re-validación)
}

interface SeccionConfig {
  titulo: string;           // Título de la sección
  campos: CampoConfig[];   // Campos de la sección
  className?: string;       // Clase CSS adicional
  colapsable?: boolean;     // Si la sección es colapsable
}
```

### Ejemplo de validación personalizada

```typescript
{
  nombre: 'fechaAtencion',
  etiqueta: 'Fecha de Atención',
  tipo: 'fecha',
  requerido: true,
  ancho: 'tercio',
  validacion: (valor, datos) => {
    if (valor && datos?.fechaReporte && valor < datos.fechaReporte) {
      return 'La fecha de atención no puede ser anterior a la fecha de reporte';
    }
    return null;  // null = válido
  },
  dependeDe: ['fechaReporte'],  // Se re-valida al cambiar fechaReporte
}
```

---

## 📦 Configuraciones Predefinidas

El módulo incluye configuraciones listas para usar:

| Constante | Descripción |
|---|---|
| `CONFIG_REPORTE_COMPLETO` | Formulario completo de reporte (5 secciones, 15 campos) |
| `CONFIG_REPORTE_RESUMIDO` | Formulario resumido de reporte (2 secciones, ideal para edición rápida) |
| `CONFIG_CLIENTE` | Formulario de cliente (nombre, RIF, teléfono, dirección, email) |
| `CONFIG_TECNICO` | Formulario de técnico (nombre, especialidad, teléfono) |
| `CONFIG_ETIQUETA` | Formulario de etiqueta (nombre, color, descripción) |

```tsx
import { 
  CONFIG_REPORTE_COMPLETO, 
  CONFIG_REPORTE_RESUMIDO, 
  CONFIG_CLIENTE,
  CONFIG_TECNICO,
  CONFIG_ETIQUETA 
} from '@/componentes/formulario_edicion';
```

También puedes crear tus propias configuraciones:

```tsx
const MI_CONFIG: SeccionConfig[] = [
  {
    titulo: 'Datos Personales',
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true },
      { nombre: 'edad', etiqueta: 'Edad', tipo: 'numero', min: 0, max: 150 },
    ],
  },
];
```

---

## 🧠 Hook `useFormularioDinamico`

Si necesitas control más granular, puedes usar el hook directamente:

```tsx
import { useFormularioDinamico } from '@/componentes/formulario_edicion';

const {
  datos,           // Datos actuales del formulario
  errores,         // Errores de validación por campo
  sucio,           // Si el formulario tiene cambios sin guardar
  guardando,       // Si está en proceso de guardado
  esValido,        // Si todos los campos son válidos
  handleChange,    // (nombre, valor) => void
  handleSubmit,    // () => Promise<boolean>
  limpiar,         // () => void
  reiniciar,       // (nuevosDatos) => void
} = useFormularioDinamico(entidadInicial, configuracion, onGuardar);
```

---

## 🎨 Personalización de Estilos

Los estilos usan clases CSS con prefijo `edicion-`. Puedes sobrescribirlas:

- `edicion-overlay` — Fondo del modal
- `edicion-modal` — Ventana modal
- `edicion-contenedor` — Contenedor del formulario
- `edicion-seccion` — Cada fieldset
- `edicion-campo` — Cada campo individual
- `edicion-input` — Inputs/selects/textarea
- `edicion-tag` — Tags de lista-items
- `edicion-btn` — Botones
- `edicion-mensaje` — Mensajes de error/éxito

O usa la prop `className` para agregar clases adicionales.

---

## ✅ Beneficios vs Formularios Tradicionales

| Aspecto | Formulario tradicional | FormularioEdicion |
|---|---|---|
| Crear nueva entidad | Crear componente desde cero | Solo definir `SeccionConfig[]` |
| Mantenimiento | Modificar N componentes | Modificar 1 configuración |
| Validaciones | Código disperso | Centralizadas por campo |
| Reutilización | Baja (cada formulario es único) | Alta (config-driven) |
| Consistencia UI | Puede variar entre formularios | Garantizada |
| Testing | Unitario por componente | Test genérico + configs |

---

## 🔄 Flujo de Integración Típico

```
1. Usuario hace clic en "Editar" desde búsqueda/tabla
2. Se abre FormularioEdicion como modal
3. Usuario modifica campos
4. Hook valida en tiempo real
5. Usuario hace clic en "Guardar cambios"
6. onGuardar() → API → actualizar estado local
7. Modal se cierra automáticamente al guardar exitosamente