
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart"
import { callHistory } from "@/lib/data"

const chartData = callHistory.map(call => ({
    date: new Date(call.date).toLocaleDateString('en-US', { weekday: 'short' }),
    duration: call.duration / 60,
}));

const chartConfig = {
  duration: {
    label: "Duration (minutes)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function CallHistoryChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="duration" fill="var(--color-duration)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
