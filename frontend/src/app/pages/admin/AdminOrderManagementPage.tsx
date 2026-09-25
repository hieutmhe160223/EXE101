import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import api from "../../utils/api";
import { Order, errorMessage, money, orderStatus } from "../../utils/commerce";

export function AdminOrderManagementPage() {
  const [page,setPage]=useState(0); const [items,setItems]=useState<Order[]>([]);
  const [pages,setPages]=useState(0); const [error,setError]=useState(""); const [loading,setLoading]=useState(true);
  useEffect(() => {
    let active=true; setLoading(true); setError("");
    api.get("/admin/orders", {params:{page}}).then(r => { if(active) {setItems(r.data.content);setPages(r.data.totalPages);} })
      .catch(e=>{if(active)setError(errorMessage(e));}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[page]);
  return <div><h1 className="text-3xl font-bold mb-6">Quản lý đơn hàng</h1>
    {error && <p role="alert">{error}</p>}
    <Card>{loading ? <p>Đang tải...</p> : <div className="overflow-x-auto"><table className="w-full text-left">
      <thead><tr><th>Mã đơn</th><th>Ngày tạo</th><th>Trạng thái</th><th>Tổng đơn</th><th>Đã nhận</th><th>Thao tác</th></tr></thead>
      <tbody>{items.map(o=><tr key={o.id} className="border-t"><td className="py-4">{o.orderCode}</td><td>{new Date(o.createdAt).toLocaleDateString("vi-VN")}</td>
        <td>{orderStatus(o.status)}</td><td>{money(o.totalAmountVnd)}</td><td>{money(o.paidAmountVnd)}</td><td><Link className="text-primary" to={`/admin/orders/${o.id}`}>Xử lý đơn</Link></td></tr>)}</tbody>
    </table>{items.length===0 && <p>Chưa có đơn hàng.</p>}</div>}</Card>
    <div className="flex gap-3 mt-5 items-center"><Button variant="outline" disabled={page===0 || loading} onClick={()=>setPage(page-1)}>Trang trước</Button>
      <span>Trang {page+1} / {Math.max(1,pages)}</span><Button variant="outline" disabled={page+1>=pages || loading} onClick={()=>setPage(page+1)}>Trang sau</Button></div>
  </div>;
}
