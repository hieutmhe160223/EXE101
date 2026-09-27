import { RemoteTablePage } from "../../components/RemoteData";
import { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import api from "../../utils/api";
import { Payment, errorMessage, money } from "../../utils/commerce";
export function AdminPaymentReviewPage() {
  const [items,setItems] = useState<Payment[]>([]); const [error,setError] = useState(""); const [loading,setLoading] = useState(true);
  const load = async () => { try { const r=await api.get<Payment[]>("/admin/payments/pending-bank"); setItems(r.data); } catch(e) {setError(errorMessage(e));} finally {setLoading(false);} };
  useEffect(() => { void load(); }, []);
  return <div><h1 className="text-3xl font-bold mb-3">Đối soát chuyển khoản</h1><p className="text-muted-foreground mb-6">Chỉ xác nhận sau khi kiểm tra tiền thực nhận trên tài khoản ngân hàng. Nhập mã giao dịch ngân hàng để tránh ghi nhận hai lần.</p>
    <RemoteTablePage title="Nạp ví cần đối soát" url="/admin/wallet/topup-reviews" columns={[{key:"email",label:"Tài khoản"},{key:"reference",label:"Nội dung"},{key:"expectedAmount",label:"Yêu cầu",render:money},{key:"receivedAmount",label:"Thực nhận",render:money},{key:"bankReference",label:"Mã ngân hàng"},{key:"note",label:"Lý do"}]}/>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {loading ? <p>Đang tải...</p> : items.length===0 ? <Card>Không có chuyển khoản đang chờ đối soát.</Card> : <div className="space-y-4">{items.map(payment => <Review key={payment.id} payment={payment} done={load} />)}</div>}
  </div>;
}
function Review({ payment, done }: { payment: Payment; done: () => Promise<void> }) {
  const [amount,setAmount] = useState(""); const [code,setCode] = useState(""); const [note,setNote] = useState("");
  const [error,setError] = useState(""); const [busy,setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError("");
    try { await api.post(`/admin/payments/${payment.id}/confirm-bank`, { amount: Number(amount), transactionCode: code, note }); await done(); }
    catch(e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };
  return <Card><h2 className="font-semibold">{payment.orderCode} · {payment.type === "FINAL_30" ? "Phần còn lại" : "Cọc"} {money(payment.amountVnd)}</h2><p className="break-all my-2">Nội dung cần đối chiếu: {payment.merchantReference}</p>
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <label>Số tiền thực nhận (VND)<input required type="number" min={1} value={amount} onChange={e=>setAmount(e.target.value)} className="block border p-2 rounded-lg w-full" /></label>
      <label>Mã giao dịch ngân hàng<input required maxLength={100} value={code} onChange={e=>setCode(e.target.value)} className="block border p-2 rounded-lg w-full" /></label>
      <label className="sm:col-span-2">Ghi chú đối soát/bằng chứng<textarea required maxLength={700} value={note} onChange={e=>setNote(e.target.value)} className="block border p-2 rounded-lg w-full" /></label>
      <RemoteTablePage title="Nạp ví cần đối soát" url="/admin/wallet/topup-reviews" columns={[{key:"email",label:"Tài khoản"},{key:"reference",label:"Nội dung"},{key:"expectedAmount",label:"Yêu cầu",render:money},{key:"receivedAmount",label:"Thực nhận",render:money},{key:"bankReference",label:"Mã ngân hàng"},{key:"note",label:"Lý do"}]}/>
    {error && <p role="alert" className="text-red-700 sm:col-span-2">{error}</p>}
      <Button type="submit" disabled={busy}>{busy ? "Đang ghi nhận..." : "Xác nhận đã nhận đủ tiền"}</Button>
    </form>
  </Card>;
}


