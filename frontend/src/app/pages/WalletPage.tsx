import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, Gift, Ticket } from "lucide-react";

export function WalletPage() {
  const transactions = [
    { id: 1, type: "deposit", amount: 500000, desc: "Nạp tiền", date: "2026-06-15" },
    { id: 2, type: "payment", amount: -288943, desc: "Thanh toán đơn YF20260616001", date: "2026-06-10" },
    { id: 3, type: "refund", amount: 100000, desc: "Hoàn tiền đơn YF20260608003", date: "2026-06-08" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Ví của tôi</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary to-orange-600 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-8 h-8" />
            <span className="font-semibold">Số dư ví</span>
          </div>
          <div className="text-3xl font-bold mb-2">311,057₫</div>
          <Button variant="secondary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nạp tiền
          </Button>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-8 h-8 text-accent" />
            <span className="font-semibold">Điểm thưởng</span>
          </div>
          <div className="text-3xl font-bold mb-2 text-accent">1,250</div>
          <p className="text-sm text-muted-foreground">≈ 12,500₫</p>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Ticket className="w-8 h-8 text-primary" />
            <span className="font-semibold">Mã giảm giá</span>
          </div>
          <div className="text-3xl font-bold mb-2 text-primary">3</div>
          <Button variant="ghost" size="sm" className="text-primary">Xem tất cả</Button>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-6">Lịch sử giao dịch</h2>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-muted rounded-lg transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === "deposit" ? "bg-accent/10" :
                  tx.type === "refund" ? "bg-blue-100" : "bg-muted"
                }`}>
                  {tx.type === "deposit" || tx.type === "refund" ? (
                    <ArrowDownRight className={`w-5 h-5 ${tx.type === "deposit" ? "text-accent" : "text-blue-600"}`} />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{tx.desc}</div>
                  <div className="text-sm text-muted-foreground">{tx.date}</div>
                </div>
              </div>
              <div className={`font-semibold ${tx.amount > 0 ? "text-accent" : "text-foreground"}`}>
                {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()}₫
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
