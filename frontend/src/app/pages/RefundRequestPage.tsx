import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Upload, AlertCircle } from "lucide-react";
import { useState } from "react";

export function RefundRequestPage() {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Yêu cầu hoàn tiền / Trả hàng</h1>

      <Card>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Lý do</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Chọn lý do...</option>
              <option value="wrong_item">Sai sản phẩm</option>
              <option value="damaged">Hàng bị hư hỏng</option>
              <option value="fake">Hàng giả, hàng nhái</option>
              <option value="not_as_described">Không đúng mô tả</option>
              <option value="other">Lý do khác</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mô tả chi tiết</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Vui lòng mô tả chi tiết vấn đề của bạn..."
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ảnh / Video minh chứng</label>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Nhấp để tải lên hoặc kéo thả tệp vào đây
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, MP4 (tối đa 10MB)
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Lưu ý</p>
                <ul className="space-y-1 text-xs">
                  <li>• Yêu cầu hoàn tiền sẽ được xem xét trong 24-48 giờ</li>
                  <li>• Vui lòng cung cấp đầy đủ bằng chứng để xử lý nhanh hơn</li>
                  <li>• Không hoàn tiền cho đơn hàng đã nhận quá 7 ngày</li>
                </ul>
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full">
            Gửi yêu cầu
          </Button>
        </form>
      </Card>
    </div>
  );
}
