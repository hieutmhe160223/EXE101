import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Search, Filter, Download, Eye } from "lucide-react";
import { Link } from "react-router";

export function AdminOrderManagementPage() {
  const orders = [
    { id: "YF20260616001", customer: "Nguyễn Văn A", product: "Áo thun", status: "shipping", total: "412,775₫", date: "2026-06-16" },
    { id: "YF20260615002", customer: "Trần Thị B", product: "Giày thể thao", status: "warehouse_cn", total: "650,000₫", date: "2026-06-15" },
    { id: "YF20260614003", customer: "Lê Văn C", product: "Túi xách", status: "delivered", total: "890,000₫", date: "2026-06-14" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Xuất Excel
        </Button>
      </div>

      <Card className="mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng..."
              className="w-full pl-10 pr-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Lọc
          </Button>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-semibold">Mã đơn</th>
                <th className="pb-3 font-semibold">Khách hàng</th>
                <th className="pb-3 font-semibold">Sản phẩm</th>
                <th className="pb-3 font-semibold">Ngày</th>
                <th className="pb-3 font-semibold">Trạng thái</th>
                <th className="pb-3 font-semibold text-right">Giá trị</th>
                <th className="pb-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="py-4 font-medium">{order.id}</td>
                  <td className="py-4">{order.customer}</td>
                  <td className="py-4 text-muted-foreground">{order.product}</td>
                  <td className="py-4 text-muted-foreground">{order.date}</td>
                  <td className="py-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 text-right font-semibold">{order.total}</td>
                  <td className="py-4 text-right">
                    <Link to={`/admin/orders/${order.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Chi tiết
                      </Button>
                    </Link>
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
