import { useState } from "react";
import api from "../utils/api";
import { Link, useParams } from "react-router";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { CostSummary } from "../components/CostSummary";
import { useOrder } from "../utils/useOrder";
import { money, orderStatus, Price, errorMessage } from "../utils/commerce";
export function OrderDetailPage() {
  const { id } = useParams(); const { order, error, refresh } = useOrder(id);
  const [actionError,setActionError]=useState(""); const [busy,setBusy]=useState(false);
  const cancel=async()=>{setBusy(true);setActionError("");try{await api.post(`/orders/${id}/cancel`);await refresh();}catch(e){setActionError(errorMessage(e));}finally{setBusy(false);}};
  if(error) return <p role="alert" className="p-8">{error}</p>;
  if(!order) return <p className="p-8">Đang tải đơn...</p>;
  let price: Price | null = null;
  try { if(order.costSnapshotJson) price = JSON.parse(order.costSnapshotJson); } catch {}
  return <div className="max-w-5xl mx-auto px-4 py-8">
    <Link to="/orders" className="text-primary">← Đơn hàng của tôi</Link><h1 className="text-2xl font-bold my-4">Đơn {order.orderCode}</h1>
    <p className="mb-6">{orderStatus(order.status)}</p>{actionError && <p role="alert" className="text-red-700 mb-4">{actionError}</p>}
    <div className="grid md:grid-cols-2 gap-6"><div className="space-y-5">
      <Card>{order.productImageUrl && <img src={order.productImageUrl} alt="" className="w-28 h-28 object-cover rounded-lg mb-3" />}
        <h2 className="font-semibold">{order.productName || "Đơn cũ chưa lưu tên sản phẩm"}</h2><p>Số lượng: {order.quantity}</p>{order.variantSelected && <p>Phân loại: {order.variantSelected}</p>}
        <p className="mt-3">Giao đến: {order.shippingAddress}</p>{order.customerNote && <p>Ghi chú: {order.customerNote}</p>}
      </Card>
      <Card><h2 className="font-semibold mb-3">Tiến trình</h2>{order.status === "WAITING_DEPOSIT" && <p>Chờ thanh toán tiền cọc</p>}
        {order.timeline?.map(item => <div key={item.status} className={`py-2 ${item.reached ? "" : "text-muted-foreground"}`}><p>{item.reached ? "✓ " : "○ "}{orderStatus(item.status)}</p>{item.reached && <><small>{item.location}</small><p className="text-sm whitespace-pre-wrap">{item.note}</p></>}</div>)}
      </Card>
    </div><div className="space-y-5"><Card>{price ? <CostSummary price={price} /> : <p>Tổng: {money(order.totalAmountVnd)}</p>}
      <p className="mt-4 font-semibold">Đã xác nhận thanh toán: {money(order.paidAmountVnd)}</p></Card>
      {order.status === "WAITING_DEPOSIT" && <Link to={`/order/payment?orderId=${order.id}`}><Button className="w-full">Thanh toán tiền cọc</Button></Link>}
      {order.status === "WAITING_FINAL_PAYMENT" && <Link to={`/orders/${order.id}/final-payment`}><Button className="w-full">Thanh toán còn lại · {money(Math.max(0,order.totalAmountVnd-order.paidAmountVnd))}</Button></Link>}
      {["FINAL_PAID","DELIVERING","COMPLETED"].includes(order.status) && <Link to={`/orders/${order.id}/refund`}><Button variant="outline">Yêu cầu đổi trả</Button></Link>}
    {order.status === "WAITING_DEPOSIT" && <div className="mt-4"><Button variant="outline" disabled={busy} onClick={cancel}>Hủy đơn chưa tạo thanh toán</Button></div>}
    </div></div>
  </div>;
}
