import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Package, MapPin, CreditCard, MessageCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router";

export function OrderDetailPage() {
  const order = {
    id: "YF20260616001",
    status: "shipping",
    timeline: [
      { status: "Đã đặt hàng", date: "2026-06-10 10:30", completed: true },
      { status: "Người bán giao hàng", date: "2026-06-11 15:20", completed: true },
      { status: "Về kho Trung Quốc", date: "2026-06-13 09:15", completed: true },
      { status: "Vận chuyển quốc tế", date: "2026-06-14 14:00", completed: true },
      { status: "Về kho Việt Nam", date: "", completed: false },
      { status: "Đã giao hàng", date: "", completed: false },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Đơn hàng {order.id}</h1>
          <p className="text-muted-foreground">Đang vận chuyển quốc tế</p>
        </div>
        <Link to="/chat">
          <Button variant="outline">
            <MessageCircle className="w-4 h-4 mr-2" />
            Hỗ trợ
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <Card>
            <h2 className="text-xl font-semibold mb-6">Trạng thái đơn hàng</h2>
            <div className="space-y-4">
              {order.timeline.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.completed ? "bg-accent text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {item.completed ? "✓" : index + 1}
                    </div>
                    {index < order.timeline.length - 1 && (
                      <div className={`w-0.5 h-12 ${item.completed ? "bg-accent" : "bg-muted"}`} />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className={`font-medium ${item.completed ? "text-foreground" : "text-muted-foreground"}`}>
                      {item.status}
                    </div>
                    {item.date && (
                      <div className="text-sm text-muted-foreground">{item.date}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Product Info */}
          <Card>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <Package className="w-5 h-5" />
              Thông tin sản phẩm
            </h2>
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"
                  alt="Product"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Áo thun nam nữ unisex mùa hè</h3>
                <p className="text-sm text-muted-foreground mb-2">夏季新款潮流T恤</p>
                <div className="text-sm text-muted-foreground">Phân loại: 红色-M</div>
                <div className="text-sm text-muted-foreground">Số lượng: 1</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Cost Summary */}
          <Card>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5" />
              Chi phí
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng đơn hàng</span>
                <span>412,775₫</span>
              </div>
              <div className="flex justify-between text-accent">
                <span>Đã thanh toán (70%)</span>
                <span>288,943₫</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Còn lại</span>
                <span className="text-primary">123,832₫</span>
              </div>
            </div>
          </Card>

          {/* Shipping Address */}
          <Card>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5" />
              Địa chỉ giao hàng
            </h2>
            <div className="text-sm">
              <div className="font-semibold">Nguyễn Văn A</div>
              <div className="text-muted-foreground">0912345678</div>
              <div className="text-muted-foreground mt-1">
                123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Link to={`/orders/${order.id}/refund`}>
              <Button variant="outline" className="w-full">
                <AlertCircle className="w-4 h-4 mr-2" />
                Yêu cầu hoàn tiền
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
