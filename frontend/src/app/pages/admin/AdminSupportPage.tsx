import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { CheckCircle2, MessageCircle, Package, RefreshCw, Search, Send, UserCheck } from "lucide-react";
import api from "../../utils/api";
import { errorMessage } from "../../utils/commerce";
import { subscribeSupportStream } from "../../utils/supportStream";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";

type TicketStatus = "OPEN" | "PROCESSING" | "WAITING_CUSTOMER" | "RESOLVED" | "CLOSED";
type Ticket = {
  id: number; subject: string; topic: "GENERAL" | "BARGAIN" | "SPECIAL_ORDER"; status: TicketStatus;
  orderId: number | null; orderCode: string | null; customerName: string; customerEmail: string;
  assignedAdminName: string | null; lastMessage: string | null; updatedAt: string;
};
type ChatMessage = {
  id: number; senderName: string; senderRole: "CUSTOMER" | "ADMIN"; message: string;
  attachmentUrl: string | null; createdAt: string;
};

const statusLabel: Record<TicketStatus, string> = {
  OPEN: "Mới", PROCESSING: "Đang xử lý", WAITING_CUSTOMER: "Chờ khách",
  RESOLVED: "Đã giải quyết", CLOSED: "Đã đóng",
};
const topicLabel = { GENERAL: "Hỗ trợ chung", BARGAIN: "Mặc cả", SPECIAL_ORDER: "Đặt hàng đặc biệt" };
const formatTime = (value: string) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));

