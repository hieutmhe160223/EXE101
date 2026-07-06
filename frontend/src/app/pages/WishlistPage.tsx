import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Heart } from "lucide-react";
import { Link } from "react-router";

export function WishlistPage() {
  const wishlistItems: Array<{
    id: number;
    image: string;
    nameVi: string;
    nameZh: string;
    price: number;
    seller: string;
  }> = [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Heart className="w-8 h-8 text-primary" />
          Danh sach yeu thich
        </h1>
        <div className="text-muted-foreground">{wishlistItems.length} san pham</div>
      </div>

      <Card className="text-center py-16">
        <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Chua co san pham yeu thich</h3>
        <p className="text-muted-foreground mb-6">
          Danh sach nay se hien thi sau khi co du lieu tu he thong.
        </p>
        <Link to="/order/new">
          <Button>Bat dau mua sam</Button>
        </Link>
      </Card>
    </div>
  );
}
