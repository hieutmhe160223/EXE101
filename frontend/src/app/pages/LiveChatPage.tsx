import { useState } from "react";
import { useRemote,RemoteState } from "../components/RemoteData";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import api from "../utils/api";
import { errorMessage } from "../utils/commerce";
export function LiveChatPage(){const s=useRemote<any[]>("/user/support");const [message,setMessage]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
const send=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError("");try{await api.post("/user/support",{message});setMessage("");await s.refresh();}catch(e){setError(errorMessage(e));}finally{setBusy(false);}};
return <div className="max-w-4xl mx-auto p-6"><h1 className="text-3xl font-bold mb-6">Tin nhắn hỗ trợ</h1><Button variant="outline" onClick={s.refresh}>Tải tin nhắn mới</Button><RemoteState state={s}>
{!s.data?.length?<p className="py-6">Chưa có tin nhắn.</p>:[...(s.data??[])].reverse().map(m=><Card className="my-3" key={m.id}><strong>{m.sender}</strong><p className="whitespace-pre-wrap">{m.message}</p><small>{m.createdAt}</small></Card>)}</RemoteState>
<form onSubmit={send} className="mt-6 space-y-3"><label className="block">Nội dung<textarea required maxLength={5000} className="border p-3 w-full" value={message} onChange={e=>setMessage(e.target.value)}/></label>{error&&<p role="alert">{error}</p>}<Button type="submit" disabled={busy}>Gửi tin nhắn</Button></form></div>;}
