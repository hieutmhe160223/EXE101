import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { MapPin, Package, CreditCard, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

export function OrderConfirmationPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Xác nhận đơn hàng</h1>

      <div className="space-y-6">
        {/* Shipping Address */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Địa chỉ giao hàng
            </h2>
            <Button variant="ghost" size="sm">Thay đổi</Button>
          </div>
          <div>
            <div className="font-semibold mb-1">Nguyễn Văn A</div>
            <div className="text-muted-foreground">0912345678</div>
            <div className="text-muted-foreground">
              123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh
            </div>
          </div>
        </Card>

        {/* Product Summary */}
        <Card>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Package className="w-5 h-5" />
            Sản phẩm
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
              <p className="text-sm text-muted-foreground mb-2">Màu: 红色-M</p>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Số lượng: 1</span>
                <span className="font-semibold">¥89</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Cost Summary */}
        <Card>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5" />
            Chi phí
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Giá sản phẩm</span>
              <span>¥89</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phí vận chuyển nội địa TQ</span>
              <span>¥10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phí dịch vụ (5%)</span>
              <span>¥4.5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phí vận chuyển quốc tế</span>
              <span>25,000₫</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bảo hiểm</span>
              <span>10,000₫</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-semibold text-lg">Tổng cộng</span>
              <span className="text-2xl font-bold text-primary">412,775₫</span>
            </div>
          </div>
        </Card>

        {/* Deposit Info */}
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <h3 className="font-semibold mb-2">💰 Thanh toán đặt cọc</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Bạn cần thanh toán 70% giá trị đơn hàng để xác nhận. Số tiền còn lại sẽ được thanh toán sau khi kiểm hàng tại kho Trung Quốc.
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground">Đặt cọc:</span>
            <span className="text-2xl font-bold text-primary">288,943₫</span>
            <span className="text-sm text-muted-foreground">(70%)</span>
          </div>
        </Card>

        <Button
          size="lg"
          className="w-full"
          onClick={() => navigate("/order/payment")}
        >
          Tiếp tục thanh toán
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
