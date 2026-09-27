import { useEffect, useState, useCallback } from "react";
import api from "../utils/api";
import { errorMessage } from "../utils/commerce";
import { Card } from "./Card";
import { Button } from "./Button";
export function useRemote<T=any>(url:string) {
  const [data,setData]=useState<T|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(true);
  const refresh=useCallback(async()=>{setLoading(true);setError("");try{setData((await api.get<T>(url)).data);}catch(e){setError(errorMessage(e));}finally{setLoading(false);}},[url]);
  useEffect(()=>{void refresh();},[refresh]);
  return {data,error,loading,refresh};
}
export function RemoteState({state,children}:{state:ReturnType<typeof useRemote>;children:React.ReactNode}) {
  return state.loading?<p className="p-6">Đang tải dữ liệu...</p>:state.error?<Card><p role="alert">{state.error}</p><Button onClick={state.refresh}>Thử lại</Button></Card>:<>{children}</>;
}
export type Column={key:string;label:string;render?:(value:any,row:any)=>React.ReactNode};
export function DataTable({rows,columns}:{rows:any[];columns:Column[]}) {
  if(!rows.length)return <p className="py-6 text-muted-foreground">Chưa có dữ liệu.</p>;
  return <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr>{columns.map(c=><th className="p-3" key={c.key}>{c.label}</th>)}</tr></thead>
    <tbody>{rows.map((r,i)=><tr className="border-t" key={r.id??i}>{columns.map(c=><td className="p-3 whitespace-pre-wrap" key={c.key}>{c.render?c.render(r[c.key],r):String(r[c.key]??"—")}</td>)}</tr>)}</tbody></table></div>;
}
export function RemoteTablePage({title,url,columns}:{title:string;url:string;columns:Column[]}) {
  const state=useRemote<any[]>(url);
  return <div className="max-w-6xl mx-auto p-6"><h1 className="text-3xl font-bold mb-6">{title}</h1><RemoteState state={state}><Card><DataTable rows={state.data??[]} columns={columns}/><p className="text-xs mt-4">Hiển thị tối đa 200 bản ghi gần nhất.</p></Card></RemoteState></div>;
}
