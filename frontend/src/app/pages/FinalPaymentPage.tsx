import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Image, Video, CreditCard } from "lucide-react";
import { useNavigate } from "react-router";

export function FinalPaymentPage() {
  const navigate = useNavigate();

  const inspectionPhotos = [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Thanh toán phần còn lại</h1>

      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Image className="w-5 h-5" />
          Ảnh kiểm hàng
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {inspectionPhotos.map((photo, i) => (
            <div key={i} className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img src={photo} alt={`Inspection ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Video className="w-4 h-4" />
          <button className="text-primary hover:underline">Xem video kiểm hàng</button>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Thanh toán
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tổng đơn hàng</span>
            <span>412,775₫</span>
          </div>
          <div className="flex justify-between text-accent">
            <span>Đã thanh toán (70%)</span>
            <span>-288,943₫</span>
          </div>
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="font-semibold text-lg">Còn lại (30%)</span>
            <span className="text-2xl font-bold text-primary">123,832₫</span>
          </div>
        </div>
      </Card>

      <Button size="lg" className="w-full" onClick={() => navigate("/order/payment")}>
        Thanh toán ngay
      </Button>
    </div>
  );
}
