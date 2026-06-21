import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Trash2, ShoppingCart, Heart } from "lucide-react";
import { Link } from "react-router";

export function WishlistPage() {
  const wishlistItems = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
      nameVi: "Áo thun nam nữ unisex mùa hè",
      nameZh: "夏季新款潮流T恤",
      price: 89,
      seller: "时尚潮流店",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300",
      nameVi: "Giày thể thao nam nữ",
      nameZh: "运动鞋男女款",
      price: 156,
      seller: "运动专卖",
    },
  ];

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
            <Card key={item.id} hover>
              <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                <img src={item.image} alt={item.nameVi} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-semibold mb-1">{item.nameVi}</h3>
              <p className="text-sm text-muted-foreground mb-3">{item.nameZh}</p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-xl font-bold text-primary">¥{item.price}</span>
                <span className="text-sm text-muted-foreground">
                  ≈ {(item.price * 3650).toLocaleString()}₫
                </span>
              </div>
              <div className="flex gap-2">
                <Link to={`/product/${item.id}`} className="flex-1">
                  <Button className="w-full" size="sm">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Đặt hàng
                  </Button>
                </Link>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
