import { RemoteTablePage } from "../../components/RemoteData";
import { money } from "../../utils/commerce";
export function AdminCouponManagementPage(){return <RemoteTablePage title="Mã giảm giá trong hệ thống" url="/admin/vouchers" columns={[
{key:"code",label:"Mã"},{key:"name",label:"Tên"},{key:"discountValue",label:"Giảm",render:(v,r)=>r.percentage?v+"%":money(v)},
{key:"minimumOrderVnd",label:"Đơn tối thiểu",render:money},{key:"endsAt",label:"Hết hạn"},{key:"active",label:"Đang bật",render:v=>v?"Có":"Không"}]}/>;}
