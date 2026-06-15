import { TrendingUp } from "lucide-react"
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

const chartData = [
  { month: "Enero", Mantenimientos: 186, Fallas: 80 },
  { month: "Febrero", Mantenimientos: 305, Fallas: 200 },
  { month: "Marzo", Mantenimientos: 237, Fallas: 120 },
  { month: "Abril", Mantenimientos: 73, Fallas: 190 },
  { month: "Mayo", Mantenimientos: 209, Fallas: 130 },
  { month: "Junio", Mantenimientos: 214, Fallas: 140 },
]

const chartConfig = {
  Mantenimientos: {
    label: "Mantenimientos",
    color: "var(--chart-1)",
  },
  Fallas: {
    label: "Fallas",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function ChartBarMultiple() {
  return (
    <Card className="estadisticas-card">
      <CardHeader className="estadisticas-card-header">
        <CardTitle className="estadisticas-card-titulo">Reportes por Tipo</CardTitle>
        <CardDescription className="estadisticas-card-descripcion">Enero - Junio 2026</CardDescription>
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
            <Bar dataKey="Mantenimientos" fill="var(--color-Mantenimientos)" radius={4} />
            <Bar dataKey="Fallas" fill="var(--color-Fallas)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Incremento del 5.2% este mes <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Total de reportes de los últimos 6 meses
        </div>
      </CardFooter>
    </Card>
  )
}

export default ChartBarMultiple