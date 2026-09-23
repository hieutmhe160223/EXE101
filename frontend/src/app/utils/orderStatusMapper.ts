export interface StatusConfig {
  label: string;
  color: string;
}

export const ORDER_STATUS_MAP: Record<string, StatusConfig> = {
  DRAFT: { label: "Nháp", color: "#9CA3AF" },
  WAITING_DEPOSIT: { label: "Chờ cọc", color: "#F59E0B" },
  DEPOSIT_PAID: { label: "Đã cọc", color: "#3B82F6" },
  PURCHASED: { label: "Đã mua", color: "#6366F1" },
  SHOP_SHIPPING: { label: "Shop phát hàng", color: "#8B5CF6" },
  CHINA_WAREHOUSE: { label: "Kho TQ", color: "#A855F7" },
  INTERNATIONAL_SHIPPING: { label: "Vận chuyển TQ-VN", color: "#EC4899" },
  VIETNAM_WAREHOUSE: { label: "Kho VN", color: "#06B6D4" },
  WAITING_FINAL_PAYMENT: { label: "Chờ thanh toán", color: "#F97316" },
  FINAL_PAID: { label: "Đã thanh toán", color: "#10B981" },
  DELIVERING: { label: "Đang giao", color: "#FF6A00" },
  COMPLETED: { label: "Hoàn thành", color: "#10B981" },
  CANCELLED: { label: "Đã hủy", color: "#EF4444" },
  RETURN_REQUESTED: { label: "Khiếu nại", color: "#DC2626" },
  REFUNDED: { label: "Đã hoàn tiền", color: "#6B7280" },
};