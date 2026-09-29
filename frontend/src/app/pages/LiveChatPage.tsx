import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CheckCircle2, MessageCircle, Package, Plus, Send, X } from "lucide-react";
import api from "../utils/api";
import { errorMessage } from "../utils/commerce";
import { subscribeSupportStream } from "../utils/supportStream";
import { Button } from "../components/Button";

type TicketStatus = "OPEN" | "PROCESSING" | "WAITING_CUSTOMER" | "RESOLVED" | "CLOSED";
type SupportTopic = "GENERAL" | "BARGAIN" | "SPECIAL_ORDER";
type Ticket = {
  id: number; subject: string; topic: SupportTopic; status: TicketStatus; orderId: number | null;
  orderCode: string | null; assignedAdminName: string | null; lastMessage: string | null; updatedAt: string;
};
type ChatMessage = {
  id: number; senderName: string; senderRole: "CUSTOMER" | "ADMIN"; message: string;
  attachmentUrl: string | null; createdAt: string;
};
type OrderOption = { id: number; orderCode: string; productName: string | null; status: string };

const statusLabel: Record<TicketStatus, string> = {
  OPEN: "Đã gửi", PROCESSING: "Đang xử lý", WAITING_CUSTOMER: "Yufiz đã phản hồi",
  RESOLVED: "Đã giải quyết", CLOSED: "Đã đóng",
};
const topicLabel: Record<SupportTopic, string> = {
  GENERAL: "Hỗ trợ chung", BARGAIN: "Mặc cả sản phẩm", SPECIAL_ORDER: "Đặt hàng đặc biệt",
};
const formatTime = (value: string) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));

