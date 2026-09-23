import { Card } from "../components/Card";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import api from "../utils/api";

interface SystemSettings {
  exchangeRate: number;
  serviceFeeMinPercent: number;
  serviceFeeMaxPercent: number;
  domesticShippingCny: number;
  internationalShippingVnd: number;
  updatedAt: string;
}

export function ExchangeRatePage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const historyData = [
    { date: "10/06", rate: 3620 },
    { date: "11/06", rate: 3630 },
    { date: "12/06", rate: 3625 },
    { date: "13/06", rate: 3640 },
    { date: "14/06", rate: 3645 },
    { date: "15/06", rate: 3650 },
    { date: "16/06", rate: 3650 },
  ];

  useEffect(() => {
    api.get<SystemSettings>("/settings").then((response) => setSettings(response.data)).catch(() => undefined);
  }, []);

  const exchangeRate = settings?.exchangeRate ?? 3650;
  const serviceRange = settings ? `${settings.serviceFeeMinPercent}-${settings.serviceFeeMaxPercent}%` : "5-8%";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tỷ giá và phí dịch vụ</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary to-orange-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold">Tỷ giá hiện tại</span>
            <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded">
              <Clock className="w-4 h-4" />
              Live
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">{exchangeRate.toLocaleString("vi-VN")} ₫</div>
          <div className="text-sm opacity-90">1 ¥ (CNY)</div>
          <div className="flex items-center gap-2 mt-4 text-sm">
            <TrendingUp className="w-4 h-4" />
            +0.14% so với hôm qua
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Phí dịch vụ</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Phí order</span>
              <span className="font-semibold text-primary">{serviceRange}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Phí vận chuyển nội địa</span>
              <span className="font-semibold">~¥{settings?.domesticShippingCny ?? 10}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Phí ship quốc tế</span>
              <span className="font-semibold">~{(settings?.internationalShippingVnd ?? 25000).toLocaleString("vi-VN")}₫/kg</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Cập nhật</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Lần cuối: {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleString("vi-VN") : "Đang tải"}</p>
            <p>Nguồn: Vietcombank</p>
            <p>Cập nhật mỗi 30 phút</p>
          </div>
        </Card>
      </div>

      <Card className="mb-8">
        <h2 className="text-xl font-semibold mb-6">Lịch sử tỷ giá (7 ngày)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={historyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[3600, 3700]} />
            <Tooltip />
            <Line type="monotone" dataKey="rate" stroke="#FF6A00" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Giải thích phí dịch vụ</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Phí dịch vụ ({serviceRange})</h3>
            <p className="text-sm text-muted-foreground">
              Bao gồm chi phí mua hàng, kiểm tra, đóng gói và vận hành hệ thống. Tỷ lệ phụ thuộc vào loại sản phẩm và giá trị đơn hàng.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Phí vận chuyển nội địa TQ</h3>
            <p className="text-sm text-muted-foreground">
              Chi phí vận chuyển từ người bán đến kho Trung Quốc của Yufiz. Hiện tại khoảng ¥{settings?.domesticShippingCny ?? 10}/đơn hàng.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Phí vận chuyển quốc tế</h3>
            <p className="text-sm text-muted-foreground">
              Tính theo trọng lượng thực tế. Hiện tại khoảng {(settings?.internationalShippingVnd ?? 25000).toLocaleString("vi-VN")}₫/kg cho hàng thường.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
