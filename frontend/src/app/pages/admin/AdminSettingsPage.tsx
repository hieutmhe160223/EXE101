import { useState,useEffect } from "react";
import { useRemote,RemoteState } from "../../components/RemoteData";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import api from "../../utils/api";
import { errorMessage } from "../../utils/commerce";
const fields=[["domesticShippingCny","Ship nội địa (CNY)"],["internationalShippingVnd","Ship quốc tế (VND/đơn)"],["insuranceVnd","Bảo hiểm (VND)"],["quoteCacheTtlHours","Hạn báo giá (giờ)"]];
export function AdminSettingsPage(){const s=useRemote("/admin/fee-config");const [form,setForm]=useState<any>(null),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
useEffect(()=>{if(s.data)setForm(s.data);},[s.data]);
const save=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setMessage("");try{setForm((await api.put("/admin/fee-config",form)).data);setMessage("Đã lưu cấu hình.");}catch(e){setMessage(errorMessage(e));}finally{setBusy(false);}};
return <div><h1 className="text-3xl font-bold mb-6">Cấu hình chi phí</h1><RemoteState state={s}>{form&&<Card><form onSubmit={save} className="space-y-4">
<p>Phí dịch vụ: {Number(form.serviceFeePercent)*100}% · Cọc: {Number(form.depositPercent)*100}%</p>
{fields.map(([key,label])=><label className="block" key={key}>{label}<input required type="number" min={key==="quoteCacheTtlHours"?1:0} max={key==="quoteCacheTtlHours"?24:undefined} step="any" value={form[key]} onChange={e=>setForm({...form,[key]:Number(e.target.value)})} className="block border rounded p-3 w-full"/></label>)}
{message&&<p role="status">{message}</p>}<Button type="submit" disabled={busy}>Lưu cấu hình</Button></form></Card>}</RemoteState></div>;}
