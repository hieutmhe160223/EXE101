import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Plus, Edit, Trash2, Ticket } from "lucide-react";

export function AdminCouponManagementPage() {
  const coupons = [
    { id: 1, code: "SUMMER2026", discount: "10%", used: 45, limit: 100, expiry: "2026-07-31", status: "active" },
    { id: 2, code: "NEWUSER50K", discount: "50,000₫", used: 28, limit: 50, expiry: "2026-12-31", status: "active" },
    { id: 3, code: "FLASH20", discount: "20%", used: 100, limit: 100, expiry: "2026-06-01", status: "expired" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Quản lý mã giảm giá</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Tạo mã mới
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-semibold">Mã</th>
                <th className="pb-3 font-semibold">Giảm giá</th>
                <th className="pb-3 font-semibold">Đã dùng</th>
                <th className="pb-3 font-semibold">Giới hạn</th>
                <th className="pb-3 font-semibold">Hết hạn</th>
                <th className="pb-3 font-semibold">Trạng thái</th>
                <th className="pb-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b last:border-0">
                  <td className="py-4 font-mono font-semibold">{coupon.code}</td>
                  <td className="py-4 text-primary font-semibold">{coupon.discount}</td>
                  <td className="py-4">{coupon.used}</td>
                  <td className="py-4">{coupon.limit}</td>
                  <td className="py-4 text-muted-foreground">{coupon.expiry}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      coupon.status === "active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                    }`}>
                      {coupon.status === "active" ? "Hoạt động" : "Hết hạn"}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
