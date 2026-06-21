import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Heart, ShoppingCart, Star, Shield, TrendingUp, ChevronLeft, MessageCircle, Package } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useState } from "react";

export function ProductDetailPage() {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("红色-M");

  const product = {
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
    ],
    nameZh: "夏季新款潮流T恤男女同款短袖",
    nameVi: "Áo thun nam nữ unisex mùa hè phong cách thời trang",
    price: 89,
    seller: {
      name: "时尚潮流店",
      level: "L7",
      rating: 4.8,
      reviews: 2341,
    },
    variants: ["红色-M", "红色-L", "蓝色-M", "蓝色-L", "黑色-M", "黑色-L"],
  };

  const costBreakdown = [
    { label: "Giá sản phẩm", value: product.price * quantity, currency: "¥" },
    { label: "Phí vận chuyển nội địa TQ", value: 10, currency: "¥" },
    { label: "Phí dịch vụ (5%)", value: (product.price * quantity * 0.05), currency: "¥" },
    { label: "Phí vận chuyển quốc tế", value: 25000, currency: "₫" },
    { label: "Bảo hiểm", value: 10000, currency: "₫" },
  ];

  const totalCNY = costBreakdown.filter(c => c.currency === "¥").reduce((sum, c) => sum + c.value, 0);
  const totalVND = costBreakdown.filter(c => c.currency === "₫").reduce((sum, c) => sum + c.value, 0);
  const grandTotal = Math.round(totalCNY * 3650 + totalVND);

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
            <img
              src={product.images[0]}
              alt={product.nameVi}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img, i) => (
              <div key={i} className="bg-muted rounded-lg overflow-hidden aspect-square cursor-pointer hover:ring-2 ring-primary">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
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
              <span className="text-3xl font-bold text-primary">¥{product.price}</span>
              <span className="text-lg text-muted-foreground">≈ {(product.price * 3650).toLocaleString()}₫</span>
            </div>
            <p className="text-sm text-muted-foreground">Giá chưa bao gồm phí dịch vụ và vận chuyển</p>
          </Card>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Phân loại</label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant}
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedVariant === variant
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {variant}
                </button>
              ))}
            </div>
          </div>

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
            <Button className="flex-1" onClick={() => navigate("/order/confirm")}>
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
          {costBreakdown.map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">
                {item.currency === "¥" ? `¥${item.value.toFixed(1)}` : `${item.value.toLocaleString()}₫`}
              </span>
            </div>
          ))}
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="font-semibold text-lg">Tổng cộng</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{grandTotal.toLocaleString()}₫</div>
              <div className="text-sm text-muted-foreground">≈ ¥{totalCNY.toFixed(1)}</div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <TrendingUp className="w-4 h-4 inline mr-1" />
            Đặt cọc 70%: <span className="font-semibold">{Math.round(grandTotal * 0.7).toLocaleString()}₫</span>
          </p>
        </div>
      </Card>

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
