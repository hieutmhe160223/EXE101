import { Price, money } from "../utils/commerce";
export function CostSummary({ price }: { price: Price }) {
  return <div className="space-y-3">
    {price.costBreakdown.map((item, i) => <div key={i} className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{item.label}</span><span className="text-right">{money(item.value)}</span>
    </div>)}
    <div className="border-t pt-3 flex justify-between font-semibold"><span>Tổng đơn</span><span>{money(price.grandTotalVnd)}</span></div>
    <div className="flex justify-between text-primary font-semibold"><span>Cọc {Math.round(price.depositPercent * 100)}%</span><span>{money(price.depositAmountVnd)}</span></div>
    <div className="flex justify-between text-sm"><span>Thanh toán còn lại</span><span>{money(price.finalAmountVnd ?? price.grandTotalVnd - price.depositAmountVnd)}</span></div>
    <p className="text-xs text-muted-foreground">Tiền cọc tính trên tổng đơn, gồm phí dịch vụ và các phí khác. Phí vận chuyển quốc tế đang là ước tính; phần còn lại thanh toán khi hàng về kho Việt Nam.</p>
  </div>;
}
