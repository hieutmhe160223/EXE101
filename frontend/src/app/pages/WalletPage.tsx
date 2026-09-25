import { WalletTopUp } from "../components/WalletTopUp";
import { useRemote,RemoteState,DataTable } from "../components/RemoteData";
import { Card } from "../components/Card";
import { money } from "../utils/commerce";
export function WalletPage(){const s=useRemote("/user/wallet");return <div className="max-w-6xl mx-auto p-6"><h1 className="text-3xl font-bold mb-6">Ví của tôi</h1><WalletTopUp onPaid={s.refresh}/><RemoteState state={s}>{s.data&&<>
<div className="grid md:grid-cols-2 gap-4 mb-6"><Card>Số dư: <strong>{money(s.data.profile.walletBalance)}</strong></Card><Card>Điểm thưởng: {s.data.profile.loyaltyPoints??0}</Card></div>
<Card><h2>Lịch sử ví</h2><DataTable rows={s.data.transactions} columns={[{key:"description",label:"Nội dung",render:(v,r)=><>{v}{r.reference&&<small className="block text-muted-foreground">Mã: {r.reference}</small>}</>},{key:"type",label:"Loại",render:v=>({TOP_UP:"Nạp tiền",PAYMENT:"Thanh toán",REFUND:"Hoàn tiền",REWARD:"Thưởng",ADJUSTMENT:"Điều chỉnh"}[v]??v)},{key:"amount",label:"Số tiền",render:(v)=><strong className={v>=0?"text-emerald-600":"text-rose-600"}>{v>=0?"+":""}{money(v)}</strong>},{key:"balanceAfter",label:"Số dư sau",render:money},{key:"createdAt",label:"Ngày",render:v=>new Date(v).toLocaleString("vi-VN")}]}/></Card>
<Card className="mt-6"><h2>Mã giảm giá của tôi</h2><DataTable rows={s.data.vouchers} columns={[{key:"code",label:"Mã"},{key:"name",label:"Tên"},{key:"endsAt",label:"Hết hạn"},{key:"usedAt",label:"Đã dùng lúc"}]}/></Card>
</>}</RemoteState></div>;}
