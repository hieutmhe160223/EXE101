import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useParams } from "react-router";
import api from "../../utils/api";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";

export function AdminUpdateOrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statuses = [
    ["DRAFT", "Bản nháp"], ["WAITING_DEPOSIT", "Chờ đặt cọc"], ["DEPOSIT_PAID", "Đã đặt cọc"], ["PURCHASED", "Đã mua hàng"], ["SHOP_SHIPPING", "Shop giao hàng"], ["CHINA_WAREHOUSE", "Kho Trung Quốc"], ["INTERNATIONAL_SHIPPING", "Đang vận chuyển quốc tế"], ["VIETNAM_WAREHOUSE", "Kho Việt Nam"], ["WAITING_FINAL_PAYMENT", "Chờ thanh toán cuối"], ["FINAL_PAID", "Đã thanh toán cuối"], ["DELIVERING", "Đang giao hàng"], ["COMPLETED", "Hoàn tất"], ["CANCELLED", "Đã hủy"], ["RETURN_REQUESTED", "Yêu cầu hoàn trả"], ["REFUNDED", "Đã hoàn tiền"],
  ];

  useEffect(() => {
    if (!id) return;
    api.get(`/v1/admin/orders/${id}`).then((response) => {
      setOrder(response.data);
      setStatus(response.data.status);
    }).catch((err) => setError(err?.response?.data?.message || "Không thể tải chi tiết đơn hàng.")).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!id || !status) return;
    setSaving(true);
    try {
      const response = await api.patch(`/v1/admin/orders/${id}/status`, { status });
      setOrder(response.data);
      alert("Cập nhật trạng thái đơn hàng thành công.");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Cập nhật trạng thái thất bại.");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-6 text-center text-muted-foreground">Đang tải chi tiết đơn hàng...</div>;
  if (error || !order) return <div className="p-6 text-center text-rose-500">{error || "Không tìm thấy đơn hàng."}</div>;
  const formatCurrency = (amount: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
  const formatDate = (date: string) => new Intl.DateTimeFormat("vi-VN").format(new Date(date));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Link to="/admin/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"><ArrowLeft className="w-4 h-4" />Quay lại danh sách</Link>
      <div className="flex items-center justify-between mb-8"><div><h1 className="text-3xl font-bold">Đơn hàng {order.orderCode}</h1><p className="text-sm text-muted-foreground mt-1">Tạo ngày {formatDate(order.createdAt)}</p></div><span className="px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary">{order.status}</span></div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-xl font-semibold mb-6">Cập nhật trạng thái</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Trạng thái hiện tại</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {statuses.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-sm text-muted-foreground">Khách hàng: {order.customerName} ({order.customerEmail})</p>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-6">Ảnh kiểm hàng</h2>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <p className="text-sm text-muted-foreground">Địa chỉ giao hàng: {order.shippingAddress || "Chưa có"}</p>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h2 className="text-xl font-semibold mb-6">Thông tin đơn hàng</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã đơn:</span>
                <span className="font-semibold">{order.orderCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Khách hàng:</span>
                <span>{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày đặt:</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Giá trị:</span>
                <span className="font-semibold">{formatCurrency(order.totalAmountVnd)}</span>
              </div>
            </div>

            <Button className="w-full mt-6" onClick={handleSave} disabled={saving || status === order.status}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
