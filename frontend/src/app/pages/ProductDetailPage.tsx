import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Heart, ShoppingCart, Shield, Star } from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CostSummary } from "../components/CostSummary";
import api from "../utils/api";
import { getUserId, isLoggedIn } from "../utils/auth";
import { Quote, Price, money, errorMessage } from "../utils/commerce";

export function ProductDetailPage() {
  const { id } = useParams(); const navigate = useNavigate();
  const [product, setProduct] = useState<Quote | null>(null);
  const [price, setPrice] = useState<Price | null>(null);
  const [variant, setVariant] = useState("");
  const [quantity, setQuantity] = useState(1); const [image, setImage] = useState(0);
  const [error, setError] = useState(""); const [actionError, setActionError] = useState("");
  const [favorite, setFavorite] = useState(false); const [saving, setSaving] = useState(false);
  const [pricing, setPricing] = useState(true); const [similar, setSimilar] = useState<Quote[]>([]);
  useEffect(() => {
    let active = true; setProduct(null); setError(""); setFavorite(false); setQuantity(1); setImage(0);
    api.get<Quote>(`/quotes/${id}`).then(r => { if (active) { setProduct(r.data); setVariant(r.data.variants?.find(v => v.stock == null || v.stock > 0)?.variantId || ""); } }).catch(e => { if (active) setError(errorMessage(e)); });
    if (isLoggedIn()) api.get(`/wishlist/check/${id}`, { params: { userId: getUserId() } }).then(r => { if (active) setFavorite(r.data); }).catch(() => {});
    api.get<Quote[]>(`/quotes/${id}/similar-products`).then(r => { if (active) setSimilar(r.data); }).catch(() => { if (active) setSimilar([]); });
    return () => { active = false; };
  }, [id]);
  useEffect(() => {
    let active = true; setPricing(true); setPrice(null);
    api.get<Price>(`/quotes/${id}/price-preview`, { params: { quantity, variant: variant || undefined } })
      .then(r => { if (active) { setPrice(r.data); setActionError(""); } })
      .catch(e => { if (active) setActionError(errorMessage(e)); }).finally(() => { if (active) setPricing(false); });
    return () => { active = false; };
  }, [id, quantity, variant]);
  const toggle = async () => {
    if (!isLoggedIn()) { navigate(`/login?next=${encodeURIComponent("/product/" + id)}`); return; }
    setSaving(true); setActionError("");
    try {
      if (favorite) await api.delete(`/wishlist/${id}`, { params: { userId: getUserId() } });
      else await api.post("/wishlist", { userId: getUserId(), productQuoteId: Number(id) });
      setFavorite(!favorite);
    } catch (e) { setActionError(errorMessage(e)); } finally { setSaving(false); }
  };
  if (error) return <div className="max-w-4xl mx-auto p-8"><Card><p role="alert">{error}</p><Link to="/order/new">Nhập link khác</Link></Card></div>;
  if (!product) return <p className="p-12 text-center" role="status">Đang tải sản phẩm...</p>;
  const expired = !product.expiresAt || new Date(product.expiresAt).getTime() <= Date.now();
  return <div className="max-w-7xl mx-auto px-4 py-8">
    <Link to="/order/new" className="text-primary">← Nhập link khác</Link>
    <div className="grid lg:grid-cols-2 gap-8 my-6">
      <div>
        <div className="aspect-square bg-muted rounded-xl overflow-hidden">
          {product.images[image] ? <img src={product.images[image]} alt={product.nameVi} className="w-full h-full object-contain" /> : <p className="p-8">Chưa có ảnh</p>}
        </div>
        <div className="flex gap-2 overflow-x-auto mt-3">{product.images.map((src, i) => <button key={src} onClick={() => setImage(i)} aria-label={`Xem ảnh ${i + 1}`} className={`w-20 h-20 shrink-0 border-2 rounded-lg overflow-hidden ${i === image ? "border-primary" : "border-transparent"}`}><img src={src} alt="" className="w-full h-full object-cover" /></button>)}</div>
      </div>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">{product.nameVi || product.nameZh}</h1><p className="text-muted-foreground">{product.nameZh}</p>
        <p className="text-3xl font-bold text-primary">¥{product.priceCny.toFixed(2)} <span className="text-base font-normal">≈ {money(product.priceVndEstimate)}</span></p>
        <Card>
          <h2 className="font-semibold">{product.seller.name}</h2>
          <div className="flex items-center gap-2 my-2"><Shield size={18} />Uy tín: {product.seller.level === "UNKNOWN" ? "Chưa đủ dữ liệu" : product.seller.level}</div>
          <div className="flex items-center gap-2"><Star size={18} />{product.seller.rating == null ? "Chưa có điểm" : product.seller.rating + "/5"} · {product.seller.reviews == null ? "Chưa có số đánh giá" : product.seller.reviews + " đánh giá"}</div>
          <p className="text-xs text-muted-foreground mt-2">L1–L7 là thang điểm nội bộ từ dữ liệu nguồn; điểm sao quy đổi từ tỷ lệ đánh giá tốt. Pro theo thông tin nguồn.</p>
        </Card>
        {product.sourcePriceVerified === false && <p className="text-amber-800 text-sm">Giá nguồn là giá tham khảo chưa được nhà cung cấp dữ liệu xác minh; cần kiểm tra lại trước khi mua.</p>}
        {product.variants?.length > 0 && <label className="block">Phân loại<select aria-label="Phân loại" value={variant} onChange={e => setVariant(e.target.value)} className="block w-full border rounded-lg p-3 mt-2">{product.variants.map(v => <option key={v.variantId} value={v.variantId} disabled={v.stock === 0}>{v.label} — ¥{v.priceCny}</option>)}</select></label>}
        <label className="block">Số lượng <input aria-label="Số lượng" type="number" min={1} max={100} value={quantity} onChange={e => setQuantity(Math.min(100, Math.max(1, Number.parseInt(e.target.value) || 1)))} className="ml-4 border rounded-lg p-2 w-24" /></label>
        {actionError && <p role="alert" className="text-red-700">{actionError}</p>}
        {expired && <p className="text-amber-800">Báo giá đã hết hạn. Vui lòng phân tích lại link trước khi đặt hàng.</p>}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={toggle} disabled={saving}><Heart className={`inline mr-2 ${favorite ? "fill-red-500 text-red-500" : ""}`} size={18} />{favorite ? "Đã yêu thích" : "Yêu thích"}</Button>
          <Button disabled={pricing || !price || expired} onClick={() => navigate(`/order/confirm?quoteId=${id}&quantity=${quantity}&variant=${encodeURIComponent(variant)}`)}><ShoppingCart className="inline mr-2" size={18} />Đặt hàng ngay</Button>
        </div>
        <Card><h2 className="font-semibold mb-4">Chi phí cho {quantity} sản phẩm</h2>{pricing ? <p role="status">Đang tính giá...</p> : price && <CostSummary price={price} />}
          <p className="text-xs text-muted-foreground mt-3">1 ¥ = {money(product.exchangeRate)}{product.exchangeRateUpdatedAt ? " · Cập nhật " + product.exchangeRateUpdatedAt : " · Chưa có thời điểm cập nhật"}</p>
        </Card>
      </div>
    </div>
    <Card><h2 className="text-xl font-semibold mb-3">Mô tả sản phẩm</h2>
      {!product.translationComplete && <p className="text-amber-800 text-sm mb-2">Bản dịch chưa hoàn tất; một phần nội dung có thể đang là bản gốc.</p>}
      <p className="whitespace-pre-wrap">{product.descriptionVi || "Chưa có mô tả từ nguồn."}</p>
    </Card>
    <section className="mt-8"><h2 className="text-xl font-semibold mb-4">Sản phẩm tương tự</h2>
      <p className="text-sm text-muted-foreground mb-3">Gợi ý từ các sản phẩm đã phân tích, dựa trên từ khóa và khoảng giá.</p>
      {similar.length === 0 ? <p>Chưa có sản phẩm phù hợp để gợi ý.</p> : <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{similar.map(item => <Link key={item.quoteId} to={`/product/${item.quoteId}`}><Card hover>{item.images[0] && <img className="aspect-square object-cover rounded-lg mb-3" src={item.images[0]} alt="" />}<h3>{item.nameVi}</h3><p className="text-primary">{money(item.priceVndEstimate)}</p></Card></Link>)}</div>}
    </section>
  </div>;
}
