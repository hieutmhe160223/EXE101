import { useCallback, useEffect, useState } from "react";
import api from "./api";
import { getUserId, isLoggedIn } from "./auth";
import { Order, errorMessage } from "./commerce";
export function useOrder(id: string | null | undefined) {
  const [order, setOrder] = useState<Order | null>(null); const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    if (!isLoggedIn()) { setError("Vui lòng đăng nhập để xem đơn hàng."); return; }
    if (!id || !/^[1-9]\d*$/.test(id)) { setError("Không tìm thấy mã đơn hợp lệ."); return; }
    try { const r = await api.get<Order>(`/orders/${id}`, { params: { customerId: getUserId() } }); setOrder(r.data); setError(""); }
    catch (e) { setError(errorMessage(e)); }
  }, [id]);
  useEffect(() => { setOrder(null); void refresh(); }, [refresh]);
  return { order, error, refresh };
}
