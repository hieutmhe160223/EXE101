import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Trash2, ShoppingCart, Heart, Loader2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import api from "../utils/api";
import { getCurrentUserId, isAuthenticated } from "../utils/auth";

interface WishlistItem {
  wishlistId: number;
  quoteId: number;
  productNameZh: string;
  productNameVi: string;
  productImage: string;
  priceCny: number;
  priceVndEstimate: number;
  exchangeRate: number;
  addedAt: string;
}

export function WishlistPage() {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const userId = getCurrentUserId();

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn() || !userId) {
      setError("Vui lòng đăng nhập để xem danh sách yêu thích");
      setLoading(false);
      return;
    }
    
    fetchWishlist();
  }, [userId]);

  const fetchWishlist = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/wishlist?userId=${userId}`);
      setWishlistItems(response.data);
    } catch (err: any) {
      console.error("Failed to fetch wishlist:", err);
      if (err.response?.status === 404) {
        setError("Không tìm thấy danh sách yêu thích");
      } else {
        setError("Đã có lỗi xảy ra khi tải danh sách yêu thích");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (quoteId: number) => {
    if (!userId) return;
    
    setRemovingId(quoteId);

    try {
      await api.delete(`/wishlist/${quoteId}?userId=${userId}`);
      // Remove from local state
      setWishlistItems(items => items.filter(item => item.quoteId !== quoteId));
    } catch (err: any) {
      console.error("Failed to remove from wishlist:", err);
      setError("Đã có lỗi xảy ra khi xóa sản phẩm");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải danh sách yêu thích...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card>
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <AlertCircle className="w-16 h-16 text-destructive" />
            <p className="text-lg font-medium">{error}</p>
            {!isLoggedIn() ? (
              <Button onClick={() => navigate("/login")}>Đăng nhập</Button>
            ) : (
              <Button onClick={fetchWishlist}>Thử lại</Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Heart className="w-8 h-8 text-primary" />
          Danh sách yêu thích
        </h1>
        <div className="text-muted-foreground">{wishlistItems.length} sản phẩm</div>
      </div>

      {wishlistItems.length === 0 ? (
        <Card className="text-center py-16">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Chưa có sản phẩm yêu thích</h3>
          <p className="text-muted-foreground mb-6">
            Thêm sản phẩm vào danh sách để theo dõi dễ dàng hơn
          </p>
          <Link to="/order/new">
            <Button>Bắt đầu mua sắm</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.wishlistId} hover>
              <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                {item.productImage ? (
                  <img 
                    src={item.productImage} 
                    alt={item.productNameVi} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Không có hình ảnh
                  </div>
                )}
              </div>
              <h3 className="font-semibold mb-1">{item.productNameVi}</h3>
              <p className="text-sm text-muted-foreground mb-3">{item.productNameZh}</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xl font-bold text-primary">¥{item.priceCny.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">
                  ≈ {item.priceVndEstimate.toLocaleString()}₫
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Thêm vào: {new Date(item.addedAt).toLocaleDateString('vi-VN')}
              </p>
              <div className="flex gap-2">
                <Link to={`/product/${item.quoteId}`} className="flex-1">
                  <Button className="w-full" size="sm">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Đặt hàng
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRemove(item.quoteId)}
                  disabled={removingId === item.quoteId}
                >
                  {removingId === item.quoteId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}