import { RemoteTablePage } from "../../components/RemoteData";
import { money } from "../../utils/commerce";
export function AdminCustomerManagementPage(){return <RemoteTablePage title="Khách hàng" url="/admin/customers" columns={[
{key:"fullName",label:"Họ tên"},{key:"email",label:"Email"},{key:"phoneNumber",label:"Điện thoại"},{key:"walletBalance",label:"Số dư",render:money},{key:"status",label:"Trạng thái"}]}/>;}
