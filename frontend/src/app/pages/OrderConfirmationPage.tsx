import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CostSummary } from "../components/CostSummary";
import api from "../utils/api";
import { getUserId, isLoggedIn } from "../utils/auth";
import { Quote, Price, errorMessage } from "../utils/commerce";

export function OrderConfirmationPage() {
  const [params] = useSearchParams(); const location = useLocation(); const navigate = useNavigate();
  const quoteId = Number(params.get("quoteId") || location.state?.quoteId);
  const quantity = Number(params.get("quantity") || location.state?.quantity || 1);
  const variant = params.get("variant") || "";
  const [quote, setQuote] = useState<Quote | null>(null); const [price, setPrice] = useState<Price | null>(null);
  const [address, setAddress] = useState(""); const [note, setNote] = useState("");
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const [requestKey] = useState(() => {
    const key = "checkout:" + quoteId + ":" + quantity + ":" + variant;
    const value = sessionStorage.getItem(key) || crypto.randomUUID();
    sessionStorage.setItem(key, value); return value;
  });
  const back = `/order/confirm?quoteId=${quoteId}&quantity=${quantity}&variant=${encodeURIComponent(variant)}`;
  useEffect(() => {
    if (!isLoggedIn() || !Number.isInteger(quoteId) || quoteId <= 0) return;
    let active = true;
    Promise.all([api.get<Quote>(`/quotes/${quoteId}`), api.get<Price>(`/quotes/${quoteId}/price-preview`, { params: { quantity, variant: variant || undefined } })])
      .then(([q,p]) => { if(active) { setQuote(q.data); setPrice(p.data); } }).catch(e => { if(active) setError(errorMessage(e)); });
    return () => { active = false; };
  }, [quoteId, quantity, variant]);
  if (!isLoggedIn()) return <div className="max-w-xl mx-auto p-8"><Card><p className="mb-4">Vui lòng đăng nhập để đặt hàng.</p><Link to={`/login?next=${encodeURIComponent(back)}`}><Button>Đăng nhập</Button></Link></Card></div>;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (busy || !price || !quote) return;
    setBusy(true); setError("");
    try {
      const response = await api.post("/orders", { customerId: getUserId(), productQuoteId: quoteId, quantity, variantSelected: variant || null, shippingAddress: address.trim(), customerNote: note.trim(), requestKey, expectedTotalVnd: price.grandTotalVnd });
      sessionStorage.removeItem("checkout:" + quoteId + ":" + quantity + ":" + variant);
      navigate(`/order/payment?orderId=${response.data.orderId}`, { replace: true });
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };
  return <div className="max-w-4xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-6">Xác nhận đơn hàng</h1>
    {error && <p role="alert" className="text-red-700 mb-4">{error}</p>}
    {!quote || !price ? <p>{error ? "Không thể tải báo giá. Vui lòng quay lại sản phẩm." : "Đang tải báo giá..."}</p> :
      <form onSubmit={submit} className="space-y-5">
        <Card><h2 className="font-semibold mb-3">{quote.nameVi}</h2><p>Số lượng: {quantity}</p>{variant && <p>Phân loại: {quote.variants.find(v => v.variantId === variant)?.label}</p>}<Link className="text-primary" to={`/product/${quoteId}`}>Quay lại sản phẩm</Link></Card>
        <Card><label className="block font-semibold mb-2" htmlFor="address">Địa chỉ giao hàng</label>
          <textarea id="address" required maxLength={500} value={address} onChange={e => setAddress(e.target.value)} rows={3} className="w-full border rounded-lg p-3" placeholder="Tên người nhận, số điện thoại, số nhà, đường, phường/xã, tỉnh/thành" disabled={busy} />
          <label className="block mt-3 mb-2" htmlFor="note">Ghi chú (tùy chọn)</label><textarea id="note" maxLength={1000} value={note} onChange={e => setNote(e.target.value)} className="w-full border rounded-lg p-3" disabled={busy} />
        </Card>
        <Card><h2 className="font-semibold mb-4">Chi phí xác nhận</h2><CostSummary price={price} /></Card>
        <Button type="submit" size="lg" className="w-full" disabled={busy || !address.trim()}>{busy ? "Đang tạo đơn..." : "Tạo đơn và tiếp tục thanh toán"}</Button>
      </form>}
  </div>;
}
