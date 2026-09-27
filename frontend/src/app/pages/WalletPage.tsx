import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Wallet, Plus, Gift, Ticket, ArrowDownRight, ArrowUpRight, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useRemote, RemoteState } from "../components/RemoteData";
import { WalletTopUp } from "../components/WalletTopUp";
import { money } from "../utils/commerce";
import { Link } from "react-router";

type WalletProfile = {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  walletBalance: number;
  loyaltyPoints: number;
  referralCode: string;
};

type WalletTransaction = {
  id: number;
  amount: number;
  balanceAfter: number;
  type: string;
  description: string;
  reference: string | null;
  createdAt: string;
};

type UserVoucher = {
  id: number;
  code: string;
  name: string;
  endsAt: string;
  usedAt: string | null;
};

type WalletData = {
  profile: WalletProfile;
  transactions: WalletTransaction[];
  vouchers: UserVoucher[];
};

export function WalletPage() {
  const state = useRemote<WalletData>("/user/wallet");
  const [showTopUp, setShowTopUp] = useState(false);

  const profile = state.data?.profile;
  const balance = profile?.walletBalance ?? 0;
  const points = profile?.loyaltyPoints ?? 0;
  const vouchers = state.data?.vouchers ?? [];
  const transactions = state.data?.transactions ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Ví Yufiz của tôi</h1>
          <p className="text-muted-foreground mt-1">Quản lý số dư, điểm thưởng và lịch sử giao dịch nạp/rút.</p>
        </div>
        <Button
          variant={showTopUp ? "outline" : "default"}
          onClick={() => setShowTopUp(!showTopUp)}
          className="self-start sm:self-auto"
        >
          {showTopUp ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Đóng nạp tiền
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Nạp tiền vào ví
            </>
          )}
        </Button>
      </div>

      {/* Form nạp tiền VietQR / SePay */}
      {showTopUp && (
        <div className="mb-8">
          <WalletTopUp onPaid={async () => { await state.refresh(); }} />
        </div>
      )}

      {/* 3 Thẻ thống kê */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary to-orange-600 text-white shadow-lg shadow-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold text-white/90">Số dư ví khả dụng</span>
          </div>
          <div className="text-3xl font-bold mb-3">{money(balance)}</div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowTopUp(true)}
              className="bg-white text-primary hover:bg-white/90 font-medium"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nạp ngay
            </Button>
          </div>
        </Card>

        <Card className="border border-border/80 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600">
              <Gift className="w-6 h-6" />
            </div>
            <span className="font-semibold text-foreground">Điểm thưởng tích lũy</span>
          </div>
          <div className="text-3xl font-bold mb-2 text-amber-600">{points.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Tích điểm khi hoàn tất đơn hàng và giới thiệu bạn bè.</p>
        </Card>

        <Card className="border border-border/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Ticket className="w-6 h-6" />
              </div>
              <span className="font-semibold text-foreground">Mã giảm giá</span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-full">
              {vouchers.length} mã
            </span>
          </div>
          <div className="text-3xl font-bold mb-2 text-primary">{vouchers.length}</div>
          <p className="text-xs text-muted-foreground">Áp dụng trực tiếp tại bước đặt cọc đơn hàng.</p>
        </Card>
      </div>

      {/* Lịch sử giao dịch ví */}
      <RemoteState state={state}>
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Lịch sử giao dịch</h2>
            <Button variant="ghost" size="sm" onClick={state.refresh}>Làm mới</Button>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Chưa có giao dịch nào trong ví.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((tx) => {
                const isPositive = tx.amount >= 0;
                return (
                  <div key={tx.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0 hover:bg-muted/40 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isPositive ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                      }`}>
                        {isPositive ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm sm:text-base">{tx.description}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>{new Date(tx.createdAt).toLocaleString("vi-VN")}</span>
                          {tx.reference && (
                            <>
                              <span>•</span>
                              <span className="font-mono">Mã: {tx.reference}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-semibold text-sm sm:text-base ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                        {isPositive ? "+" : ""}{money(tx.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Số dư sau: {money(tx.balanceAfter)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Mã giảm giá của tôi */}
        {vouchers.length > 0 && (
          <Card>
            <h2 className="text-xl font-semibold mb-4">Mã giảm giá đang sở hữu</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {vouchers.map((v) => (
                <div key={v.id} className="p-4 rounded-xl border border-dashed border-primary/40 bg-primary/[0.03]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-primary tracking-wide">{v.code}</span>
                    {v.usedAt ? (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">Đã dùng</span>
                    ) : (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium">Khả dụng</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground">{v.name}</p>
                  <p className="text-xs text-muted-foreground mt-2">Hết hạn: {new Date(v.endsAt).toLocaleDateString("vi-VN")}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </RemoteState>
    </div>
  );
}
