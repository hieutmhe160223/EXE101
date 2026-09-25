import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card } from "../components/Card";
import api from "../utils/api";
import { getUserId, isLoggedIn } from "../utils/auth";
import { Order, errorMessage, money, orderStatus } from "../utils/commerce";
export function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!isLoggedIn()) { setError("Vui lòng đăng nhập để xem đơn hàng."); setLoading(false); return; }
    api.get("/orders", { params: { customerId: getUserId() } }).then(r => setOrders(r.data)).catch(e => setError(errorMessage(e))).finally(() => setLoading(false));
  }, []);
  return <div className="max-w-5xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-6">Đơn hàng của tôi</h1>
    {error && <p role="alert">{error} <Link className="text-primary" to="/login?next=%2Forders">Đăng nhập</Link></p>}
    {loading ? <p>Đang tải...</p> : !error && orders.length === 0 ? <Card>Chưa có đơn hàng. <Link className="text-primary" to="/order/new">Bắt đầu đặt hàng</Link></Card> :
      <div className="space-y-4">{orders.map(order => <Link className="block" key={order.id} to={`/orders/${order.id}`}><Card hover><strong>{order.orderCode}</strong><p>{orderStatus(order.status)}</p><p>Tổng: {money(order.totalAmountVnd)} · Đã thanh toán: {money(order.paidAmountVnd)}</p></Card></Link>)}</div>}
  </div>;
}
