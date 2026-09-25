import { useRemote,RemoteState,DataTable } from "../../components/RemoteData";
import { Card } from "../../components/Card";
import { money,orderStatus } from "../../utils/commerce";
export function AdminReportsPage(){
const s=useRemote("/admin/reports");
return <div><h1 className="text-3xl font-bold mb-6">Báo cáo dữ liệu hệ thống</h1><RemoteState state={s}>{s.data&&<>
<div className="grid md:grid-cols-3 gap-4 mb-6"><Card>Tổng đơn: <strong>{s.data.orders}</strong></Card><Card>Khách hàng: <strong>{s.data.customers}</strong></Card><Card>Tiền đã nhận theo đơn: <strong>{money(s.data.received)}</strong></Card></div>
<Card><h2 className="font-semibold">Phân bố trạng thái đơn</h2><DataTable rows={s.data.statuses} columns={[{key:"status",label:"Trạng thái",render:orderStatus},{key:"count",label:"Số đơn"}]}/></Card>
<Card className="mt-6"><h2 className="font-semibold">Báo cáo kênh đã lưu</h2><DataTable rows={s.data.channels} columns={[{key:"channel",label:"Kênh"},{key:"date",label:"Ngày"},{key:"orders",label:"Đơn"},{key:"revenue",label:"Doanh thu",render:money},{key:"cost",label:"Chi phí",render:money}]}/></Card>
</>}</RemoteState></div>;
}
