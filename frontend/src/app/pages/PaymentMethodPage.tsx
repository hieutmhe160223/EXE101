import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams, useLocation, useParams } from "react-router";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import api from "../utils/api";
import { useOrder } from "../utils/useOrder";
import { Method, Payment, methodNames, money, errorMessage } from "../utils/commerce";
import { Wallet, Landmark, Smartphone, CheckCircle2, AlertCircle, RotateCcw, Ban, X, LoaderCircle } from "lucide-react";

export function PaymentMethodPage({ final = false }: { final?: boolean }) {
  const [params] = useSearchParams(); const location = useLocation(); const navigate = useNavigate();
  const route = useParams(); const id = route.id || params.get("orderId") || String(location.state?.orderId || "");
  const endpoint = final ? "final-payments" : "deposit-payments";
  const successUrl = `/order/success?orderId=${id}${final ? "&phase=final" : ""}`;
  const { order, error: orderError } = useOrder(id);
  const [methods, setMethods] = useState<{ method: Method; available: boolean }[]>([]);
  const [method, setMethod] = useState<Method>("BANK_TRANSFER");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null); const [error, setError] = useState("");
  const [notice,setNotice]=useState("");
  const [cancelIntent,setCancelIntent]=useState<"change"|"cancel"|null>(null);
  const [busy, setBusy] = useState(false); const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.all([api.get("/payments/methods"), api.get(`/orders/${id}/${endpoint}/latest`)])
      .then(([m,p]) => { if(active) { setMethods(final ? m.data.filter((item: {method: Method}) => item.method !== "WALLET") : m.data); setPayment(p.status === 204 ? null : p.data); setReady(true); } })
      .catch(e => { if(active) setError(errorMessage(e)); });
    if(!final) api.get<{walletBalance:number}>("/user/profile").then(r => { if(active) setWalletBalance(Number(r.data.walletBalance) || 0); }).catch(() => {});
    return () => { active = false; };
  }, [id, endpoint, final]);
  useEffect(() => {
    if (!payment || payment.status !== "PENDING") return;
    const timer = window.setInterval(() => {
      api.get<Payment>(`/orders/${id}/${endpoint}/latest`).then(r => {
        setPayment(r.data);
        if(r.data.status === "PAID") navigate(successUrl, { replace: true });
      }).catch(() => {});
    }, 5000);
    return () => window.clearInterval(timer);
  }, [id, endpoint, successUrl, payment?.status, navigate]);
  const create = async () => {
    setBusy(true); setError("");
    try {
      const r = await api.post<Payment>(`/orders/${id}/${endpoint}`, { method });
      setPayment(r.data);
      if(r.data.status === "PAID") {
        if(method === "WALLET") {
          setWalletBalance(current => current === null ? current : Math.max(0,current-r.data.amountVnd));
          window.dispatchEvent(new Event("walletBalanceChange"));
        }
        navigate(successUrl,{replace:true});
      }
    }
    catch(e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };
  const reconcile = async () => {
    if(!payment)return; setBusy(true);setError("");
    try { const r=await api.post<Payment>(`/payments/${payment.id}/reconcile`);setPayment(r.data);if(r.data.status==="PAID")navigate(successUrl,{replace:true}); }
    catch(e){setError(errorMessage(e));}finally{setBusy(false);}
  };
  const cancelPayment=async()=>{
    if(!payment||!cancelIntent)return;
    setBusy(true);setError("");setNotice("");
    try{
      const reason=cancelIntent==="change"?"Đổi phương thức thanh toán":"Khách hàng hủy yêu cầu thanh toán";
      const r=await api.post<Payment>(`/payments/${payment.id}/cancel`,{reason});
      if(r.data.status==="PAID"){navigate(successUrl,{replace:true});return;}
      if(r.data.status==="REVIEW"){setPayment(r.data);setError("Giao dịch đang được đối soát. Vui lòng không thanh toán thêm và liên hệ hỗ trợ.");return;}
      setPayment(null);
      setNotice(cancelIntent==="change"?"Đã hủy yêu cầu cũ. Bạn có thể chọn phương thức thanh toán khác.":"Đã hủy yêu cầu thanh toán.");
    }catch(e){setError(errorMessage(e));}finally{setBusy(false);setCancelIntent(null);}
  };
  if (orderError) return <div className="p-8"><p role="alert">{orderError}</p><Link to={`/login?next=${encodeURIComponent(final ? `/orders/${id}/final-payment` : "/order/payment?orderId=" + id)}`}>Đăng nhập</Link></div>;
  if (!order) return <p className="p-12 text-center">Đang tải đơn...</p>;
  const payableAmount = final ? Math.max(0, order.totalAmountVnd - order.paidAmountVnd) : order.depositAmountVnd;
  const walletInsufficient = walletBalance !== null && walletBalance < payableAmount;
  const activePayment = payment?.status === "PENDING"; const info = payment?.instructions;
  const paymentBlocked = payment?.status === "REVIEW";
  const paid = order.paidAmountVnd >= (final ? order.totalAmountVnd : order.depositAmountVnd) || payment?.status === "PAID";
  return <div className="max-w-4xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-2">{final ? "Thanh toán phần còn lại" : "Thanh toán đặt cọc"}</h1><p className="mb-6">Đơn {order.orderCode}</p>
    {payment?.status === "FAILED" && <p role="alert" className="text-red-700 mb-4">{payment.message || "Giao dịch chưa thành công. Vui lòng chọn lại phương thức."}</p>}
    {payment?.status === "REVIEW" && <p role="alert" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">Giao dịch đang được đối soát. Vui lòng không thanh toán thêm và liên hệ hỗ trợ.</p>}
    {notice&&<p role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"><CheckCircle2 className="h-4 w-4" />{notice}</p>}
    {error && <p role="alert" className="text-red-700 mb-4">{error}</p>}
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        {paid ? <Card><p>{final ? "Đơn đã thanh toán đủ." : "Đơn đã nhận cọc."}</p><Link className="text-primary" to={successUrl}>Xem xác nhận</Link></Card> : <>
          <fieldset disabled={busy || activePayment || paymentBlocked || !ready} className="space-y-3"><legend className="font-semibold mb-3">Chọn phương thức</legend>
          {methods.map(m => {
            const isWallet=m.method==="WALLET";
            const unavailable=!m.available;
            const Icon=isWallet?Wallet:m.method==="BANK_TRANSFER"?Landmark:Smartphone;
            const selected=(activePayment ? payment.method : method)===m.method;
            return <label key={m.method} className={`relative flex items-center gap-4 rounded-2xl border p-4 transition-all ${unavailable ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-70" : "cursor-pointer hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-sm"} ${selected&&!unavailable?"border-primary bg-orange-50/60 ring-1 ring-primary":""}`}>
              <input className="sr-only" type="radio" name="method" value={m.method} checked={selected} disabled={unavailable} onChange={() => setMethod(m.method)} />
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selected&&!unavailable?"bg-primary text-white":"bg-white text-gray-500 shadow-sm"}`}><Icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-semibold text-gray-900">{methodNames[m.method]}{selected&&!unavailable&&<CheckCircle2 className="h-4 w-4 text-primary" />}</span>
                {isWallet ? <small className={`mt-0.5 block ${walletInsufficient?"text-red-600":"text-muted-foreground"}`}>{walletBalance===null?"Đang tải số dư ví...":`Số dư hiện tại: ${money(walletBalance)}`}{walletInsufficient&&" · Không đủ để thanh toán"}</small> : !m.available ? <small className="block text-muted-foreground">Chưa sẵn sàng thanh toán</small> : <small className="block text-muted-foreground">{m.method==="BANK_TRANSFER"?"Quét VietQR và chờ đối soát":"Thanh toán qua ứng dụng ví"}</small>}
              </span>
              <span className={`h-5 w-5 rounded-full border-2 p-1 ${selected&&!unavailable?"border-primary":"border-gray-300"}`}>{selected&&!unavailable&&<span className="block h-full w-full rounded-full bg-primary" />}</span>
            </label>;
          })}</fieldset>
          {method==="WALLET"&&walletInsufficient&&<div className="flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><span className="flex gap-2"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />Bạn cần nạp thêm {money(payableAmount-(walletBalance||0))} để thanh toán đặt cọc.</span><Link to="/wallet" className="shrink-0 font-semibold text-primary hover:underline">Nạp tiền</Link></div>}
          {activePayment ? <Card>
            <h2 className="font-semibold mb-3">Chờ xác nhận · {methodNames[payment.method]}</h2>
            {payment.message && <p role="status" className="mb-3">{payment.message}</p>}
            {info?.qrUrl && <><img src={info.qrUrl} alt="Mã QR chuyển khoản" className="max-w-64 mx-auto" />
              <dl className="space-y-2 mt-4"><div>Ngân hàng: <strong>{info.bankCode}</strong></div><div>Tài khoản: <strong>{info.accountNumber}</strong></div><div>Chủ tài khoản: <strong>{info.accountName}</strong></div><div>Nội dung: <strong className="break-all">{info.transferContent}</strong></div><div>Số tiền: <strong>{money(payment.amountVnd)}</strong></div></dl>
              <p className="text-sm text-muted-foreground mt-3">Chuyển đúng số tiền và nội dung. Đơn chỉ được xác nhận sau khi đối soát tiền nhận được.</p></>}
            {info?.payUrl && <a href={info.payUrl} className="inline-block bg-primary text-white px-6 py-3 rounded-xl">Mở {methodNames[payment.method]} để thanh toán</a>}
            {(payment.method==="MOMO"||payment.method==="ZALOPAY") && <Button className="mt-4" variant="outline" disabled={busy} onClick={reconcile}>{busy ? "Đang kiểm tra..." : "Tôi đã thanh toán — kiểm tra với ví"}</Button>}
            <Link className="block text-primary mt-4" to={successUrl}>Kiểm tra trạng thái thanh toán</Link>
            <div className="mt-5 flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row">
              <Button variant="outline" className="inline-flex flex-1 items-center justify-center gap-2" disabled={busy} onClick={()=>setCancelIntent("change")}><RotateCcw className="h-4 w-4" />Đổi phương thức</Button>
              <Button variant="ghost" className="inline-flex flex-1 items-center justify-center gap-2 text-red-600 hover:bg-red-50" disabled={busy} onClick={()=>setCancelIntent("cancel")}><Ban className="h-4 w-4" />Hủy yêu cầu</Button>
            </div>
          </Card> : <Button className="w-full" onClick={create} disabled={busy || paymentBlocked || !ready || !methods.find(m => m.method === method)?.available || (method==="WALLET"&&walletInsufficient) || order.status !== (final ? "WAITING_FINAL_PAYMENT" : "WAITING_DEPOSIT")}>{busy ? (method==="WALLET"?"Đang thanh toán...":"Đang tạo yêu cầu...") : method==="WALLET"?`Thanh toán ${money(payableAmount)} bằng Ví Yufiz`:"Tiếp tục với " + methodNames[method]}</Button>}
        </>}
      </div>
      <Card><h2 className="font-semibold mb-4">Tóm tắt</h2><div className="space-y-3"><p>Tổng đơn: {money(order.totalAmountVnd)}</p><p className="font-bold text-primary">{final ? "Cần thanh toán: " : "Cọc: "}{money(payableAmount)}</p><p>Đã thanh toán: {money(order.paidAmountVnd)}</p><p className="text-sm text-muted-foreground">Cọc đã bao gồm phần phí dịch vụ và các phí khác theo báo giá đã xác nhận.</p></div></Card>
    </div>
    {cancelIntent&&payment&&<div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-950/45 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="cancel-payment-title" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)setCancelIntent(null);}}>
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><AlertCircle className="h-5 w-5" /></span><button type="button" disabled={busy} onClick={()=>setCancelIntent(null)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100" aria-label="Đóng"><X className="h-5 w-5" /></button></div>
        <h2 id="cancel-payment-title" className="mt-4 text-xl font-bold text-gray-900">{cancelIntent==="change"?"Đổi phương thức thanh toán?":"Hủy yêu cầu thanh toán?"}</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">Yêu cầu {methodNames[payment.method]} trị giá <strong>{money(payment.amountVnd)}</strong> sẽ bị hủy. Không tiếp tục chuyển tiền theo mã QR hoặc đường dẫn thanh toán cũ.</p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={busy} onClick={()=>setCancelIntent(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">Giữ yêu cầu</button><button type="button" disabled={busy} onClick={cancelPayment} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">{busy?<LoaderCircle className="h-4 w-4 animate-spin" />:<Ban className="h-4 w-4" />}{busy?"Đang xử lý...":cancelIntent==="change"?"Hủy và chọn lại":"Xác nhận hủy"}</button></div>
      </div>
    </div>}
  </div>;
}
