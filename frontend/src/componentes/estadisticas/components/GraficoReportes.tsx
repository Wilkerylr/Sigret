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

const chartData = [
  { date: "2024-04-01", Mantenimientos: 222, Fallas: 150 },
  { date: "2024-04-02", Mantenimientos: 97, Fallas: 180 },
  { date: "2024-04-03", Mantenimientos: 167, Fallas: 120 },
  { date: "2024-04-04", Mantenimientos: 242, Fallas: 260 },
  { date: "2024-04-05", Mantenimientos: 373, Fallas: 290 },
  { date: "2024-04-06", Mantenimientos: 301, Fallas: 340 },
  { date: "2024-04-07", Mantenimientos: 245, Fallas: 180 },
  { date: "2024-04-08", Mantenimientos: 409, Fallas: 320 },
  { date: "2024-04-09", Mantenimientos: 59, Fallas: 110 },
  { date: "2024-04-10", Mantenimientos: 261, Fallas: 190 },
  { date: "2024-04-11", Mantenimientos: 327, Fallas: 350 },
  { date: "2024-04-12", Mantenimientos: 292, Fallas: 210 },
  { date: "2024-04-13", Mantenimientos: 342, Fallas: 380 },
  { date: "2024-04-14", Mantenimientos: 137, Fallas: 220 },
  { date: "2024-04-15", Mantenimientos: 120, Fallas: 170 },
  { date: "2024-04-16", Mantenimientos: 138, Fallas: 190 },
  { date: "2024-04-17", Mantenimientos: 446, Fallas: 360 },
  { date: "2024-04-18", Mantenimientos: 364, Fallas: 410 },
  { date: "2024-04-19", Mantenimientos: 243, Fallas: 180 },
  { date: "2024-04-20", Mantenimientos: 89, Fallas: 150 },
  { date: "2024-04-21", Mantenimientos: 137, Fallas: 200 },
  { date: "2024-04-22", Mantenimientos: 224, Fallas: 170 },
  { date: "2024-04-23", Mantenimientos: 138, Fallas: 230 },
  { date: "2024-04-24", Mantenimientos: 387, Fallas: 290 },
  { date: "2024-04-25", Mantenimientos: 215, Fallas: 250 },
  { date: "2024-04-26", Mantenimientos: 75, Fallas: 130 },
  { date: "2024-04-27", Mantenimientos: 383, Fallas: 420 },
  { date: "2024-04-28", Mantenimientos: 122, Fallas: 180 },
  { date: "2024-04-29", Mantenimientos: 315, Fallas: 240 },
  { date: "2024-04-30", Mantenimientos: 454, Fallas: 380 },
  { date: "2024-05-01", Mantenimientos: 165, Fallas: 220 },
  { date: "2024-05-02", Mantenimientos: 293, Fallas: 310 },
  { date: "2024-05-03", Mantenimientos: 247, Fallas: 190 },
  { date: "2024-05-04", Mantenimientos: 385, Fallas: 420 },
  { date: "2024-05-05", Mantenimientos: 481, Fallas: 390 },
  { date: "2024-05-06", Mantenimientos: 498, Fallas: 520 },
  { date: "2024-05-07", Mantenimientos: 388, Fallas: 300 },
  { date: "2024-05-08", Mantenimientos: 149, Fallas: 210 },
  { date: "2024-05-09", Mantenimientos: 227, Fallas: 180 },
  { date: "2024-05-10", Mantenimientos: 293, Fallas: 330 },
  { date: "2024-05-11", Mantenimientos: 335, Fallas: 270 },
  { date: "2024-05-12", Mantenimientos: 197, Fallas: 240 },
  { date: "2024-05-13", Mantenimientos: 197, Fallas: 160 },
  { date: "2024-05-14", Mantenimientos: 448, Fallas: 490 },
  { date: "2024-05-15", Mantenimientos: 473, Fallas: 380 },
  { date: "2024-05-16", Mantenimientos: 338, Fallas: 400 },
  { date: "2024-05-17", Mantenimientos: 499, Fallas: 420 },
  { date: "2024-05-18", Mantenimientos: 315, Fallas: 350 },
  { date: "2024-05-19", Mantenimientos: 235, Fallas: 180 },
  { date: "2024-05-20", Mantenimientos: 177, Fallas: 230 },
  { date: "2024-05-21", Mantenimientos: 82, Fallas: 140 },
  { date: "2024-05-22", Mantenimientos: 81, Fallas: 120 },
  { date: "2024-05-23", Mantenimientos: 252, Fallas: 290 },
  { date: "2024-05-24", Mantenimientos: 294, Fallas: 220 },
  { date: "2024-05-25", Mantenimientos: 201, Fallas: 250 },
  { date: "2024-05-26", Mantenimientos: 213, Fallas: 170 },
  { date: "2024-05-27", Mantenimientos: 420, Fallas: 460 },
  { date: "2024-05-28", Mantenimientos: 233, Fallas: 190 },
  { date: "2024-05-29", Mantenimientos: 78, Fallas: 130 },
  { date: "2024-05-30", Mantenimientos: 340, Fallas: 280 },
  { date: "2024-05-31", Mantenimientos: 178, Fallas: 230 },
  { date: "2024-06-01", Mantenimientos: 178, Fallas: 200 },
  { date: "2024-06-02", Mantenimientos: 470, Fallas: 410 },
  { date: "2024-06-03", Mantenimientos: 103, Fallas: 160 },
  { date: "2024-06-04", Mantenimientos: 439, Fallas: 380 },
  { date: "2024-06-05", Mantenimientos: 88, Fallas: 140 },
  { date: "2024-06-06", Mantenimientos: 294, Fallas: 250 },
  { date: "2024-06-07", Mantenimientos: 323, Fallas: 370 },
  { date: "2024-06-08", Mantenimientos: 385, Fallas: 320 },
  { date: "2024-06-09", Mantenimientos: 438, Fallas: 480 },
  { date: "2024-06-10", Mantenimientos: 155, Fallas: 200 },
  { date: "2024-06-11", Mantenimientos: 92, Fallas: 150 },
  { date: "2024-06-12", Mantenimientos: 492, Fallas: 420 },
  { date: "2024-06-13", Mantenimientos: 81, Fallas: 130 },
  { date: "2024-06-14", Mantenimientos: 426, Fallas: 380 },
  { date: "2024-06-15", Mantenimientos: 307, Fallas: 350 },
  { date: "2024-06-16", Mantenimientos: 371, Fallas: 310 },
  { date: "2024-06-17", Mantenimientos: 475, Fallas: 520 },
  { date: "2024-06-18", Mantenimientos: 107, Fallas: 170 },
  { date: "2024-06-19", Mantenimientos: 341, Fallas: 290 },
  { date: "2024-06-20", Mantenimientos: 408, Fallas: 450 },
  { date: "2024-06-21", Mantenimientos: 169, Fallas: 210 },
  { date: "2024-06-22", Mantenimientos: 317, Fallas: 270 },
  { date: "2024-06-23", Mantenimientos: 480, Fallas: 530 },
  { date: "2024-06-24", Mantenimientos: 132, Fallas: 180 },
  { date: "2024-06-25", Mantenimientos: 141, Fallas: 190 },
  { date: "2024-06-26", Mantenimientos: 434, Fallas: 380 },
  { date: "2024-06-27", Mantenimientos: 448, Fallas: 490 },
  { date: "2024-06-28", Mantenimientos: 149, Fallas: 200 },
  { date: "2024-06-29", Mantenimientos: 103, Fallas: 160 },
  { date: "2024-06-30", Mantenimientos: 446, Fallas: 400 },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  Mantenimientos: {
    label: "Mantenimientos",
    color: "var(--chart-1)",
  },
  Fallas: {
    label: "Fallas",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function GraficoReportes() {
  const [timeRange, setTimeRange] = React.useState("90d")

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="estadisticas-card pt-0">
      <CardHeader className="estadisticas-card-header">
        <div className="grid flex-1 gap-1">
          <CardTitle className="estadisticas-card-titulo">Reportes por rango de tiempo</CardTitle>
          <CardDescription className="estadisticas-card-descripcion">
            Mostrando reportes de {timeRange === "7d" && "los últimos 7 días"}
            {timeRange === "30d" && "los últimos 30 días"}
            {timeRange === "90d" && "los últimos 3 meses"}
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
              <linearGradient id="fillMantenimientos" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-Mantenimientos)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-Mantenimientos)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillFallas" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-Fallas)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-Fallas)"
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
              dataKey="Fallas"
              type="natural"
              fill="url(#fillFallas)"
              stroke="var(--color-Fallas)"
              stackId="a"
            />
            <Area
              dataKey="Mantenimientos"
              type="natural"
              fill="url(#fillMantenimientos)"
              stroke="var(--color-Mantenimientos)"
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