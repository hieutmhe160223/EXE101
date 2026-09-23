import { useCallback, useEffect, useState } from "react";
import { Download, DollarSign, FileBarChart, ShoppingCart, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../../utils/api";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";

type ReportPoint = { label: string; orders: number; revenue: number };
type StatusCount = { status: string; count: number };
type ReportResponse = { from: string; to: string; totalOrders: number; completedOrders: number; newCustomers: number; complaints: number; totalRevenue: number; monthlyData: ReportPoint[]; statusCounts: StatusCount[] };

const statusLabels: Record<string, string> = { DRAFT: "Bản nháp", WAITING_DEPOSIT: "Chờ đặt cọc", DEPOSIT_PAID: "Đã đặt cọc", PURCHASED: "Đã mua", SHOP_SHIPPING: "Shop giao hàng", CHINA_WAREHOUSE: "Kho Trung Quốc", INTERNATIONAL_SHIPPING: "Vận chuyển quốc tế", VIETNAM_WAREHOUSE: "Kho Việt Nam", WAITING_FINAL_PAYMENT: "Chờ thanh toán cuối", FINAL_PAID: "Đã thanh toán cuối", DELIVERING: "Đang giao", COMPLETED: "Hoàn tất", CANCELLED: "Đã hủy", RETURN_REQUESTED: "Yêu cầu hoàn trả", REFUNDED: "Đã hoàn tiền" };
const formatCurrency = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value || 0);
const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

export function AdminReportsPage() {
  const today = new Date();
  const [from, setFrom] = useState(formatDateInput(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [to, setTo] = useState(formatDateInput(today));
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const response = await api.get<ReportResponse>("/v1/admin/reports", { params: { from, to } });
      setReport(response.data);
    } catch (err: any) { setError(err?.response?.data?.message || "Không thể tải báo cáo."); }
    finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const exportCsv = () => {
    if (!report) return;
    const rows = [
      ["Báo cáo từ", report.from], ["Báo cáo đến", report.to], [],
      ["Chỉ số", "Giá trị"], ["Tổng đơn hàng", report.totalOrders.toString()], ["Đơn hoàn tất", report.completedOrders.toString()], ["Khách hàng mới", report.newCustomers.toString()], ["Khiếu nại", report.complaints.toString()], ["Doanh thu", report.totalRevenue.toString()], [],
      ["Tháng", "Đơn hàng", "Doanh thu"], ...report.monthlyData.map((item) => [item.label, item.orders.toString(), item.revenue.toString()]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell ?? ""}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `bao-cao-${report.from}-${report.to}.csv`; link.click(); URL.revokeObjectURL(url);
  };

  return <div className="p-6 max-w-7xl mx-auto"><div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8"><div><h1 className="text-3xl font-bold">Báo cáo & Phân tích</h1><p className="text-sm text-muted-foreground mt-1">Số liệu được tổng hợp trực tiếp từ hệ thống.</p></div><Button variant="outline" onClick={exportCsv} disabled={!report}><Download className="w-4 h-4 mr-2" />Xuất CSV</Button></div>
    <Card className="mb-6 p-4"><div className="flex flex-col sm:flex-row sm:items-end gap-4"><div><label className="block text-sm font-medium mb-2">Từ ngày</label><input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} className="px-4 py-2.5 bg-slate-50 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary" /></div><div><label className="block text-sm font-medium mb-2">Đến ngày</label><input type="date" value={to} min={from} max={formatDateInput(today)} onChange={(event) => setTo(event.target.value)} className="px-4 py-2.5 bg-slate-50 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary" /></div><Button onClick={fetchReport}><FileBarChart className="w-4 h-4 mr-2" />Xem báo cáo</Button></div></Card>
    {loading ? <Card><div className="py-16 text-center text-muted-foreground">Đang tổng hợp báo cáo...</div></Card> : error ? <Card><div className="py-16 text-center text-rose-500">{error}</div></Card> : report && <><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"><StatCard label="Doanh thu hoàn tất" value={formatCurrency(report.totalRevenue)} icon={DollarSign} color="text-emerald-600" /><StatCard label="Tổng đơn hàng" value={report.totalOrders.toLocaleString("vi-VN")} icon={ShoppingCart} color="text-primary" /><StatCard label="Khách hàng mới" value={report.newCustomers.toLocaleString("vi-VN")} icon={Users} color="text-blue-600" /><StatCard label="Khiếu nại" value={report.complaints.toLocaleString("vi-VN")} icon={FileBarChart} color="text-rose-600" /></div><div className="grid lg:grid-cols-2 gap-6 mb-6"><Card><h2 className="text-xl font-semibold mb-6">Doanh thu theo tháng</h2><ResponsiveContainer width="100%" height={300}><LineChart data={report.monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis tickFormatter={(value) => `${Math.round(value / 1000000)}M`} /><Tooltip formatter={(value: number) => formatCurrency(value)} /><Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#10B981" strokeWidth={3} /></LineChart></ResponsiveContainer></Card><Card><h2 className="text-xl font-semibold mb-6">Đơn hàng theo tháng</h2><ResponsiveContainer width="100%" height={300}><BarChart data={report.monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="orders" name="Đơn hàng" fill="#FF6A00" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></Card></div><Card><h2 className="text-xl font-semibold mb-6">Phân bổ trạng thái đơn hàng</h2><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="p-3">Trạng thái</th><th className="p-3 text-right">Số lượng</th><th className="p-3 text-right">Tỷ trọng</th></tr></thead><tbody>{report.statusCounts.length === 0 ? <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">Không có dữ liệu trong khoảng thời gian này.</td></tr> : report.statusCounts.map((item) => <tr key={item.status} className="border-b last:border-0"><td className="p-3">{statusLabels[item.status] || item.status}</td><td className="p-3 text-right font-medium">{item.count}</td><td className="p-3 text-right text-muted-foreground">{report.totalOrders ? `${((item.count / report.totalOrders) * 100).toFixed(1)}%` : "0%"}</td></tr>)}</tbody></table></div></Card></>}
  </div>;
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: typeof DollarSign; color: string }) {
  return <Card><div className="flex items-start justify-between mb-4"><div className={`w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center ${color}`}><Icon className="w-6 h-6" /></div></div><div className="text-2xl font-bold mb-1">{value}</div><div className="text-sm text-muted-foreground">{label}</div></Card>;
}
