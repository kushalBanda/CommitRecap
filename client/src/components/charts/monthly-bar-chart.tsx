"use client";

import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

interface MonthlyBarChartProps {
  data: Record<string, number>;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  // Transform data for chart
  const chartData = MONTH_NAMES.map((month, index) => {
    const monthKey = Object.keys(data).find((key) => {
      const monthNum = parseInt(key.split("-")[1]);
      return monthNum === index + 1;
    });
    return {
      month,
      commits: monthKey ? data[monthKey] : 0,
    };
  });

  // Find peak month
  const maxCommits = Math.max(...chartData.map((d) => d.commits));
  const peakMonth = chartData.find((d) => d.commits === maxCommits);

  const chartConfig = {
    commits: {
      label: "Commits",
      color: "#39d353",
    },
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border">
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <XAxis
              dataKey="month"
              stroke="#8b949e"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#8b949e"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                      <p className="text-sm font-medium text-foreground">
                        {payload[0].payload.month}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {payload[0].value} commits
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="commits"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.month === peakMonth?.month ? "#39d353" : "#26a641"}
                  opacity={entry.commits === 0 ? 0.3 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  );
}
