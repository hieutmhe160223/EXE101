import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Heart, ShoppingCart, Star, Shield, TrendingUp, ChevronLeft, MessageCircle, Package, Loader2, AlertCircle } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
import api from "../utils/api";

interface ProductQuote {
  quoteId: number;
  nameZh: string;
  nameVi: string;
  descriptionVi: string;
  images: string[];
  priceCny: number;
  priceVndEstimate: number;
  seller: {
    name: string;
    level: string;
    rating: number;
    reviews: number;
  };
  costBreakdown: Array<{
    label: string;
    value: number;
    currency: string;
  }>;
  totalCny: number;
  grandTotalVnd: number;
  depositAmountVnd: number;
  exchangeRate: number;
  exchangeRateUpdatedAt: string;
}

export function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductQuote | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/quotes/${id}`);
      setProduct(response.data);
      if (response.data.images && response.data.images.length > 0) {
        setCurrentImageIndex(0);
      }
    } catch (err: any) {
      console.error("Failed to fetch product details:", err);
      if (err.response?.status === 404) {
        setError("Không tìm thấy sản phẩm");
      } else {
        setError("Đã có lỗi xảy ra khi tải thông tin sản phẩm");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link to="/order/new" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </Link>
        <Card>
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <AlertCircle className="w-16 h-16 text-destructive" />
            <p className="text-lg font-medium">{error || "Không tìm thấy sản phẩm"}</p>
            <Button onClick={() => navigate("/order/new")}>
              Quay lại trang chủ
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/order/new" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6">
        <ChevronLeft className="w-4 h-4" />
        Quay lại
      </Link>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Product Images */}
        <div>
          <div className="bg-muted rounded-xl overflow-hidden mb-4 aspect-square">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[currentImageIndex]}
                alt={product.nameVi}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Không có hình ảnh
              </div>
            )}
          </div>
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <div 
                  key={i} 
                  className={`bg-muted rounded-lg overflow-hidden aspect-square cursor-pointer hover:ring-2 ring-primary ${currentImageIndex === i ? 'ring-2' : ''}`}
                  onClick={() => setCurrentImageIndex(i)}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.nameVi}</h1>
          <p className="text-muted-foreground mb-4">{product.nameZh}</p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-primary text-primary" />
              <span className="font-semibold">{product.seller.rating}</span>
              <span className="text-muted-foreground text-sm">({product.seller.reviews} đánh giá)</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium text-accent">Người bán {product.seller.level}</span>
            </div>
          </div>

          <Card className="mb-6">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-primary">¥{product.priceCny.toFixed(2)}</span>
              <span className="text-lg text-muted-foreground">≈ {product.priceVndEstimate.toLocaleString()}₫</span>
            </div>
            <p className="text-sm text-muted-foreground">Giá chưa bao gồm phí dịch vụ và vận chuyển</p>
          </Card>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Số lượng</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border border-border hover:bg-muted"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center px-4 py-2 rounded-lg border border-border"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg border border-border hover:bg-muted"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <Button variant="outline" className="flex-1">
              <Heart className="w-5 h-5 mr-2" />
              Yêu thích
            </Button>
            <Button 
              className="flex-1" 
              onClick={() => navigate("/order/confirm", { 
                state: { 
                  quoteId: product.quoteId,
                  quantity,
                  selectedVariant 
                } 
              })}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Đặt hàng ngay
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat với shop
            </Button>
            <Button variant="ghost" size="sm" className="flex-1">
              <Package className="w-4 h-4 mr-2" />
              Tìm sản phẩm tương tự
            </Button>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Chi phí ước tính</h2>
        <div className="space-y-3">
          {product.costBreakdown.map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">
                {item.currency === "¥" 
                  ? `¥${item.value.toFixed(2)}` 
                  : `${item.value.toLocaleString()}₫`}
              </span>
            </div>
          ))}
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="font-semibold text-lg">Tổng cộng</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{product.grandTotalVnd.toLocaleString()}₫</div>
              <div className="text-sm text-muted-foreground">≈ ¥{product.totalCny.toFixed(2)}</div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <TrendingUp className="w-4 h-4 inline mr-1" />
            Đặt cọc 70%: <span className="font-semibold">{product.depositAmountVnd.toLocaleString()}₫</span>
          </p>
        </div>
        {product.exchangeRateUpdatedAt && (
          <p className="text-xs text-muted-foreground mt-2">
            Tỷ giá: 1¥ = {product.exchangeRate.toLocaleString()}₫ (Cập nhật: {product.exchangeRateUpdatedAt})
          </p>
        )}
      </Card>

      {/* Product Description */}
      {product.descriptionVi && (
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Mô tả sản phẩm</h2>
          <div className="text-muted-foreground whitespace-pre-wrap">
            {product.descriptionVi}
          </div>
        </Card>
      )}

      {/* Seller Info */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Thông tin người bán</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {product.seller.name[0]}
            </div>
            <div>
              <div className="font-semibold text-lg">{product.seller.name}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-accent" />
                Cấp độ: {product.seller.level}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 mb-1">
              <Star className="w-5 h-5 fill-primary text-primary" />
              <span className="font-semibold text-lg">{product.seller.rating}</span>
            </div>
            <div className="text-sm text-muted-foreground">{product.seller.reviews} đánh giá</div>
          </div>
        </div>
      </Card>
    </div>
  );
}