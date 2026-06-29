import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CreditCard, Wallet, Building2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export function PaymentMethodPage() {
  const [selectedMethod, setSelectedMethod] = useState<string>("bank");
  const navigate = useNavigate();

  const paymentMethods = [
    {
      id: "bank",
      name: "Chuyển khoản ngân hàng",
      icon: Building2,
      description: "Chuyển khoản qua Vietcombank, ACB, Techcombank...",
    },
    {
      id: "momo",
      name: "Ví MoMo",
      icon: Wallet,
      description: "Thanh toán qua ví điện tử MoMo",
    },
    {
      id: "wallet",
      name: "Ví Yufiz",
      icon: Wallet,
      description: "Số dư: 500,000₫",
      balance: 500000,
    },
  ];

  const handlePayment = () => {
    // Simulate payment processing
    setTimeout(() => {
      navigate("/order/success");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Chọn phương thức thanh toán</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <Card
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`cursor-pointer transition-all ${
                  selectedMethod === method.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{method.name}</h3>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                      {method.balance !== undefined && (
                        <p className="text-sm text-accent mt-1">
                          Còn lại sau thanh toán: {(method.balance - 288943).toLocaleString()}₫
                        </p>
                      )}
                    </div>
                  </div>
                  {selectedMethod === method.id && (
                    <CheckCircle className="w-6 h-6 text-primary" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <h3 className="font-semibold mb-4">Tóm tắt thanh toán</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng đơn hàng</span>
                <span>412,775₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Đặt cọc (70%)</span>
                <span className="font-semibold">288,943₫</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Thanh toán ngay</span>
                <span className="text-xl font-bold text-primary">288,943₫</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <p className="text-xs text-amber-800">
                Số tiền còn lại (30%) sẽ thanh toán sau khi kiểm hàng tại kho TQ
              </p>
            </div>

            <Button size="lg" className="w-full" onClick={handlePayment}>
              Xác nhận thanh toán
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
