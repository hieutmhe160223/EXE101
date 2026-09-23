import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import { Link } from "react-router";
import api from "../../utils/api";
import { Card } from "../../components/Card";

type OrderStatus = "DRAFT" | "WAITING_DEPOSIT" | "DEPOSIT_PAID" | "PURCHASED" | "SHOP_SHIPPING" | "CHINA_WAREHOUSE" | "INTERNATIONAL_SHIPPING" | "VIETNAM_WAREHOUSE" | "WAITING_FINAL_PAYMENT" | "FINAL_PAID" | "DELIVERING" | "COMPLETED" | "CANCELLED" | "RETURN_REQUESTED" | "REFUNDED";
interface OrderResponse { id: number; orderCode: string; customerName: string; customerEmail: string; productName: string; status: OrderStatus; totalAmountVnd: number; quantity: number; createdAt: string; }
interface SpringPage<T> { content: T[]; totalPages: number; totalElements: number; }

const statusLabels: Record<OrderStatus, string> = { DRAFT: "Bản nháp", WAITING_DEPOSIT: "Chờ đặt cọc", DEPOSIT_PAID: "Đã đặt cọc", PURCHASED: "Đã mua hàng", SHOP_SHIPPING: "Shop giao hàng", CHINA_WAREHOUSE: "Kho Trung Quốc", INTERNATIONAL_SHIPPING: "Đang vận chuyển quốc tế", VIETNAM_WAREHOUSE: "Kho Việt Nam", WAITING_FINAL_PAYMENT: "Chờ thanh toán cuối", FINAL_PAID: "Đã thanh toán cuối", DELIVERING: "Đang giao hàng", COMPLETED: "Hoàn tất", CANCELLED: "Đã hủy", RETURN_REQUESTED: "Yêu cầu hoàn trả", REFUNDED: "Đã hoàn tiền" };
const statusClasses: Record<OrderStatus, string> = { DRAFT: "bg-slate-100 text-slate-700", WAITING_DEPOSIT: "bg-amber-100 text-amber-700", DEPOSIT_PAID: "bg-blue-100 text-blue-700", PURCHASED: "bg-indigo-100 text-indigo-700", SHOP_SHIPPING: "bg-cyan-100 text-cyan-700", CHINA_WAREHOUSE: "bg-sky-100 text-sky-700", INTERNATIONAL_SHIPPING: "bg-violet-100 text-violet-700", VIETNAM_WAREHOUSE: "bg-teal-100 text-teal-700", WAITING_FINAL_PAYMENT: "bg-orange-100 text-orange-700", FINAL_PAID: "bg-blue-100 text-blue-700", DELIVERING: "bg-purple-100 text-purple-700", COMPLETED: "bg-emerald-100 text-emerald-700", CANCELLED: "bg-rose-100 text-rose-700", RETURN_REQUESTED: "bg-red-100 text-red-700", REFUNDED: "bg-slate-100 text-slate-700" };
const formatCurrency = (amount: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
const formatDate = (date: string) => new Intl.DateTimeFormat("vi-VN").format(new Date(date));

export function AdminOrderManagementPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params: Record<string, string | number> = { page, size: 10 };
      if (search.trim()) params.keyword = search.trim();
      if (status) params.status = status;
      const response = await api.get<SpringPage<OrderResponse>>("/v1/admin/orders", { params });
      setOrders(response.data.content); setTotalPages(response.data.totalPages); setTotalElements(response.data.totalElements);
    } catch (err: any) { setError(err?.response?.data?.message || "Không thể tải danh sách đơn hàng."); }
    finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return <div className="p-6 max-w-7xl mx-auto">
    <div className="mb-8"><h1 className="text-3xl font-bold">Quản lý đơn hàng</h1><p className="text-muted-foreground text-sm mt-1">Tổng cộng {totalElements} đơn hàng trong hệ thống</p></div>
    <Card className="mb-6 p-4"><div className="flex flex-col sm:flex-row gap-4"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder="Tìm theo mã đơn, tên hoặc email khách hàng..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm" /></div><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }} className="px-4 py-2.5 bg-slate-50 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm min-w-[220px]"><option value="">Tất cả trạng thái</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></Card>
    <Card>{loading ? <div className="py-12 text-center text-muted-foreground">Đang tải danh sách đơn hàng...</div> : error ? <div className="py-12 text-center text-rose-500">{error}</div> : <><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-slate-500 bg-slate-50/50"><th className="p-4">Mã đơn</th><th className="p-4">Khách hàng</th><th className="p-4">Sản phẩm</th><th className="p-4">Ngày đặt</th><th className="p-4">Trạng thái</th><th className="p-4 text-right">Giá trị</th><th className="p-4 text-right">Thao tác</th></tr></thead><tbody>{orders.length === 0 ? <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Không tìm thấy đơn hàng phù hợp.</td></tr> : orders.map((order) => <tr key={order.id} className="border-b last:border-0 hover:bg-slate-50/50"><td className="p-4 font-medium">{order.orderCode}</td><td className="p-4"><div>{order.customerName}</div><div className="text-xs text-muted-foreground">{order.customerEmail}</div></td><td className="p-4 text-muted-foreground">{order.productName} x{order.quantity}</td><td className="p-4 text-muted-foreground">{formatDate(order.createdAt)}</td><td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses[order.status]}`}>{statusLabels[order.status]}</span></td><td className="p-4 text-right font-semibold">{formatCurrency(order.totalAmountVnd)}</td><td className="p-4 text-right"><Link to={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1.5 p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-primary"><Eye className="w-4 h-4" />Chi tiết</Link></td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t p-4 text-sm"><span className="text-muted-foreground">Trang {totalPages === 0 ? 0 : page + 1} / {totalPages}</span><div className="flex gap-2"><button disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="p-2 border rounded-lg disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button><button disabled={page >= totalPages - 1} onClick={() => setPage((current) => current + 1)} className="p-2 border rounded-lg disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button></div></div></>}</Card>
  </div>;
}
