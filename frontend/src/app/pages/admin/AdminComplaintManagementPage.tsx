import { useState } from "react";
import { RemoteTablePage,useRemote,RemoteState,DataTable } from "../../components/RemoteData";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import api from "../../utils/api";
import { errorMessage,money } from "../../utils/commerce";
export function AdminComplaintManagementPage(){const tickets=useRemote<any[]>("/admin/support");
const [selected,setSelected]=useState<number|null>(null),[messages,setMessages]=useState<any[]>([]),[message,setMessage]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
const open=async(id:number)=>{setSelected(id);setMessages([]);try{setMessages((await api.get("/admin/support/"+id+"/messages")).data);}catch(e){setError(errorMessage(e));}};
const reply=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);try{await api.post("/admin/support/"+selected+"/messages",{message});setMessage("");await open(selected!);}catch(e){setError(errorMessage(e));}finally{setBusy(false);}};
return <div><RemoteTablePage title="Yêu cầu tìm hàng" url="/admin/sourcing" columns={[{key:"customer",label:"Khách"},{key:"description",label:"Yêu cầu"},{key:"budget",label:"Ngân sách",render:money},{key:"status",label:"Trạng thái"}]}/>
<Card><h2 className="text-xl font-semibold">Hộp thư hỗ trợ</h2><RemoteState state={tickets}><DataTable rows={tickets.data??[]} columns={[{key:"customer",label:"Khách"},{key:"subject",label:"Chủ đề"},{key:"id",label:"Thao tác",render:id=><Button variant="ghost" onClick={()=>open(id)}>Mở</Button>}]}/></RemoteState>
{error&&<p role="alert">{error}</p>}{selected&&<><DataTable rows={[...messages].reverse()} columns={[{key:"sender",label:"Người gửi"},{key:"message",label:"Tin nhắn"}]}/><form onSubmit={reply}><label>Trả lời<textarea required maxLength={5000} value={message} onChange={e=>setMessage(e.target.value)} className="block w-full border p-3"/></label><Button type="submit" disabled={busy}>Gửi trả lời</Button></form></>}</Card></div>;}
