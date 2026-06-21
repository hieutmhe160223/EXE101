import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CheckCircle, Package, Home } from "lucide-react";
import { Link } from "react-router";

export function OrderSuccessPage() {
  const orderId = "YF" + Date.now().toString().slice(-8);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-16 h-16 text-accent" />
      </div>

      <h1 className="text-3xl font-bold mb-4">Đặt hàng thành công!</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Cảm ơn bạn đã tin tưởng Yufiz. Đơn hàng của bạn đang được xử lý.
      </p>

      <Card className="mb-8">
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Mã đơn hàng</div>
            <div className="text-2xl font-bold text-primary">{orderId}</div>
          </div>
          <div className="border-t pt-4">
            <div className="text-sm text-muted-foreground mb-1">Số tiền đã thanh toán</div>
            <div className="text-xl font-semibold">288,943₫</div>
          </div>
          <div className="border-t pt-4">
            <div className="text-sm text-muted-foreground mb-2">Bước tiếp theo</div>
            <p className="text-sm">
              Chúng tôi sẽ mua hàng từ người bán trong vòng 1-2 ngày. Bạn sẽ nhận được thông báo khi hàng về kho Trung Quốc.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to={`/orders/${orderId}`}>
          <Button size="lg">
            <Package className="w-5 h-5 mr-2" />
            Theo dõi đơn hàng
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" size="lg">
            <Home className="w-5 h-5 mr-2" />
            Về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}
