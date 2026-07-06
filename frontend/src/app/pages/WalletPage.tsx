import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Wallet, Plus, Gift, Ticket } from "lucide-react";

type WalletTransaction = {
  id: number;
  type: string;
  amount: number;
  desc: string;
  date: string;
};

export function WalletPage() {
  const transactions: WalletTransaction[] = [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Vi cua toi</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary to-orange-600 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-8 h-8" />
            <span className="font-semibold">So du vi</span>
          </div>
          <div className="text-3xl font-bold mb-2">0 VND</div>
          <Button variant="secondary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nap tien
          </Button>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-8 h-8 text-accent" />
            <span className="font-semibold">Diem thuong</span>
          </div>
          <div className="text-3xl font-bold mb-2 text-accent">0</div>
          <p className="text-sm text-muted-foreground">Du lieu se duoc cap nhat tu backend.</p>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Ticket className="w-8 h-8 text-primary" />
            <span className="font-semibold">Ma giam gia</span>
          </div>
          <div className="text-3xl font-bold mb-2 text-primary">0</div>
          <Button variant="ghost" size="sm" className="text-primary">Xem tat ca</Button>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-6">Lich su giao dich</h2>
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Chua co giao dich nao.
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-muted rounded-lg transition-colors">
                <div>
                  <div className="font-medium">{tx.desc}</div>
                  <div className="text-sm text-muted-foreground">{tx.date}</div>
                </div>
                <div className={`font-semibold ${tx.amount > 0 ? "text-accent" : "text-foreground"}`}>
                  {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} VND
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
