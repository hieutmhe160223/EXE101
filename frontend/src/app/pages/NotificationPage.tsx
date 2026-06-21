import { Card } from "../components/Card";
import { Package, Gift, Bell, AlertCircle } from "lucide-react";

export function NotificationPage() {
  const notifications = [
    {
      id: 1,
      type: "order",
      icon: Package,
      title: "Đơn hàng đang vận chuyển",
      message: "Đơn hàng YF20260616001 đang trên đường về Việt Nam",
      time: "2 giờ trước",
      read: false,
    },
    {
      id: 2,
      type: "promo",
      icon: Gift,
      title: "Khuyến mãi đặc biệt",
      message: "Giảm 10% cho đơn hàng tiếp theo. Mã: SUMMER2026",
      time: "1 ngày trước",
      read: false,
    },
    {
      id: 3,
      type: "system",
      icon: Bell,
      title: "Cập nhật tỷ giá",
      message: "Tỷ giá mới: 1¥ = 3,650₫",
      time: "2 ngày trước",
      read: true,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Thông báo</h1>

      <div className="space-y-3">
        {notifications.map((notif) => {
          const Icon = notif.icon;
          return (
            <Card
              key={notif.id}
              className={`cursor-pointer hover:shadow-md transition-all ${
                !notif.read ? "border-l-4 border-l-primary bg-orange-50/30" : ""
              }`}
            >
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notif.type === "order" ? "bg-primary/10 text-primary" :
                  notif.type === "promo" ? "bg-accent/10 text-accent" :
                  "bg-muted text-muted-foreground"
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{notif.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{notif.message}</p>
                  <p className="text-xs text-muted-foreground">{notif.time}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
