import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Search, Link as LinkIcon, Clock, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export function ProductLinkInputPage() {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  const recentSearches = [
    "https://item.taobao.com/item.htm?id=123456789",
    "https://2.taobao.com/item.htm?id=987654321",
    "https://market.m.taobao.com/app/idleFish-F2e/widle-taobao-rax/...",
  ];

  const handleAnalyze = () => {
    if (url) {
      navigate("/product/123");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Đặt hàng Taobao & Xianyu</h1>
        <p className="text-lg text-muted-foreground">
          Dán link sản phẩm để bắt đầu đặt hàng
        </p>
      </div>

      <Card className="mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Link sản phẩm Taobao / Xianyu
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://item.taobao.com/item.htm?id=..."
                  className="w-full pl-10 pr-4 py-4 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button size="lg" onClick={handleAnalyze}>
                <Search className="w-5 h-5 mr-2" />
                Phân tích
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>✓ Hỗ trợ Taobao</span>
            <span>✓ Hỗ trợ Xianyu</span>
            <span>✓ Hỗ trợ Tmall</span>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Tỷ giá hôm nay</h3>
              <div className="text-2xl font-bold text-primary mb-1">
                1 ¥ = 3,650 đ
              </div>
              <p className="text-sm text-muted-foreground">
                Cập nhật: 16/06/2026 10:30
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Thời gian xử lý</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• Phân tích sản phẩm: 5-10 phút</p>
                <p>• Mua hàng: 1-2 ngày</p>
                <p>• Vận chuyển: 7-10 ngày</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {recentSearches.length > 0 && (
        <Card>
          <h3 className="font-semibold mb-4">Tìm kiếm gần đây</h3>
          <div className="space-y-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => setUrl(search)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors text-left"
              >
                <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground truncate">
                  {search}
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
        <h3 className="font-semibold mb-2">💡 Mẹo đặt hàng</h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Kiểm tra kỹ đánh giá và xếp hạng người bán trước khi đặt</li>
          <li>• Chọn người bán có cấp độ L7 hoặc Pro để đảm bảo uy tín</li>
          <li>• Đọc kỹ mô tả sản phẩm và hỏi người bán nếu có thắc mắc</li>
          <li>• Sử dụng dịch vụ kiểm hàng để đảm bảo chất lượng</li>
        </ul>
      </div>
    </div>
  );
}
