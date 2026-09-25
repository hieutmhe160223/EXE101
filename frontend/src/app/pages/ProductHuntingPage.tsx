import { useState } from "react";
import { useRemote,RemoteState,DataTable } from "../components/RemoteData";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import api from "../utils/api";
import { errorMessage,money } from "../utils/commerce";
export function ProductHuntingPage(){const s=useRemote<any[]>("/user/sourcing");const [description,setDescription]=useState(""),[budget,setBudget]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError("");try{await api.post("/user/sourcing",{description,budget:budget?Number(budget):null});setDescription("");setBudget("");await s.refresh();}catch(e){setError(errorMessage(e));}finally{setBusy(false);}};
return <div className="max-w-5xl mx-auto p-6"><h1 className="text-3xl font-bold mb-6">Yêu cầu tìm sản phẩm</h1><Card><form onSubmit={submit} className="space-y-4">
<label className="block">Mô tả sản phẩm<textarea required maxLength={5000} value={description} onChange={e=>setDescription(e.target.value)} className="border p-3 w-full"/></label>
<label className="block">Ngân sách (VND, tùy chọn)<input type="number" min={0} value={budget} onChange={e=>setBudget(e.target.value)} className="border p-3 w-full"/></label>
{error&&<p role="alert">{error}</p>}<Button disabled={busy} type="submit">Gửi yêu cầu</Button></form></Card><RemoteState state={s}><DataTable rows={s.data??[]} columns={[{key:"description",label:"Yêu cầu"},{key:"budget",label:"Ngân sách",render:v=>v==null?"—":money(v)},{key:"status",label:"Trạng thái"}]}/></RemoteState></div>;}
