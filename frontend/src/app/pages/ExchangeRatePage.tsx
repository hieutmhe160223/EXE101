import { useRemote,RemoteState } from "../components/RemoteData";
import { Card } from "../components/Card";
import { money } from "../utils/commerce";
export function ExchangeRatePage(){const s=useRemote("/quotes/exchange-rate");return <div className="max-w-3xl mx-auto p-6"><h1 className="text-3xl font-bold mb-6">Tỷ giá CNY/VND</h1><RemoteState state={s}>{s.data&&<Card><p className="text-3xl font-bold">1 ¥ = {money(s.data.rate)}</p><p>Cập nhật: {s.data.updatedAt}</p><p className="mt-4">Chi phí cụ thể được tính trong báo giá sản phẩm và lưu theo đơn khi xác nhận.</p></Card>}</RemoteState></div>;}
