import { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { Package, DollarSign, Users, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ORDER_STATUS_MAP } from "../../utils/orderStatusMapper";

interface DashboardData {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalComplaints: number;
  monthlyRevenues: { month: string; revenue: number }[];
  statusCounts: { status: string; count: number }[];
  recentOrders: {
    orderCode: string;
    customerName: string;
    productType: string;
    status: string;
    totalAmount: number;
  }[];
}

export function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

    fetch("http://localhost:8080/api/v1/admin/dashboard", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Lỗi HTTP status: ${res.status}`);
        return res.json();
      })
      .then((result: DashboardData) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy dữ liệu Dashboard:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center font-medium">Đang tải dữ liệu...</div>;
  if (!data) return <div className="p-8 text-center text-rose-500 font-medium">Lỗi tải dữ liệu Dashboard!</div>;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);

  const stats = [
    { label: "Tổng đơn hàng", value: (data.totalOrders || 0).toLocaleString(), icon: Package, color: "text-primary", change: "+12%" },
    { label: "Doanh thu", value: formatCurrency(data.totalRevenue), icon: DollarSign, color: "text-accent", change: "+8%" },
    { label: "Khách hàng", value: (data.totalCustomers || 0).toLocaleString(), icon: Users, color: "text-blue-600", change: "+15%" },
    { label: "Khiếu nại", value: (data.totalComplaints || 0).toString(), icon: AlertCircle, color: "text-destructive", change: "-5%" },
  ];

  // Optional chaining và fallback mảng rỗng chống crash
  const orderStatusData = (data.statusCounts || []).map((item) => ({
    name: ORDER_STATUS_MAP[item.status]?.label || item.status,
    value: item.count,
    color: ORDER_STATUS_MAP[item.status]?.color || "#8884d8",
  }));

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
            <LineChart data={data.monthlyRevenues || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(val) => `${val / 1000000}M`} />
              <Tooltip formatter={(val: number) => [formatCurrency(val), "Doanh thu"]} />
              <Line type="monotone" dataKey="revenue" stroke="#FF6A00" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-6">Đơn hàng theo trạng thái</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={100}
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
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
              {(data.recentOrders || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    Chưa có đơn hàng gần đây.
                  </td>
                </tr>
              ) : (
                data.recentOrders.map((order, idx) => {
                  const statusInfo = ORDER_STATUS_MAP[order.status] || { label: order.status, color: "#6B7280" };
                  return (
                    <tr key={idx} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 font-medium">{order.orderCode}</td>
                      <td className="py-4">{order.customerName}</td>
                      <td className="py-4 text-muted-foreground">{order.productType}</td>
                      <td className="py-4">
                        <span
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{ backgroundColor: `${statusInfo.color}20`, color: statusInfo.color }}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-4 text-right font-semibold">{formatCurrency(order.totalAmount)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}