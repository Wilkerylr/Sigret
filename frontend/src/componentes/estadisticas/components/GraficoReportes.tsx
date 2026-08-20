import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/componentes/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/componentes/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/componentes/ui/select"
import type { DatosPorDia } from "@/types/estadistica.types"

const chartConfig = {
  total: {
    label: "Reportes",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

interface GraficoReportesProps {
  data: DatosPorDia[];
}

function GraficoReportes({ data }: GraficoReportesProps) {
  const [timeRange, setTimeRange] = React.useState("90d")

  const dias = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
  const filteredData = data.slice(-dias)
  const total = filteredData.reduce((acc, item) => acc + (item.total || 0), 0)

  return (
    <Card className="estadisticas-card pt-0">
      <CardHeader className="estadisticas-card-header">
        <div className="grid flex-1 gap-1">
          <CardTitle className="estadisticas-card-titulo">Reportes por rango de tiempo</CardTitle>
          <CardDescription className="estadisticas-card-descripcion">
            Mostrando reportes de {timeRange === "7d" && "los últimos 7 días"}
            {timeRange === "30d" && "los últimos 30 días"}
            {timeRange === "90d" && "los últimos 3 meses"} · {total} reportes
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="estadisticas-selector-periodo hidden sm:flex"
            aria-label="Seleccionar período"
          >
            <SelectValue placeholder="Últimos 3 meses" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Últimos 3 meses
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Últimos 30 días
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Últimos 7 días
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="estadisticas-chart-wrapper">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillReportes" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-total)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-total)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("es-ES", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("es-ES", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="total"
              type="natural"
              fill="url(#fillReportes)"
              stroke="var(--color-total)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default GraficoReportes
