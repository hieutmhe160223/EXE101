import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Search, Filter, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";

export function OrderListPage() {
  const [filter, setFilter] = useState("all");

  const orders = [
    {
      id: "YF20260616001",
      status: "shipping",
      statusText: "Đang vận chuyển quốc tế",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200",
      product: "Áo thun nam nữ unisex mùa hè",
      quantity: 1,
      total: 412775,
      date: "2026-06-10",
    },
    {
      id: "YF20260615002",
      status: "warehouse_cn",
      statusText: "Đã về kho Trung Quốc",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200",
      product: "Giày thể thao nam nữ",
      quantity: 1,
      total: 650000,
      date: "2026-06-08",
    },
  ];

  const statusColors = {
    ordered: "bg-blue-100 text-blue-700",
    shipping: "bg-orange-100 text-orange-700",
    warehouse_cn: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Đơn hàng của tôi</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: "all", label: "Tất cả" },
          { id: "ordered", label: "Đã đặt hàng" },
          { id: "warehouse_cn", label: "Kho TQ" },
          { id: "shipping", label: "Đang giao" },
          { id: "delivered", label: "Đã giao" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filter === tab.id
                ? "bg-primary text-white"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} hover>
            <div className="flex items-start justify-between mb-4">
              <div>
                <Link to={`/orders/${order.id}`} className="font-semibold hover:text-primary">
                  {order.id}
                </Link>
                <div className="text-sm text-muted-foreground">{order.date}</div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status as keyof typeof statusColors]}`}>
                {order.statusText}
              </span>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                <img src={order.image} alt={order.product} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="font-medium mb-1">{order.product}</div>
                <div className="text-sm text-muted-foreground">Số lượng: {order.quantity}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-lg">{order.total.toLocaleString()}₫</div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Link to={`/orders/${order.id}`}>
                <Button variant="outline" size="sm">
                  <Package className="w-4 h-4 mr-2" />
                  Chi tiết
                </Button>
              </Link>
              {order.status === "warehouse_cn" && (
                <Link to={`/orders/${order.id}/final-payment`}>
                  <Button size="sm">Thanh toán còn lại</Button>
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
