// file: app/dashboard/page.tsx

"use client";

import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type DashboardData = {
  totalRevenue: number;
  totalSales: number;
  newCustomers: number;
  avgOrderValue: number;
  salesData: { date: string; total: number }[];
  categorySalesData: { category: string; sales: number; fill: string }[];
  recentOrders: {
    id: string;
    userId: string;
    total: number;
    status: string;
    date: string;
  }[];
  topProducts: { name: string; sold: number }[];
  revenueChange: number;
  salesChange: number;
  customersChange: number;
  avgOrderValueChange: number;
};

export default function DashboardPage() {
  const { storeid } = useParams();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/${storeid}/dashboard-data`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    if (storeid) fetchData();
  }, [storeid]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  const {
    totalRevenue,
    totalSales,
    newCustomers,
    avgOrderValue,
    salesData,
    categorySalesData,
    recentOrders,
    topProducts,
    revenueChange,
    salesChange,
    customersChange,
    avgOrderValueChange,
  } = data;
  // Helper to format change with sign and percent
  const formatChange = (value: number | undefined | null) => {
    if (typeof value !== "number" || isNaN(value)) return "-";
    const sign = value > 0 ? "+" : value < 0 ? "" : "";
    return `${sign}${value.toFixed(1)}% from last month`;
  };

  // --- CHART CONFIGS ---
  const barChartConfig = {
    total: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  // Pie chart config is not used for colors, colors come from categorySalesData.fill
  const pieChartConfig = {
    sales: {
      label: "Sales",
    },
  } satisfies ChartConfig;

  // --- HELPER FUNCTIONS ---
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const getStatusBadgeVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "DELIVERED":
        return "default";
      case "PROCESSING":
        return "secondary";
      case "SHIPPED":
        return "outline";
      case "CANCELLED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // --- COMPONENT ---
  // ...existing code...
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatChange(revenueChange)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalSales}</div>
            <p className="text-xs text-muted-foreground">
              {formatChange(salesChange)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{newCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {formatChange(customersChange)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Order Value
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(avgOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatChange(avgOrderValueChange)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Revenue for the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={barChartConfig}
              className="h-[300px] w-full"
            >
              <RechartsBarChart accessibilityLayer data={salesData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(value as number)}
                      labelClassName="font-bold"
                    />
                  }
                />
                <Bar dataKey="total" fill="var(--color-total)" radius={8} />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              Trending up by 20.1% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing total revenue for the last 7 days
            </div>
          </CardFooter>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>
              Breakdown of sales across product categories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={pieChartConfig}
              className="h-[350px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatCurrency(value as number)}
                        hideLabel
                      />
                    }
                  />
                  {/* Filter out categories with 0 sales */}
                  {(() => {
                    const filteredCategories = categorySalesData.filter(
                      (cat) => cat.sales > 0
                    );
                    return (
                      <Pie
                        data={filteredCategories}
                        dataKey="sales"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        labelLine={false}
                        label={({
                          cx,
                          cy,
                          midAngle,
                          innerRadius,
                          outerRadius,
                          percent,
                        }) => {
                          const RADIAN = Math.PI / 180;
                          const radius =
                            innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return (
                            <text
                              x={x}
                              y={y}
                              fill="white"
                              textAnchor="middle"
                              dominantBaseline="central"
                              fontSize={12}
                            >{`${(percent * 100).toFixed(0)}%`}</text>
                          );
                        }}
                      >
                        {filteredCategories.map((entry, idx) => {
                          const fallbackColors = [
                            "#8884d8",
                            "#82ca9d",
                            "#ffc658",
                            "#ff8042",
                            "#00C49F",
                            "#FFBB28",
                            "#FF4444",
                            "#A28FD0",
                            "#FFB6B9",
                            "#B5EAD7",
                            "#C7CEEA",
                            "#FFDAC1",
                            "#E2F0CB",
                            "#B5EAD7",
                            "#FF9AA2",
                          ];
                          let color = entry.fill;
                          const isValidColor =
                            (typeof color === "string" &&
                              color !== "black" &&
                              color !== "#000" &&
                              color !== "#000000" &&
                              /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(
                                color
                              )) ||
                            /^rgb\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})\)$/.test(
                              color
                            ) ||
                            /^var\(--color-[^)]+\)$/.test(color);
                          if (!isValidColor) {
                            color = fallbackColors[idx % fallbackColors.length];
                          }
                          if (
                            color.startsWith("var(--") &&
                            typeof window !== "undefined"
                          ) {
                            const resolved = getComputedStyle(
                              document.documentElement
                            ).getPropertyValue(
                              color.replace("var(", "").replace(")", "").trim()
                            );
                            if (
                              resolved &&
                              resolved !== "#000" &&
                              resolved !== "black" &&
                              resolved !== "#000000"
                            ) {
                              color = resolved.trim();
                            } else {
                              color =
                                fallbackColors[idx % fallbackColors.length];
                            }
                          }
                          return (
                            <Cell key={`cell-${entry.category}`} fill={color} />
                          );
                        })}
                      </Pie>
                    );
                  })()}
                  {/* Custom legend: only show categories with sales > 0 */}
                  <Legend
                    payload={categorySalesData
                      .filter((cat) => cat.sales > 0)
                      .map((entry, idx) => {
                        const fallbackColors = [
                          "#8884d8",
                          "#82ca9d",
                          "#ffc658",
                          "#ff8042",
                          "#00C49F",
                          "#FFBB28",
                          "#FF4444",
                          "#A28FD0",
                          "#FFB6B9",
                          "#B5EAD7",
                          "#C7CEEA",
                          "#FFDAC1",
                          "#E2F0CB",
                          "#B5EAD7",
                          "#FF9AA2",
                        ];
                        let color = entry.fill;
                        const isValidColor =
                          (typeof color === "string" &&
                            color !== "black" &&
                            color !== "#000" &&
                            color !== "#000000" &&
                            /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) ||
                          /^rgb\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})\)$/.test(
                            color
                          ) ||
                          /^var\(--color-[^)]+\)$/.test(color);
                        if (!isValidColor) {
                          color = fallbackColors[idx % fallbackColors.length];
                        }
                        if (
                          color.startsWith("var(--") &&
                          typeof window !== "undefined"
                        ) {
                          const resolved = getComputedStyle(
                            document.documentElement
                          ).getPropertyValue(
                            color.replace("var(", "").replace(")", "").trim()
                          );
                          if (
                            resolved &&
                            resolved !== "#000" &&
                            resolved !== "black" &&
                            resolved !== "#000000"
                          ) {
                            color = resolved.trim();
                          } else {
                            color = fallbackColors[idx % fallbackColors.length];
                          }
                        }
                        return {
                          value: entry.category,
                          type: "square",
                          color,
                        };
                      })}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">{order.userId}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell className="text-right">{order.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.name} className="flex items-center">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {product.name}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">{product.sold} sold</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
