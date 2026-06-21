import { Card } from "../../components/Card";
import { TrendingUp, Users, ShoppingCart, DollarSign } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function AdminReportsPage() {
  const revenueData = [
    { month: "T1", revenue: 245 },
    { month: "T2", revenue: 312 },
    { month: "T3", revenue: 289 },
    { month: "T4", revenue: 361 },
    { month: "T5", revenue: 422 },
    { month: "T6", revenue: 456 },
  ];

  const conversionData = [
    { month: "T1", orders: 234 },
    { month: "T2", orders: 289 },
    { month: "T3", orders: 267 },
    { month: "T4", orders: 312 },
    { month: "T5", orders: 356 },
    { month: "T6", orders: 398 },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Báo cáo & Phân tích</h1>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Doanh thu tháng này", value: "456M ₫", icon: DollarSign, change: "+18%", color: "text-accent" },
          { label: "Đơn hàng mới", value: "398", icon: ShoppingCart, change: "+12%", color: "text-primary" },
          { label: "Khách hàng mới", value: "156", icon: Users, change: "+25%", color: "text-blue-600" },
          { label: "Tỷ lệ chuyển đổi", value: "3.8%", icon: TrendingUp, change: "+0.5%", color: "text-purple-600" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-opacity-10 flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-accent">{stat.change}</div>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-6">Doanh thu theo tháng (triệu ₫)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-6">Đơn hàng theo tháng</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#FF6A00" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
