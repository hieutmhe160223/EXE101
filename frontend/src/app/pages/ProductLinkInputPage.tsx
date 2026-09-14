import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Search, Link as LinkIcon, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import api from "../utils/api";

export function ProductLinkInputPage() {
  const [url, setUrl] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [exchangeRateUpdatedAt, setExchangeRateUpdatedAt] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedSearches = localStorage.getItem("yufiz_recent_searches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
    
    // Fetch exchange rate on mount
    fetchExchangeRate();
  }, []);

  const fetchExchangeRate = async () => {
    try {
      // Try to get exchange rate from a recent quote or config endpoint
      // For now, we'll set a default until we have a specific endpoint
      setExchangeRate(3650);
      setExchangeRateUpdatedAt(new Date().toLocaleString('vi-VN'));
    } catch (err) {
      console.error("Failed to fetch exchange rate:", err);
    }
  };

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("Vui lòng nhập link sản phẩm");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Set timeout riêng cho API analyze - 3 phút (180 giây)
      const response = await api.post("/quotes/analyze", { url: url.trim() }, {
        timeout: 180000 // 3 minutes for product scraping
      });
      const quoteId = response.data.quoteId;

      // Save to recent searches
      const updatedSearches = [
        url.trim(),
        ...recentSearches.filter((item) => item !== url.trim()),
      ].slice(0, 5);

      setRecentSearches(updatedSearches);
      localStorage.setItem("yufiz_recent_searches", JSON.stringify(updatedSearches));

      // Navigate to product detail page with the quote ID
      navigate(`/product/${quoteId}`);
    } catch (err: any) {
      console.error("Analysis error:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 422) {
        setError("Link không hợp lệ hoặc không thể phân tích sản phẩm");
      } else if (err.code === 'ECONNABORTED') {
        setError("Yêu cầu hết thời gian chờ. Vui lòng thử lại");
      } else {
        setError("Đã có lỗi xảy ra, vui lòng thử lại");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem("yufiz_recent_searches");
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
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
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
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError(null);
                  }}
                  placeholder="https://item.taobao.com/item.htm?id=..."
                  className="w-full pl-10 pr-4 py-4 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleAnalyze()}
                  disabled={loading}
                />
              </div>
              <Button 
                size="lg" 
                onClick={handleAnalyze} 
                className="flex items-center justify-center"
                disabled={loading}
              >
                <Search className="w-5 h-5 mr-2" />
                {loading ? "Đang phân tích..." : "Phân tích"}
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
                {exchangeRate ? `1 ¥ = ${exchangeRate.toLocaleString()} đ` : "Đang tải..."}
              </div>
              <p className="text-sm text-muted-foreground">
                {exchangeRateUpdatedAt ? `Cập nhật: ${exchangeRateUpdatedAt}` : ""}
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Tìm kiếm gần đây</h3>
            <button
              onClick={handleClearHistory}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Xóa lịch sử
            </button>
          </div>
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