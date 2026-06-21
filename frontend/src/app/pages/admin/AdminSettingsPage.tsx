import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Save, TrendingUp, DollarSign, Truck } from "lucide-react";

export function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Cài đặt hệ thống</h1>

      <div className="space-y-6">
        <Card>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5" />
            Tỷ giá CNY/VND
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tỷ giá hiện tại (1¥)</label>
              <input
                type="number"
                defaultValue="3650"
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cập nhật lúc</label>
              <input
                type="datetime-local"
                defaultValue="2026-06-16T10:30"
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <Button className="mt-4">
            <Save className="w-4 h-4 mr-2" />
            Cập nhật tỷ giá
          </Button>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5" />
            Phí dịch vụ
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phí dịch vụ tối thiểu (%)</label>
              <input
                type="number"
                defaultValue="5"
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phí dịch vụ tối đa (%)</label>
              <input
                type="number"
                defaultValue="8"
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <Button className="mt-4">
            <Save className="w-4 h-4 mr-2" />
            Lưu cài đặt
          </Button>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
            <Truck className="w-5 h-5" />
            Phí vận chuyển
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phí ship nội địa TQ (¥)</label>
              <input
                type="number"
                defaultValue="10"
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phí ship quốc tế (₫/kg)</label>
              <input
                type="number"
                defaultValue="25000"
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <Button className="mt-4">
            <Save className="w-4 h-4 mr-2" />
            Lưu cài đặt
          </Button>
        </Card>
      </div>
    </div>
  );
}
