import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Save, Upload } from "lucide-react";
import { useState } from "react";

export function AdminUpdateOrderPage() {
  const [status, setStatus] = useState("warehouse_cn");
  const [tracking, setTracking] = useState("");

  const statuses = [
    { value: "ordered", label: "Đã đặt hàng" },
    { value: "purchased", label: "Người bán giao hàng" },
    { value: "warehouse_cn", label: "Về kho Trung Quốc" },
    { value: "shipping", label: "Vận chuyển quốc tế" },
    { value: "warehouse_vn", label: "Về kho Việt Nam" },
    { value: "delivered", label: "Đã giao hàng" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Cập nhật đơn hàng YF20260616001</h1>

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
                  {statuses.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mã vận đơn</label>
                <input
                  type="text"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="Nhập mã tracking..."
                  className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                <textarea
                  rows={4}
                  placeholder="Ghi chú thêm (tùy chọn)..."
                  className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-6">Ảnh kiểm hàng</h2>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Tải lên ảnh kiểm hàng</p>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h2 className="text-xl font-semibold mb-6">Thông tin đơn hàng</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã đơn:</span>
                <span className="font-semibold">YF20260616001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Khách hàng:</span>
                <span>Nguyễn Văn A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày đặt:</span>
                <span>16/06/2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Giá trị:</span>
                <span className="font-semibold">412,775₫</span>
              </div>
            </div>

            <Button className="w-full mt-6">
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
