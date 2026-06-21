import { Card } from "../../components/Card";
import { Package, DollarSign, Users, AlertCircle, TrendingUp } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export function AdminDashboardPage() {
  const stats = [
    { label: "Tổng đơn hàng", value: "1,234", icon: Package, color: "text-primary", change: "+12%" },
    { label: "Doanh thu", value: "456M ₫", icon: DollarSign, color: "text-accent", change: "+8%" },
    { label: "Khách hàng", value: "5,678", icon: Users, color: "text-blue-600", change: "+15%" },
    { label: "Khiếu nại", value: "23", icon: AlertCircle, color: "text-destructive", change: "-5%" },
  ];

  const revenueData = [
    { month: "T1", revenue: 45 },
    { month: "T2", revenue: 52 },
    { month: "T3", revenue: 48 },
    { month: "T4", revenue: 61 },
    { month: "T5", revenue: 55 },
    { month: "T6", revenue: 67 },
  ];

  const orderStatusData = [
    { name: "Đã đặt", value: 145, color: "#3B82F6" },
    { name: "Kho TQ", value: 89, color: "#8B5CF6" },
    { name: "Đang giao", value: 67, color: "#FF6A00" },
    { name: "Hoàn thành", value: 932, color: "#10B981" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Tổng quan</h1>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-opacity-10 flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`text-sm font-semibold ${stat.change.startsWith("+") ? "text-accent" : "text-destructive"}`}>
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-xl font-semibold mb-6">Doanh thu theo tháng</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#FF6A00" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-6">Đơn hàng theo trạng thái</h2>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-6">Đơn hàng gần đây</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-semibold">Mã đơn</th>
                <th className="pb-3 font-semibold">Khách hàng</th>
                <th className="pb-3 font-semibold">Sản phẩm</th>
                <th className="pb-3 font-semibold">Trạng thái</th>
                <th className="pb-3 font-semibold text-right">Giá trị</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: "YF20260616001", customer: "Nguyễn Văn A", product: "Áo thun", status: "Đang giao", value: "412,775₫" },
                { id: "YF20260615002", customer: "Trần Thị B", product: "Giày thể thao", status: "Kho TQ", value: "650,000₫" },
                { id: "YF20260614003", customer: "Lê Văn C", product: "Túi xách", status: "Hoàn thành", value: "890,000₫" },
              ].map((order) => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="py-4 font-medium">{order.id}</td>
                  <td className="py-4">{order.customer}</td>
                  <td className="py-4 text-muted-foreground">{order.product}</td>
                  <td className="py-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 text-right font-semibold">{order.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
