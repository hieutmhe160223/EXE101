import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import api from "../../utils/api";
import { Order, errorMessage, money, orderStatus } from "../../utils/commerce";

const nextStage: Record<string,string> = { DEPOSIT_PAID:"PURCHASED", PURCHASED:"SHOP_SHIPPING", SHOP_SHIPPING:"CHINA_WAREHOUSE",
  CHINA_WAREHOUSE:"INTERNATIONAL_SHIPPING", INTERNATIONAL_SHIPPING:"WAITING_FINAL_PAYMENT", FINAL_PAID:"DELIVERING", DELIVERING:"COMPLETED" };
export function AdminUpdateOrderPage() {
  const {id}=useParams(); const [order,setOrder]=useState<Order|null>(null);
  const [location,setLocation]=useState(""); const [note,setNote]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  const load=async()=>{try{const r=await api.get<Order>(`/admin/orders/${id}`);setOrder(r.data);}catch(e){setError(errorMessage(e));}};
  useEffect(()=>{void load();},[id]);
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault(); if(!order)return; setBusy(true);setError("");
    try{const r=await api.post<Order>(`/admin/orders/${id}/status`,{expectedStatus:order.status,status:nextStage[order.status],location,note});
      setOrder(r.data);setNote("");}
    catch(e){setError(errorMessage(e));await load();}finally{setBusy(false);}
  };
  return <div><Link to="/admin/orders" className="text-primary">← Danh sách đơn</Link>
    {error && <p role="alert" className="text-red-700 my-4">{error}</p>}
    {!order ? <p>Đang tải đơn...</p> : <>
      <h1 className="text-3xl font-bold my-6">Xử lý đơn {order.orderCode}</h1>
      <div className="grid lg:grid-cols-2 gap-6"><Card><h2 className="font-semibold mb-3">{order.productName || "Thông tin đơn"}</h2>
        <p>Trạng thái: {orderStatus(order.status)}</p><p>Số lượng: {order.quantity}</p><p>Giao đến: {order.shippingAddress}</p>
        <p>Tổng: {money(order.totalAmountVnd)}</p><p>Đã nhận: {money(order.paidAmountVnd)}</p>
        <p>Còn lại: {money(Math.max(0,order.totalAmountVnd-order.paidAmountVnd))}</p>
        {nextStage[order.status] ? <form onSubmit={submit} className="space-y-4 mt-6">
          <p>Bước tiếp theo: <strong>{order.status==="INTERNATIONAL_SHIPPING" ? "Về kho Việt Nam → chờ thanh toán còn lại" : orderStatus(nextStage[order.status])}</strong></p>
          <label className="block">Vị trí/kho<input maxLength={200} value={location} onChange={e=>setLocation(e.target.value)} className="border rounded-lg p-3 w-full" /></label>
          <label className="block">Ghi chú xử lý / mã vận đơn<textarea required maxLength={1000} value={note} onChange={e=>setNote(e.target.value)} className="border rounded-lg p-3 w-full" /></label>
          <Button type="submit" disabled={busy}>{busy ? "Đang lưu..." : "Xác nhận bước tiếp theo"}</Button>
        </form> : <p className="mt-5">Chưa có bước vận hành tiếp theo cho trạng thái này. {order.status.startsWith("WAITING_") && <Link className="text-primary" to="/admin/payments">Mở đối soát thanh toán</Link>}</p>}
      </Card><Card><h2 className="font-semibold mb-3">Lịch sử xử lý</h2>{order.timeline.filter(t=>t.reached).map(t=><div key={t.status} className="border-b py-3">
        <p className="font-medium">{orderStatus(t.status)}</p><p>{t.location}</p><p className="whitespace-pre-wrap">{t.note}</p>
        {t.createdAt && <small>{new Date(t.createdAt).toLocaleString("vi-VN")}</small>}
      </div>)}</Card></div>
    </>}
  </div>;
}
