import { useEffect,useState } from "react";
import api from "../utils/api";
import { errorMessage,money } from "../utils/commerce";
import { Card } from "./Card";
import { Button } from "./Button";
type TopUp={id:number;amount:number;reference:string;status:string;bankCode:string;accountNumber:string;accountName:string;qrUrl:string;message:string|null;expiresAt:string|null};
export function WalletTopUp({onPaid}:{onPaid:()=>Promise<void>}){
 const [config,setConfig]=useState<{available:boolean;minAmount:number;maxAmount:number}|null>(null);
 const [amount,setAmount]=useState(""),[topup,setTopup]=useState<TopUp|null>(null),[error,setError]=useState(""),[busy,setBusy]=useState(false),[ready,setReady]=useState(false);
 const [remaining,setRemaining]=useState(0);
 const [requestKey,setRequestKey]=useState(()=>sessionStorage.getItem("walletTopupRequestKey")||crypto.randomUUID());
 useEffect(()=>{let active=true;Promise.all([api.get("/user/wallet/topups/config"),api.get("/user/wallet/topups/latest")])
   .then(([c,t])=>{if(active){setConfig(c.data);setTopup(t.status===204?null:t.data);setReady(true);}})
   .catch(e=>{if(active)setError(errorMessage(e));});return()=>{active=false;};},[]);
 useEffect(()=>{
   if(topup?.status!=="PENDING")return;
   let active=true,inflight=false;
   const check=async()=>{if(inflight)return;inflight=true;try{const r=await api.get<TopUp>("/user/wallet/topups/"+topup.id);
     if(active){setTopup(r.data);setError("");if(r.data.status==="PAID"){sessionStorage.removeItem("walletTopupRequestKey");await onPaid();}}}
     catch(e){if(active)setError(errorMessage(e));}finally{inflight=false;}};
   const timer=window.setInterval(check,4000);
   return()=>{active=false;window.clearInterval(timer);};
 },[topup?.id,topup?.status,onPaid]);
 useEffect(()=>{
   if(topup?.status!=="PENDING"||!topup.expiresAt){setRemaining(0);return;}
   const update=()=>{const seconds=Math.max(0,Math.ceil((new Date(topup.expiresAt!).getTime()-Date.now())/1000));setRemaining(seconds);
     if(seconds===0)api.get<TopUp>("/user/wallet/topups/"+topup.id).then(r=>setTopup(r.data)).catch(e=>setError(errorMessage(e)));};
   update();const timer=window.setInterval(update,1000);return()=>window.clearInterval(timer);
 },[topup?.id,topup?.status,topup?.expiresAt]);
 const create=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError("");sessionStorage.setItem("walletTopupRequestKey",requestKey);
   try{const r=await api.post<TopUp>("/user/wallet/topups",{amount:Number(amount),requestKey});setTopup(r.data);if(r.data.status==="PAID")await onPaid();}
   catch(e){setError(errorMessage(e));}finally{setBusy(false);}};
 const refresh=async()=>{if(!topup)return;setBusy(true);try{const r=await api.get<TopUp>("/user/wallet/topups/"+topup.id);setTopup(r.data);await onPaid();setError("");}
   catch(e){setError(errorMessage(e));}finally{setBusy(false);}};
 const reset=(keepAmount=false)=>{const key=crypto.randomUUID();setRequestKey(key);sessionStorage.setItem("walletTopupRequestKey",key);setTopup(null);if(!keepAmount)setAmount("");};
 const cancel=async(changeAmount:boolean)=>{if(!topup)return;setBusy(true);setError("");
   try{const r=await api.post<TopUp>("/user/wallet/topups/"+topup.id+"/cancel");setTopup(r.data);
     if(changeAmount){setAmount(String(topup.amount));reset(true);}}
   catch(e){setError(errorMessage(e));}finally{setBusy(false);}};
 return <Card className="mb-6"><h2 className="text-xl font-semibold mb-4">Nạp tiền vào ví</h2>{error&&<p role="alert" className="text-red-700 mb-3">{error}</p>}
 {!ready?<p>Đang kiểm tra dịch vụ nạp tiền...</p>:!config?.available?<p>Nạp tiền tự động chưa sẵn sàng. Vui lòng quay lại sau.</p>:<>
 {!topup?<form onSubmit={create} className="space-y-3">
 <label className="block">Số tiền muốn nạp (VND)<input type="number" required min={config.minAmount} max={config.maxAmount} step={1} value={amount}
 onChange={e=>setAmount(e.target.value)} className="block border rounded-lg p-3 w-full" /></label>
 <p className="text-sm">Từ {money(config.minAmount)} đến {money(config.maxAmount)}.</p><Button type="submit" disabled={busy}>{busy?"Đang tạo QR...":"Tạo mã VietQR"}</Button>
 </form>:topup.status==="PAID"?<div role="status"><p className="text-green-700 font-semibold">Đã nạp thành công {money(topup.amount)} vào ví Yufiz.</p><Button onClick={()=>reset()} className="mt-3">Nạp thêm</Button></div>:
 ["CANCELLED","EXPIRED"].includes(topup.status)?<div role="status"><p>{topup.status==="EXPIRED"?"Yêu cầu đã hết hạn sau 10 phút.":`Yêu cầu nạp ${money(topup.amount)} đã được hủy.`}</p><Button onClick={()=>reset()} className="mt-3">Tạo yêu cầu nạp mới</Button></div>:
 topup.status==="REVIEW"?<div><p role="status">{topup.message}</p><a className="text-primary" href="/chat">Liên hệ hỗ trợ</a></div>:
 <div className="grid md:grid-cols-2 gap-5"><img src={topup.qrUrl} alt="VietQR nạp tiền vào ví" className="w-full max-w-80 mx-auto" />
 <div className="space-y-3"><p className="font-bold text-xl">{money(topup.amount)}</p><p>Ngân hàng: <strong>{topup.bankCode}</strong></p>
 <p>Số tài khoản: <strong>{topup.accountNumber}</strong></p><p>Chủ tài khoản: <strong>{topup.accountName}</strong></p>
 <p>Nội dung: <strong className="break-all">{topup.reference}</strong></p>
 <p role="timer" className="font-semibold text-primary">Thời gian còn lại: {String(Math.floor(remaining/60)).padStart(2,"0")}:{String(remaining%60).padStart(2,"0")}</p>
 <p role="status">Đang chờ nhận tiền. Quét QR bằng ứng dụng ngân hàng; giữ nguyên số tiền và nội dung. Số dư ví sẽ tự cập nhật khi nhận được xác nhận.</p>
 <p className="text-sm">Nếu đã chuyển tiền, không chuyển lại. Bạn có thể rời trang và quay lại để xem yêu cầu đang chờ.</p>
 <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={busy} onClick={refresh}>Kiểm tra trạng thái</Button>
 <Button variant="outline" disabled={busy} onClick={()=>cancel(true)}>Quay lại · Đổi số tiền</Button>
 <Button variant="ghost" disabled={busy} onClick={()=>cancel(false)}>Hủy yêu cầu nạp</Button></div></div></div>}
 </>}</Card>;
}