export function LiveChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [orders, setOrders] = useState<OrderOption[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [creating, setCreating] = useState(false);
  const [topic, setTopic] = useState<SupportTopic>("GENERAL");
  const [subject, setSubject] = useState("");
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const loadTickets = useCallback(async () => {
    const data = (await api.get<Ticket[]>("/user/support/tickets")).data;
    setTickets(data);
    const requested = Number(searchParams.get("ticket"));
    setSelectedId((current) => {
      if (current && data.some((ticket) => ticket.id === current)) return current;
      if (Number.isSafeInteger(requested) && data.some((ticket) => ticket.id === requested)) return requested;
      return data[0]?.id ?? null;
    });
    if (data.length === 0) setCreating(true);
  }, [searchParams]);
  const loadMessages = useCallback(async (id: number) => {
    setMessages((await api.get<ChatMessage[]>(`/user/support/tickets/${id}/messages`)).data);
  }, []);

  useEffect(() => {
    setLoading(true); setError("");
    Promise.all([loadTickets(), api.get<OrderOption[]>("/user/support/orders").then((response) => setOrders(response.data))])
      .catch((reason) => setError(errorMessage(reason))).finally(() => setLoading(false));
  }, [loadTickets]);
  useEffect(() => {
    if (!selectedId || creating) return;
    setSearchParams({ ticket: String(selectedId) }, { replace: true });
    void loadMessages(selectedId).catch((reason) => setError(errorMessage(reason)));
  }, [selectedId, creating, loadMessages, setSearchParams]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    const unsubscribe = subscribeSupportStream("/user/support/stream", (event) => {
      void loadTickets();
      if (event.ticketId === selectedId) void loadMessages(event.ticketId);
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [loadMessages, loadTickets, selectedId]);
  useEffect(() => {
    const timer = window.setInterval(() => { void loadTickets(); if (selectedId && !creating) void loadMessages(selectedId); }, 30000);
    return () => window.clearInterval(timer);
  }, [creating, loadMessages, loadTickets, selectedId]);

  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? null;
  const chooseTicket = (id: number) => { setSelectedId(id); setCreating(false); setError(""); };
  const resetComposer = () => { setMessage(""); setAttachmentUrl(""); };

  const createTicket = async (event: FormEvent) => {
    event.preventDefault(); if (!message.trim()) return;
    setBusy(true); setError("");
    try {
      const created = (await api.post<Ticket>("/user/support/tickets", {
        topic, subject: subject || null, orderId: orderId ? Number(orderId) : null,
        initialMessage: message, attachmentUrl: attachmentUrl || null,
      })).data;
      resetComposer(); setSubject(""); setOrderId(""); setCreating(false); setSelectedId(created.id);
      await loadTickets(); await loadMessages(created.id);
    } catch (reason) { setError(errorMessage(reason)); } finally { setBusy(false); }
  };
  const send = async (event: FormEvent) => {
    event.preventDefault(); if (!selected || !message.trim()) return;
    setBusy(true); setError("");
    try {
      await api.post(`/user/support/tickets/${selected.id}/messages`, { message, attachmentUrl: attachmentUrl || null });
      resetComposer(); await Promise.all([loadMessages(selected.id), loadTickets()]);
    } catch (reason) { setError(errorMessage(reason)); } finally { setBusy(false); }
  };
  const close = async () => {
    if (!selected) return; setBusy(true); setError("");
    try { await api.patch(`/user/support/tickets/${selected.id}/close`); await loadTickets(); }
    catch (reason) { setError(errorMessage(reason)); } finally { setBusy(false); }
  };

  return <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-bold">Chat hỗ trợ trực tiếp</h1><p className="mt-1 text-muted-foreground">Trao đổi với Yufiz về mặc cả, đơn đặc biệt hoặc vấn đề cần hỗ trợ.</p></div><Button onClick={() => { setCreating(true); resetComposer(); }}><Plus className="h-4 w-4" /> Cuộc trò chuyện mới</Button></div>
    {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
    <div className="grid min-h-[620px] overflow-hidden rounded-2xl border bg-white shadow-sm lg:grid-cols-[320px_1fr]">
      <aside className="border-b lg:border-b-0 lg:border-r"><div className="border-b p-4 font-semibold">Các cuộc trò chuyện</div><div className="max-h-72 overflow-y-auto lg:max-h-[570px]">
        {loading ? <p className="p-4 text-muted-foreground">Đang tải...</p> : tickets.length === 0 ? <p className="p-4 text-sm text-muted-foreground">Bạn chưa có cuộc trò chuyện nào.</p> : tickets.map((ticket) => <button key={ticket.id} onClick={() => chooseTicket(ticket.id)} className={`w-full border-b p-4 text-left ${!creating && selectedId === ticket.id ? "bg-orange-50" : "hover:bg-muted/50"}`}><div className="flex items-start justify-between gap-2"><strong className="line-clamp-1 text-sm">{ticket.subject}</strong><span className="shrink-0 text-xs text-muted-foreground">{formatTime(ticket.updatedAt)}</span></div><p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{ticket.lastMessage}</p><div className="mt-2 flex flex-wrap gap-1"><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{topicLabel[ticket.topic]}</span><span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">{statusLabel[ticket.status]}</span></div></button>)}
      </div></aside>
      {creating ? <section className="p-5 sm:p-8"><div className="mb-6 flex items-start justify-between"><div><h2 className="text-xl font-bold">Tạo cuộc trò chuyện</h2><p className="text-sm text-muted-foreground">Chọn đúng loại yêu cầu để đội ngũ Yufiz hỗ trợ nhanh hơn.</p></div>{tickets.length > 0 && <button aria-label="Đóng" onClick={() => setCreating(false)} className="rounded-lg p-2 hover:bg-muted"><X className="h-5 w-5" /></button>}</div><form onSubmit={createTicket} className="max-w-2xl space-y-4"><label className="block font-medium">Loại hỗ trợ<select value={topic} onChange={(e) => setTopic(e.target.value as SupportTopic)} className="mt-1 w-full rounded-xl border p-3"><option value="GENERAL">Hỗ trợ chung</option><option value="BARGAIN">Mặc cả sản phẩm</option><option value="SPECIAL_ORDER">Đặt hàng đặc biệt</option></select></label><label className="block font-medium">Đơn hàng liên quan (không bắt buộc)<select value={orderId} onChange={(e) => setOrderId(e.target.value)} className="mt-1 w-full rounded-xl border p-3"><option value="">Không gắn với đơn hàng</option>{orders.map((order) => <option key={order.id} value={order.id}>{order.orderCode} · {order.productName || order.status}</option>)}</select></label><label className="block font-medium">Tiêu đề (không bắt buộc)<input maxLength={200} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Yufiz sẽ tự đặt tiêu đề nếu để trống" className="mt-1 w-full rounded-xl border p-3" /></label><MessageComposer message={message} setMessage={setMessage} attachmentUrl={attachmentUrl} setAttachmentUrl={setAttachmentUrl} busy={busy} buttonLabel="Gửi tin nhắn" /></form></section> : !selected ? <div className="grid place-items-center p-8 text-center text-muted-foreground"><div><MessageCircle className="mx-auto mb-3 h-12 w-12" /><p>Chọn hoặc tạo một cuộc trò chuyện.</p></div></div> : <section className="flex min-w-0 flex-col"><header className="border-b p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold">{selected.subject}</h2><p className="text-sm text-muted-foreground">{topicLabel[selected.topic]} · {statusLabel[selected.status]}{selected.assignedAdminName ? ` · ${selected.assignedAdminName} phụ trách` : ""}</p></div>{selected.status !== "CLOSED" && <Button size="sm" variant="outline" disabled={busy} onClick={() => void close()}><CheckCircle2 className="h-4 w-4" /> Kết thúc</Button>}</div>{selected.orderId && <Link to={`/orders/${selected.orderId}`} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"><Package className="h-4 w-4" /> Xem đơn {selected.orderCode}</Link>}</header><div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4 lg:max-h-[410px]">{messages.length === 0 ? <p className="text-center text-muted-foreground">Chưa có tin nhắn.</p> : messages.map((item) => <div key={item.id} className={`flex ${item.senderRole === "CUSTOMER" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 ${item.senderRole === "CUSTOMER" ? "bg-primary text-white" : "border bg-white"}`}><p className="mb-1 text-xs opacity-75">{item.senderRole === "CUSTOMER" ? "Bạn" : item.senderName}</p><p className="whitespace-pre-wrap break-words">{item.message}</p>{item.attachmentUrl && <a href={item.attachmentUrl} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm underline">Mở tệp đính kèm</a>}<p className="mt-1 text-right text-[11px] opacity-70">{formatTime(item.createdAt)}</p></div></div>)}<div ref={endRef} /></div>{selected.status === "CLOSED" ? <div className="border-t p-5 text-center text-sm text-muted-foreground">Cuộc trò chuyện đã đóng. Gửi tin mới sẽ tự mở lại cuộc trò chuyện.</div> : <form onSubmit={send} className="border-t p-4"><MessageComposer message={message} setMessage={setMessage} attachmentUrl={attachmentUrl} setAttachmentUrl={setAttachmentUrl} busy={busy} buttonLabel="Gửi tin nhắn" /></form>}</section>}
    </div>
  </div>;
}

function MessageComposer({ message, setMessage, attachmentUrl, setAttachmentUrl, busy, buttonLabel }: {
  message: string; setMessage: (value: string) => void; attachmentUrl: string;
  setAttachmentUrl: (value: string) => void; busy: boolean; buttonLabel: string;
}) {
  return <div className="space-y-3"><label className="block font-medium">Nội dung<textarea required maxLength={5000} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 min-h-28 w-full rounded-xl border p-3" placeholder="Mô tả nội dung bạn cần Yufiz hỗ trợ..." /></label><div className="flex flex-col gap-3 sm:flex-row"><label className="flex-1 text-sm">Link ảnh/tệp (không bắt buộc)<input type="url" maxLength={1000} value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5" placeholder="https://..." /></label><Button type="submit" disabled={busy || !message.trim()} className="self-end"><Send className="h-4 w-4" /> {buttonLabel}</Button></div></div>;
}
