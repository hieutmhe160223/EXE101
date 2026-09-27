import axios from "axios";
export const money = (value: number | null | undefined) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value ?? 0);
export const errorMessage = (error: unknown) => axios.isAxiosError(error) ? error.response?.data?.message || error.response?.data?.error || "Không thể kết nối. Vui lòng thử lại." : "Có lỗi xử lý. Vui lòng thử lại.";
export interface CostItem { label: string; value: number; currency: string }
export interface Price {
  quantity: number; grandTotalVnd: number; depositAmountVnd: number; finalAmountVnd: number;
  depositPercent: number; exchangeRate: number; totalCny: number; costBreakdown: CostItem[];
}
export interface Quote extends Price {
  variants: { variantId: string; label: string; priceCny: number; stock: number | null }[];
  sourcePriceVerified: boolean | null;
  quoteId: number; nameZh: string; nameVi: string; descriptionVi: string; images: string[];
  priceCny: number; priceVndEstimate: number; exchangeRateUpdatedAt: string | null;
  expiresAt: string | null; translationComplete: boolean | null;
  seller: { name: string; level: string; rating: number | null; reviews: number | null };
}
export interface Order {
  id: number; orderCode: string; status: string; quantity: number; productName: string | null;
  productImageUrl: string | null; sourceUrl: string | null; variantSelected: string | null;
  totalAmountVnd: number; depositAmountVnd: number; finalAmountVnd: number; paidAmountVnd: number; refundedAmountVnd: number;
  shippingAddress: string; customerNote: string | null; createdAt: string;
  costSnapshotJson: string | null;
  timeline: { status: string; label: string; reached: boolean; location?: string; note?: string; createdAt: string | null }[];
  returnRequests: { id:number; reason:string; evidenceUrl:string|null; status:string; adminNote:string|null; requestedAmountVnd:number; approvedAmountVnd:number|null; reviewedAt:string|null; createdAt:string }[];
}
export type Method = "WALLET" | "BANK_TRANSFER" | "MOMO" | "ZALOPAY";
export const methodNames: Record<Method, string> = { WALLET: "Ví Yufiz", BANK_TRANSFER: "Chuyển khoản ngân hàng", MOMO: "Ví MoMo", ZALOPAY: "ZaloPay" };
export interface Payment {
  id: number; orderId: number; orderCode: string; type: "DEPOSIT_70" | "FINAL_30"; method: Method; status: string; amountVnd: number;
  merchantReference: string; message: string | null;
  instructions: null | { qrUrl: string | null; payUrl: string | null; bankCode: string; accountNumber: string; accountName: string; transferContent: string };
}
export const orderStatus = (status: string) => ({
  WAITING_DEPOSIT: "Chờ thanh toán cọc", DEPOSIT_PAID: "Đã nhận cọc", PURCHASED: "Đã mua hàng",
  SHOP_SHIPPING: "Shop đang giao", CHINA_WAREHOUSE: "Đã về kho Trung Quốc", INTERNATIONAL_SHIPPING: "Đang vận chuyển quốc tế",
  VIETNAM_WAREHOUSE: "Đã về kho Việt Nam", WAITING_FINAL_PAYMENT: "Chờ thanh toán còn lại",
  FINAL_PAID: "Đã thanh toán đủ", DELIVERING: "Đang giao hàng", COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy", RETURN_REQUESTED: "Đã yêu cầu trả hàng", REFUNDED: "Đã hoàn tiền",
} as Record<string,string>)[status] || status;

