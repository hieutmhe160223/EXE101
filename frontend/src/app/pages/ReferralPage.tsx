import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Copy, Share2, Users, Gift } from "lucide-react";

export function ReferralPage() {
  const referralCode = "YUFIZ2026ABC";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Chương trình giới thiệu</h1>

      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 mb-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Giới thiệu bạn bè - Nhận thưởng hấp dẫn!</h2>
          <p className="text-muted-foreground mb-6">
            Nhận 50,000₫ cho mỗi bạn bè đăng ký thành công
          </p>
          <div className="bg-white rounded-xl p-6 mb-4">
            <div className="text-sm text-muted-foreground mb-2">Mã giới thiệu của bạn</div>
            <div className="text-3xl font-bold text-primary mb-4">{referralCode}</div>
            <div className="flex gap-2 justify-center">
              <Button>
                <Copy className="w-4 h-4 mr-2" />
                Sao chép mã
              </Button>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Chia sẻ
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card className="text-center">
          <Users className="w-12 h-12 mx-auto mb-3 text-primary" />
          <div className="text-2xl font-bold mb-1">12</div>
          <div className="text-sm text-muted-foreground">Bạn bè đã mời</div>
        </Card>
        <Card className="text-center">
          <Gift className="w-12 h-12 mx-auto mb-3 text-accent" />
          <div className="text-2xl font-bold mb-1">8</div>
          <div className="text-sm text-muted-foreground">Đã đăng ký thành công</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold mb-1 text-primary">400,000₫</div>
          <div className="text-sm text-muted-foreground">Tổng thưởng đã nhận</div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Cách thức hoạt động</h2>
        <div className="space-y-4">
          {[
            { step: 1, title: "Chia sẻ mã giới thiệu", desc: "Gửi mã của bạn cho bạn bè" },
            { step: 2, title: "Bạn bè đăng ký", desc: "Họ đăng ký và nhập mã của bạn" },
            { step: 3, title: "Nhận thưởng", desc: "Cả hai đều nhận thưởng khi đặt đơn đầu tiên" },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                {item.step}
              </div>
              <div>
                <div className="font-semibold">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
