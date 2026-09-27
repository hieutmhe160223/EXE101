import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Bell, X } from "lucide-react";
import api from "../utils/api";
import { getAuthToken } from "../utils/auth";

type LiveNotification = { id:number; title:string; body:string; targetUrl:string|null };

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const [toast, setToast] = useState<LiveNotification|null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>|null>(null);
  const refresh = useCallback(async () => {
    try { setCount(Number((await api.get<{count:number}>("/user/notifications/unread-count")).data.count ?? 0)); }
    catch { /* axios handles an expired session globally */ }
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    void refresh();
    const polling = setInterval(refresh, 30000);
    const onChanged = () => void refresh();
    window.addEventListener("notificationChange", onChanged);

    const connect = async () => {
      while (active) {
        try {
          const token = getAuthToken();
          if (!token) return;
          const response = await fetch(`${api.defaults.baseURL}/user/notifications/stream`, {
            headers:{ Authorization:`Bearer ${token}`, Accept:"text/event-stream" }, signal:controller.signal,
          });
          if (!response.ok || !response.body) throw new Error("stream unavailable");
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          while (active) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream:true }).replace(/\r/g, "");
            let boundary = buffer.indexOf("\n\n");
            while (boundary >= 0) {
              const block = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 2);
              const event = block.split("\n").find((line) => line.startsWith("event:"))?.slice(6).trim();
              const data = block.split("\n").filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).join("\n");
              if (event === "notification" && data) {
                const item = JSON.parse(data) as LiveNotification;
                setCount((current) => current + 1); setToast(item);
                window.dispatchEvent(new Event("notificationReceived"));
                if (toastTimer.current) clearTimeout(toastTimer.current);
                toastTimer.current = setTimeout(() => setToast(null), 7000);
              }
              boundary = buffer.indexOf("\n\n");
            }
          }
        } catch (error) {
          if (!active || controller.signal.aborted) return;
        }
        await new Promise((resolve) => setTimeout(resolve, 4000));
      }
    };
    void connect();
    return () => { active=false; controller.abort(); clearInterval(polling); window.removeEventListener("notificationChange", onChanged); if(toastTimer.current)clearTimeout(toastTimer.current); };
  }, [refresh]);

  return <>
    <Link to="/notifications" aria-label={`Thông báo${count ? `, ${count} chưa đọc` : ""}`} className="relative p-2 hover:bg-muted rounded-lg transition-colors">
      <Bell className="w-5 h-5" />
      {count > 0 && <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">{count > 99 ? "99+" : count}</span>}
    </Link>
    {toast && <div className="fixed right-4 top-20 z-[70] w-[calc(100%-2rem)] max-w-sm rounded-2xl border bg-white p-4 shadow-xl animate-in slide-in-from-right">
      <button aria-label="Đóng thông báo" className="absolute right-3 top-3 text-muted-foreground" onClick={() => setToast(null)}><X className="w-4 h-4" /></button>
      <p className="pr-6 font-semibold">{toast.title}</p><p className="mt-1 text-sm text-muted-foreground">{toast.body}</p>
      <Link to={toast.targetUrl || "/notifications"} onClick={() => setToast(null)} className="mt-3 inline-block text-sm font-medium text-primary">Xem chi tiết</Link>
    </div>}
  </>;
}
