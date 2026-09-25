import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, CircleDollarSign, ShieldCheck } from "lucide-react";
import { useOrder } from "../utils/useOrder";
import { getUserId } from "../utils/auth";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import api from "../utils/api";
import { errorMessage, money } from "../utils/commerce";

export function RefundRequestPage() {
  const { id } = useParams();
  const { order, error } = useOrder(id);
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const refundable = Math.max(0, (order?.paidAmountVnd ?? 0) - (order?.refundedAmountVnd ?? 0));

  useEffect(() => {
    if (order && !amount) setAmount(String(refundable));
  }, [order, refundable, amount]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await api.post(`/orders/${id}/return-requests`, {
        customerId: getUserId(), reason, evidenceUrl: evidence || null, requestedAmountVnd: Number(amount),
      });
      setSent(true);
      setMessage("Đã gửi yêu cầu. Yufiz sẽ thông báo khi yêu cầu được duyệt hoặc từ chối.");
    } catch (requestError) {
      setMessage(errorMessage(requestError));
    } finally { setBusy(false); }
  };

  if (error) return <p role="alert" className="p-6">{error}</p>;
  if (!order) return <p className="p-6">Đang tải...</p>;
  const eligible = ["FINAL_PAID", "DELIVERING", "COMPLETED"].includes(order.status) && refundable > 0;

  return <div className="max-w-3xl mx-auto p-6 space-y-6">
    <Link className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary" to={`/orders/${id}`}><ArrowLeft className="w-4 h-4" /> Quay lại đơn hàng</Link>
    <div><p className="text-sm font-medium text-primary">Yêu cầu hoàn tiền</p><h1 className="text-3xl font-bold mt-1">Đơn {order.orderCode}</h1><p className="text-muted-foreground mt-2">Tiền được duyệt sẽ cộng trực tiếp vào Ví Yufiz và có mã giao dịch để tra soát.</p></div>
    <div className="grid sm:grid-cols-2 gap-4">
      <Card className="flex items-center gap-4"><span className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><CircleDollarSign /></span><div><p className="text-sm text-muted-foreground">Có thể yêu cầu tối đa</p><strong className="text-xl">{money(refundable)}</strong></div></Card>
      <Card className="flex items-center gap-4"><span className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><ShieldCheck /></span><div><p className="text-sm text-muted-foreground">Đã hoàn trước đó</p><strong className="text-xl">{money(order.refundedAmountVnd)}</strong></div></Card>
    </div>
    <Card>
      {message && <p role="status" className={`mb-4 rounded-lg p-3 ${sent ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{message}</p>}
      {!sent && eligible ? <form onSubmit={submit} className="space-y-5">
        <label className="block text-sm font-medium">Số tiền muốn hoàn<input type="number" min="1" max={refundable} step="1" required value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 border rounded-xl px-4 py-3 w-full" /><span className="block mt-1 text-xs text-muted-foreground">Tối đa {money(refundable)}. Quản trị viên có thể duyệt số tiền thấp hơn sau khi kiểm tra.</span></label>
        <label className="block text-sm font-medium">Lý do và mô tả<textarea required maxLength={5000} rows={5} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 border rounded-xl p-3 w-full" placeholder="Mô tả tình trạng sản phẩm và phương án bạn mong muốn" /></label>
        <label className="block text-sm font-medium">Link ảnh/video minh chứng (tùy chọn)<input type="url" maxLength={1000} value={evidence} onChange={(event) => setEvidence(event.target.value)} className="mt-2 border rounded-xl px-4 py-3 w-full" placeholder="https://..." /></label>
        <Button type="submit" disabled={busy || Number(amount) <= 0 || Number(amount) > refundable}>{busy ? "Đang gửi..." : "Gửi yêu cầu hoàn tiền"}</Button>
      </form> : !sent && <p>Đơn hiện không còn số tiền có thể hoàn hoặc chưa ở trạng thái cho phép gửi yêu cầu.</p>}
    </Card>
  </div>;
}
