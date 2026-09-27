import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { CheckCircle, Clock } from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useOrder } from "../utils/useOrder";
import { money, orderStatus } from "../utils/commerce";

export function OrderSuccessPage() {
  const [params] = useSearchParams(); const id = params.get("orderId");
  const final = params.get("phase") === "final";
  const { order, error, refresh } = useOrder(id);
  const paid = !!order && order.depositAmountVnd > 0 && order.paidAmountVnd >= (final ? order.totalAmountVnd : order.depositAmountVnd);
  useEffect(() => {
    if (!order || paid || order.status !== (final ? "WAITING_FINAL_PAYMENT" : "WAITING_DEPOSIT")) return;
    const timer = window.setInterval(refresh, 5000); return () => window.clearInterval(timer);
  }, [order?.status, final, paid, refresh]);
  return <div className="max-w-2xl mx-auto px-4 py-16 text-center">
    {error ? <Card><p role="alert">{error}</p><Link to="/orders" className="text-primary">Xem đơn hàng</Link></Card> : !order ? <p>Đang kiểm tra trạng thái đơn...</p> : <>
      {paid ? <CheckCircle className="w-20 h-20 text-accent mx-auto mb-6" /> : <Clock className="w-20 h-20 text-primary mx-auto mb-6" />}
      <h1 className="text-3xl font-bold mb-4">{paid ? (final ? "Đã thanh toán đủ!" : "Đã nhận tiền cọc!") : "Đơn hàng đã được tạo"}</h1>
      <p className="text-muted-foreground mb-6">{paid ? (final ? "Đã xác nhận đủ tiền. Bạn có thể theo dõi bước giao hàng trong đơn." : "Đơn hàng của bạn đã được xác nhận và chờ xử lý mua hàng.") : order.status === "WAITING_DEPOSIT" ? "Hệ thống chưa xác nhận nhận đủ tiền cọc. Nếu đã thanh toán, vui lòng chờ đối soát." : orderStatus(order.status)}</p>
      <Card className="space-y-4 mb-6"><p>Mã đơn: <strong>{order.orderCode}</strong></p><p>Trạng thái: {orderStatus(order.status)}</p><p>Số tiền đã xác nhận: <strong>{money(order.paidAmountVnd)}</strong></p><p>Còn phải thanh toán: {money(Math.max(0, order.totalAmountVnd - order.paidAmountVnd))}</p></Card>
      <div className="flex flex-wrap justify-center gap-3"><Link to={`/orders/${order.id}`}><Button>Theo dõi đơn</Button></Link>
        {!paid && order.status === (final ? "WAITING_FINAL_PAYMENT" : "WAITING_DEPOSIT") && <Link to={final ? `/orders/${order.id}/final-payment` : `/order/payment?orderId=${order.id}`}><Button variant="outline">Xem thanh toán</Button></Link>}
        <Button variant="ghost" onClick={refresh}>Cập nhật trạng thái</Button></div>
    </>}
  </div>;
}
