import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Bell, CheckCheck, CreditCard, Package, RotateCcw, Wallet } from "lucide-react";
import { useRemote, RemoteState } from "../components/RemoteData";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import api from "../utils/api";
import { errorMessage } from "../utils/commerce";

type NotificationItem = { id:number; type:string; title:string; body:string; targetUrl:string|null; readAt:string|null; createdAt:string };
const icons:Record<string,typeof Bell> = { ORDER_STATUS:Package, PAYMENT:CreditCard, WALLET:Wallet, REFUND:RotateCcw };

export function NotificationPage() {
  const state = useRemote<NotificationItem[]>("/user/notifications");
  const [error, setError] = useState("");
  useEffect(() => {
    const received = () => void state.refresh();
    window.addEventListener("notificationReceived", received);
    return () => window.removeEventListener("notificationReceived", received);
  }, [state.refresh]);
  const changed = () => window.dispatchEvent(new Event("notificationChange"));
  const read = async (id:number) => { try { await api.post(`/user/notifications/${id}/read`); await state.refresh(); changed(); } catch (requestError) { setError(errorMessage(requestError)); } };
  const readAll = async () => { try { await api.post("/user/notifications/read-all"); await state.refresh(); changed(); } catch (requestError) { setError(errorMessage(requestError)); } };
  const unread = state.data?.filter((item) => !item.readAt).length ?? 0;

  return <div className="max-w-4xl mx-auto p-6 space-y-6">
    <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-medium text-primary">Trung tâm cập nhật</p><h1 className="text-3xl font-bold">Thông báo</h1><p className="text-muted-foreground mt-2">Thanh toán, hành trình đơn và hoàn tiền được cập nhật tại đây.</p></div>{unread > 0 && <Button variant="outline" size="sm" onClick={readAll}><CheckCheck className="inline w-4 h-4 mr-2" />Đọc tất cả</Button>}</div>
    {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-rose-700">{error}</p>}
    <RemoteState state={state}>
      {!state.data?.length ? <Card className="text-center py-12"><Bell className="w-10 h-10 mx-auto text-muted-foreground mb-3" /><p>Chưa có thông báo.</p></Card> : <div className="space-y-3">{state.data.map((item) => {
        const Icon = icons[item.type] ?? Bell;
        return <Card key={item.id} className={`flex gap-4 transition-colors ${item.readAt ? "opacity-70" : "border-primary/30 bg-primary/[0.025]"}`}>
          <span className="w-11 h-11 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Icon className="w-5 h-5" /></span>
          <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h2 className="font-semibold">{item.title}</h2>{!item.readAt && <span className="mt-2 w-2 h-2 rounded-full bg-primary shrink-0" />}</div><p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{item.body}</p><div className="mt-3 flex flex-wrap items-center gap-4 text-xs"><time className="text-muted-foreground">{new Date(item.createdAt).toLocaleString("vi-VN")}</time>{item.targetUrl && <Link className="font-medium text-primary" to={item.targetUrl} onClick={() => !item.readAt && void read(item.id)}>Xem chi tiết</Link>}{!item.readAt && <button className="font-medium hover:text-primary" onClick={() => read(item.id)}>Đánh dấu đã đọc</button>}</div></div>
        </Card>;
      })}</div>}
    </RemoteState>
  </div>;
}