export function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | TicketStatus>("ALL");
  const [reply, setReply] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const loadTickets = useCallback(async () => {
    const data = (await api.get<Ticket[]>("/admin/support/tickets")).data;
    setTickets(data);
    setSelectedId((current) => current && data.some((item) => item.id === current) ? current : data[0]?.id ?? null);
  }, []);
  const loadMessages = useCallback(async (id: number) => {
    setMessages((await api.get<ChatMessage[]>(`/admin/support/tickets/${id}/messages`)).data);
  }, []);

  useEffect(() => {
    setLoading(true); setError("");
    loadTickets().catch((reason) => setError(errorMessage(reason))).finally(() => setLoading(false));
  }, [loadTickets]);
  useEffect(() => { if (selectedId) void loadMessages(selectedId).catch((reason) => setError(errorMessage(reason))); }, [selectedId, loadMessages]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    const unsubscribe = subscribeSupportStream("/admin/support/stream", (event) => {
      void loadTickets();
      if (event.ticketId === selectedId) void loadMessages(event.ticketId);
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [loadMessages, loadTickets, selectedId]);
  useEffect(() => {
    const timer = window.setInterval(() => { void loadTickets(); if (selectedId) void loadMessages(selectedId); }, 30000);
    return () => window.clearInterval(timer);
  }, [loadMessages, loadTickets, selectedId]);

  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? null;
  const filtered = useMemo(() => tickets.filter((ticket) => {
    const text = `${ticket.subject} ${ticket.customerName} ${ticket.customerEmail} ${ticket.orderCode ?? ""}`.toLowerCase();
    return (status === "ALL" || ticket.status === status) && text.includes(query.trim().toLowerCase());
  }), [tickets, query, status]);

  const send = async (event: FormEvent) => {
    event.preventDefault(); if (!selected || !reply.trim()) return;
    setBusy(true); setError("");
    try {
      await api.post(`/admin/support/tickets/${selected.id}/messages`, { message: reply, attachmentUrl: attachmentUrl || null });
      setReply(""); setAttachmentUrl("");
      await Promise.all([loadMessages(selected.id), loadTickets()]);
    } catch (reason) { setError(errorMessage(reason)); } finally { setBusy(false); }
  };
  const update = async (nextStatus?: TicketStatus, assignToMe = false) => {
    if (!selected) return; setBusy(true); setError("");
    try {
      await api.patch(`/admin/support/tickets/${selected.id}`, { status: nextStatus ?? null, assignToMe });
      await loadTickets();
    } catch (reason) { setError(errorMessage(reason)); } finally { setBusy(false); }
  };

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-3xl font-bold">Chat hỗ trợ</h1><p className="text-muted-foreground">Tiếp nhận mặc cả, đơn đặc biệt và hỗ trợ trực tiếp.</p></div>
      <Button variant="outline" onClick={() => void loadTickets()}><RefreshCw className="h-4 w-4" /> Làm mới</Button>
    </div>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
    <div className="grid min-h-[650px] overflow-hidden rounded-2xl border bg-white shadow-sm lg:grid-cols-[360px_1fr]">
      <aside className="border-b lg:border-b-0 lg:border-r">
        <div className="space-y-3 border-b p-4">
          <label className="relative block"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><span className="sr-only">Tìm cuộc hội thoại</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Khách hàng, mã đơn..." className="w-full rounded-xl border py-2.5 pl-10 pr-3" /></label>
          <select aria-label="Lọc trạng thái" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="w-full rounded-xl border p-2.5">
            <option value="ALL">Tất cả trạng thái</option>{Object.entries(statusLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
        <div className="max-h-[560px] overflow-y-auto">
          {loading ? <p className="p-5 text-muted-foreground">Đang tải...</p> : filtered.length === 0 ? <p className="p-5 text-muted-foreground">Không có cuộc hội thoại phù hợp.</p> : filtered.map((ticket) =>
            <button key={ticket.id} onClick={() => setSelectedId(ticket.id)} className={`w-full border-b p-4 text-left transition-colors ${selectedId === ticket.id ? "bg-orange-50" : "hover:bg-muted/50"}`}>
              <div className="flex items-start justify-between gap-2"><strong className="line-clamp-1">{ticket.customerName}</strong><span className="shrink-0 text-xs text-muted-foreground">{formatTime(ticket.updatedAt)}</span></div>
              <p className="mt-1 text-sm font-medium">{ticket.subject}</p><p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{ticket.lastMessage || "Chưa có tin nhắn"}</p>
              <div className="mt-2 flex flex-wrap gap-1.5"><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{topicLabel[ticket.topic]}</span><span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">{statusLabel[ticket.status]}</span></div>
            </button>)}
        </div>
      </aside>
      {!selected ? <div className="grid place-items-center p-8 text-center text-muted-foreground"><div><MessageCircle className="mx-auto mb-3 h-12 w-12" /><p>Chọn một cuộc hội thoại để bắt đầu.</p></div></div> :
        <section className="flex min-w-0 flex-col">
          <header className="border-b p-4">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold">{selected.subject}</h2><p className="text-sm text-muted-foreground">{selected.customerName} · {selected.customerEmail}</p></div>
              <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={busy} onClick={() => void update(undefined, true)}><UserCheck className="h-4 w-4" /> Tiếp nhận</Button><Button size="sm" variant="outline" disabled={busy} onClick={() => void update("RESOLVED")}><CheckCircle2 className="h-4 w-4" /> Đã giải quyết</Button></div></div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm"><span>Trạng thái:</span><select aria-label="Trạng thái cuộc hội thoại" value={selected.status} onChange={(e) => void update(e.target.value as TicketStatus)} className="rounded-lg border px-2 py-1"><option value="OPEN">Mới</option><option value="PROCESSING">Đang xử lý</option><option value="WAITING_CUSTOMER">Chờ khách</option><option value="RESOLVED">Đã giải quyết</option><option value="CLOSED">Đã đóng</option></select>{selected.assignedAdminName && <span>Phụ trách: <strong>{selected.assignedAdminName}</strong></span>}{selected.orderId && <Link className="inline-flex items-center gap-1 font-medium text-primary hover:underline" to={`/admin/orders/${selected.orderId}`}><Package className="h-4 w-4" /> {selected.orderCode}</Link>}</div>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4 lg:max-h-[430px]">
            {messages.map((message) => <div key={message.id} className={`flex ${message.senderRole === "ADMIN" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.senderRole === "ADMIN" ? "bg-primary text-white" : "border bg-white"}`}><p className="mb-1 text-xs opacity-75">{message.senderName}</p><p className="whitespace-pre-wrap break-words">{message.message}</p>{message.attachmentUrl && <a className="mt-2 block break-all text-sm underline" href={message.attachmentUrl} target="_blank" rel="noreferrer">Mở tệp đính kèm</a>}<p className="mt-1 text-right text-[11px] opacity-70">{formatTime(message.createdAt)}</p></div></div>)}<div ref={endRef} />
          </div>
          <form onSubmit={send} className="space-y-3 border-t p-4"><label className="block text-sm font-medium">Nội dung phản hồi<textarea required maxLength={5000} value={reply} onChange={(e) => setReply(e.target.value)} className="mt-1 min-h-24 w-full rounded-xl border p-3" placeholder="Nhập câu trả lời..." /></label><div className="flex flex-col gap-3 sm:flex-row"><label className="flex-1 text-sm">Link ảnh/tệp (không bắt buộc)<input type="url" maxLength={1000} value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5" /></label><Button type="submit" disabled={busy || !reply.trim()} className="self-end"><Send className="h-4 w-4" /> Gửi phản hồi</Button></div></form>
        </section>}
    </div>
  </div>;
}
