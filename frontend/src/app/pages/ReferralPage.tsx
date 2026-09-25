import { useRemote,RemoteState,DataTable } from "../components/RemoteData";
import { Card } from "../components/Card";
import { money } from "../utils/commerce";
export function ReferralPage(){const s=useRemote("/user/referrals");return <div className="max-w-5xl mx-auto p-6"><h1 className="text-3xl font-bold mb-6">Giới thiệu bạn bè</h1><RemoteState state={s}>{s.data&&<Card>
<p>Mã giới thiệu: <strong>{s.data.profile.referralCode||"Chưa được cấp mã"}</strong></p><DataTable rows={s.data.items} columns={[{key:"name",label:"Người được giới thiệu"},{key:"reward",label:"Thưởng ghi nhận",render:money},{key:"rewarded",label:"Đã trả thưởng",render:v=>v?"Có":"Chưa"},{key:"createdAt",label:"Ngày"}]}/></Card>}</RemoteState></div>;}
