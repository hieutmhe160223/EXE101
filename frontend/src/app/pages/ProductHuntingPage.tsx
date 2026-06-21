import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Upload, Search } from "lucide-react";

export function ProductHuntingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Dịch vụ tìm hàng</h1>
      <p className="text-muted-foreground mb-8">
        Không tìm thấy sản phẩm? Gửi yêu cầu và đội ngũ của chúng tôi sẽ giúp bạn tìm kiếm!
      </p>

      <Card>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Mô tả sản phẩm</label>
            <textarea
              rows={4}
              placeholder="Vui lòng mô tả chi tiết sản phẩm bạn cần tìm..."
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ngân sách dự kiến (¥)</label>
            <input
              type="number"
              placeholder="100"
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ảnh tham khảo</label>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Tải lên ảnh sản phẩm mẫu</p>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full">
            <Search className="w-5 h-5 mr-2" />
            Gửi yêu cầu tìm hàng
          </Button>
        </form>
      </Card>
    </div>
  );
}
