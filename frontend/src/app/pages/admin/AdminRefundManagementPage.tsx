import { useMemo, useState } from "react";
import { Link } from "react-router";
import { CheckCircle2, ExternalLink, RotateCcw, XCircle } from "lucide-react";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { DataTable, RemoteState, useRemote } from "../../components/RemoteData";
import api from "../../utils/api";
import { errorMessage, money } from "../../utils/commerce";

type RefundRow = {
  id:number; orderId:number; orderCode:string; customerEmail:string; customerName:string; reason:string; evidenceUrl:string|null;
  status:string; requestedAmountVnd:number; approvedAmountVnd:number|null; paidAmountVnd:number; refundedAmountVnd:number;
  adminNote:string|null; reviewedAt:string|null; createdAt:string;
};
const statusLabel:Record<string,string> = { REQUESTED:"Chờ xử lý", REVIEWING:"Đang kiểm tra", APPROVED:"Đã duyệt", REJECTED:"Đã từ chối", RETURNING:"Đang hoàn hàng", COMPLETED:"Đã hoàn tiền" };

export function AdminRefundManagementPage() {
  const state = useRemote<RefundRow[]>("/admin/returns");
  const [selectedId, setSelectedId] = useState<number|null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = useMemo(() => state.data?.find((item) => item.id === selectedId) ?? null, [state.data, selectedId]);

  const open = (row:RefundRow) => { setSelectedId(row.id); setAmount(String(row.requestedAmountVnd)); setNote(""); setMessage(""); };
  const decide = async (action:"approve"|"reject") => {
    if (!selected) return;
    setBusy(true); setMessage("");
    try {
      await api.post(`/admin/returns/${selected.id}/${action}`, action === "approve" ? { amountVnd:Number(amount), note } : { note });
      setMessage(action === "approve" ? "Đã hoàn tiền vào Ví Yufiz của khách." : "Đã từ chối yêu cầu hoàn tiền.");
      await state.refresh();
    } catch (requestError) { setMessage(errorMessage(requestError)); }
    finally { setBusy(false); }
  };

  return <div className="max-w-7xl mx-auto space-y-6">
    <div><p className="text-sm font-medium text-primary">Tài chính</p><h1 className="text-3xl font-bold">Duyệt hoàn tiền</h1><p className="text-muted-foreground mt-2">Mỗi quyết định được lưu cùng số dư trước và sau giao dịch.</p></div>
    <RemoteState state={state}><Card><DataTable rows={state.data ?? []} columns={[
      {key:"orderCode",label:"Đơn",render:(value,row) => <Link className="text-primary font-medium" to={`/admin/orders/${row.orderId}`}>{value}</Link>},
      {key:"customerName",label:"Khách",render:(value,row) => <><strong>{value}</strong><small className="block text-muted-foreground">{row.customerEmail}</small></>},
      {key:"requestedAmountVnd",label:"Khách yêu cầu",render:money},
      {key:"status",label:"Trạng thái",render:(value) => <span className="rounded-full bg-muted px-3 py-1 text-sm">{statusLabel[value] ?? value}</span>},
      {key:"id",label:"Thao tác",render:(_,row) => <Button size="sm" variant="outline" onClick={() => open(row)}>Xem xét</Button>},
    ]}/></Card></RemoteState>

    {selected && <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4" onMouseDown={() => setSelectedId(null)}>
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4"><div><p className="text-sm text-primary">{selected.orderCode}</p><h2 className="text-2xl font-bold">Xử lý yêu cầu #{selected.id}</h2></div><button aria-label="Đóng" onClick={() => setSelectedId(null)}><XCircle /></button></div>
        <div className="grid sm:grid-cols-3 gap-3 my-5">
          <div className="bg-muted rounded-xl p-3"><small>Đã thanh toán</small><strong className="block">{money(selected.paidAmountVnd)}</strong></div>
          <div className="bg-muted rounded-xl p-3"><small>Đã hoàn</small><strong className="block">{money(selected.refundedAmountVnd)}</strong></div>
          <div className="bg-primary/10 rounded-xl p-3"><small>Yêu cầu lần này</small><strong className="block text-primary">{money(selected.requestedAmountVnd)}</strong></div>
        </div>
        <div className="space-y-3 text-sm"><p><strong>Lý do:</strong> {selected.reason}</p>{selected.evidenceUrl && <a className="inline-flex items-center gap-1 text-primary" href={selected.evidenceUrl} target="_blank" rel="noreferrer">Mở minh chứng <ExternalLink className="w-4 h-4" /></a>}</div>
        {["REQUESTED","REVIEWING","APPROVED"].includes(selected.status) ? <div className="mt-6 space-y-4 border-t pt-5">
          <label className="block text-sm font-medium">Số tiền duyệt<input type="number" min="1" max={selected.requestedAmountVnd} step="1" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 border rounded-xl px-4 py-3 w-full" /></label>
          <label className="block text-sm font-medium">Ghi chú bắt buộc<textarea required maxLength={1000} rows={3} value={note} onChange={(event) => setNote(event.target.value)} className="mt-2 border rounded-xl p-3 w-full" placeholder="Kết quả kiểm tra và lý do quyết định" /></label>
          {message && <p role="status" className="rounded-lg bg-muted p-3">{message}</p>}
          <div className="flex flex-wrap gap-3"><Button disabled={busy || !note.trim() || Number(amount) <= 0 || Number(amount) > selected.requestedAmountVnd} onClick={() => decide("approve")}><CheckCircle2 className="inline w-4 h-4 mr-2" />Duyệt và hoàn vào ví</Button><Button variant="outline" disabled={busy || !note.trim()} onClick={() => decide("reject")}><XCircle className="inline w-4 h-4 mr-2" />Từ chối</Button></div>
        </div> : <div className="mt-6 rounded-xl bg-muted p-4"><p className="flex items-center gap-2 font-medium"><RotateCcw className="w-4 h-4" />{statusLabel[selected.status] ?? selected.status}</p><p className="text-sm mt-2">{selected.adminNote}</p>{selected.approvedAmountVnd != null && <p className="text-sm mt-2">Đã hoàn: <strong>{money(selected.approvedAmountVnd)}</strong></p>}</div>}
      </Card>
    </div>}
  </div>;
}
