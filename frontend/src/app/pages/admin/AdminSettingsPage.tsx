import { useEffect, useState } from "react";
import { DollarSign, RefreshCw, Save, TrendingUp, Truck } from "lucide-react";
import api from "../../utils/api";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";

interface SystemSettings {
  exchangeRate: number;
  serviceFeeMinPercent: number;
  serviceFeeMaxPercent: number;
  domesticShippingCny: number;
  internationalShippingVnd: number;
  updatedAt: string;
}

const defaultSettings: SystemSettings = {
  exchangeRate: 0,
  serviceFeeMinPercent: 0,
  serviceFeeMaxPercent: 0,
  domesticShippingCny: 0,
  internationalShippingVnd: 0,
  updatedAt: "",
};

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshingRate, setRefreshingRate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<SystemSettings>("/v1/admin/settings")
      .then((response) => setSettings(response.data))
      .catch((err: any) => setError(err?.response?.data?.message || "Không thể tải cài đặt hệ thống."))
      .finally(() => setLoading(false));
  }, []);

  const updateValue = (key: keyof SystemSettings, value: string) => {
    setSettings((current) => ({ ...current, [key]: Number(value) }));
  };

  const saveSettings = async () => {
    if (settings.exchangeRate <= 0 || settings.serviceFeeMinPercent < 0 || settings.serviceFeeMaxPercent < settings.serviceFeeMinPercent || settings.domesticShippingCny < 0 || settings.internationalShippingVnd < 0) {
      setError("Vui lòng nhập các giá trị hợp lệ.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await api.patch<SystemSettings>("/v1/admin/settings", settings);
      setSettings(response.data);
      alert("Đã cập nhật cài đặt hệ thống.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể lưu cài đặt hệ thống.");
    } finally {
      setSaving(false);
    }
  };

  const refreshExchangeRate = async () => {
    setRefreshingRate(true);
    setError(null);
    try {
      const response = await api.post<SystemSettings>("/v1/admin/settings/exchange-rate/refresh");
      setSettings(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể lấy tỷ giá mới từ API.");
    } finally {
      setRefreshingRate(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-muted-foreground">Đang tải cài đặt hệ thống...</div>;

  const field = (label: string, key: keyof SystemSettings, suffix: string) => (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <input type="number" min="0" step="0.01" value={settings[key] as number} onChange={(event) => updateValue(key, event.target.value)} readOnly={key === "exchangeRate"} className={`w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary ${key === "exchangeRate" ? "cursor-not-allowed bg-slate-100" : ""}`} />
        <span className="text-sm text-muted-foreground whitespace-nowrap">{suffix}</span>
      </div>
    </div>
  );

  return <div className="p-6 max-w-5xl mx-auto"><div className="flex items-center justify-between mb-8"><div><h1 className="text-3xl font-bold">Cài đặt hệ thống</h1><p className="text-sm text-muted-foreground mt-1">Tỷ giá được tự động cập nhật mỗi 30 phút. Các khoản phí áp dụng cho lượt tính giá mới.</p></div><Button onClick={saveSettings} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Đang lưu..." : "Lưu phí"}</Button></div>{error && <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{error}</div>}<div className="space-y-6"><Card><div className="flex items-center justify-between mb-6"><h2 className="text-xl font-semibold flex items-center gap-2"><TrendingUp className="w-5 h-5" />Tỷ giá CNY/VND</h2><Button variant="outline" onClick={refreshExchangeRate} disabled={refreshingRate}><RefreshCw className={`w-4 h-4 mr-2 ${refreshingRate ? "animate-spin" : ""}`} />{refreshingRate ? "Đang cập nhật..." : "Cập nhật từ API"}</Button></div>{field("Tỷ giá hiện tại (1 ¥)", "exchangeRate", "₫")}<p className="text-xs text-muted-foreground mt-2">Lần cập nhật gần nhất: {settings.updatedAt ? new Date(settings.updatedAt).toLocaleString("vi-VN") : "Chưa có"}</p></Card><Card><h2 className="text-xl font-semibold flex items-center gap-2 mb-6"><DollarSign className="w-5 h-5" />Phí dịch vụ</h2><div className="grid md:grid-cols-2 gap-4">{field("Phí dịch vụ tối thiểu", "serviceFeeMinPercent", "%")}{field("Phí dịch vụ tối đa", "serviceFeeMaxPercent", "%")}</div></Card><Card><h2 className="text-xl font-semibold flex items-center gap-2 mb-6"><Truck className="w-5 h-5" />Phí vận chuyển</h2><div className="grid md:grid-cols-2 gap-4">{field("Phí ship nội địa Trung Quốc", "domesticShippingCny", "¥")}{field("Phí ship quốc tế", "internationalShippingVnd", "₫/kg")}</div></Card></div></div>;
}
