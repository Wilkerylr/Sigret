import { TrendingUp, TrendingDown } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/componentes/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/componentes/ui/chart"
import type { ReportesPorMes } from "@/types/estadistica.types"

const chartConfig = {
  Reportes: {
    label: "Reportes",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

interface ChartBarMultipleProps {
  porMes: ReportesPorMes;
}

function ChartBarMultiple({ porMes }: ChartBarMultipleProps) {
  const chartData = porMes.meses.map((m) => ({ month: m.mes, Reportes: m.cantidad }))

  const conDatos = chartData.filter((d) => d.Reportes > 0)
  const total = chartData.reduce((acc, d) => acc + d.Reportes, 0)

  const calcularIncremento = (): number | null => {
    if (conDatos.length < 2) return null;
    const ultimo = conDatos[conDatos.length - 1].Reportes;
    const anterior = conDatos[conDatos.length - 2].Reportes;
    if (anterior === 0) return null;
    return Number((((ultimo - anterior) / anterior) * 100).toFixed(1));
  };

  const incremento = calcularIncremento();

  return (
    <Card className="estadisticas-card">
      <CardHeader className="estadisticas-card-header">
        <CardTitle className="estadisticas-card-titulo">Reportes por mes</CardTitle>
        <CardDescription className="estadisticas-card-descripcion">
          {conDatos.length > 0
            ? `${chartData[0].month} - ${chartData[chartData.length - 1].month} ${porMes.año}`
            : `Año ${porMes.año}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="estadisticas-chart-wrapper">
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="Reportes" fill="var(--color-Reportes)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {incremento === null ? (
          <div className="flex gap-2 leading-none font-medium">
            Sin datos suficientes para comparar meses
          </div>
        ) : incremento >= 0 ? (
          <div className="flex gap-2 leading-none font-medium">
            Incremento del {incremento}% este mes <TrendingUp className="h-4 w-4" />
          </div>
        ) : (
          <div className="flex gap-2 leading-none font-medium">
            Disminución del {Math.abs(incremento)}% este mes <TrendingDown className="h-4 w-4" />
          </div>
        )}
        <div className="leading-none text-muted-foreground">
          {total} reportes registrados en el año {porMes.año}
        </div>
      </CardFooter>
    </Card>
  )
}

export default ChartBarMultiple
