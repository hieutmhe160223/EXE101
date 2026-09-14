import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { MapPin, Package, CreditCard, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import api from "../utils/api";

interface LocationState {
  quoteId: number;
  quantity: number;
  selectedVariant?: string;
}

interface ProductQuote {
  quoteId: number;
  nameZh: string;
  nameVi: string;
  images: string[];
  priceCny: number;
  priceVndEstimate: number;
  seller: {
    name: string;
    level: string;
    rating: number;
    reviews: number;
  };
  costBreakdown: Array<{
    label: string;
    value: number;
    currency: string;
  }>;
  totalCny: number;
  grandTotalVnd: number;
  depositAmountVnd: number;
  exchangeRate: number;
}

export function OrderConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductQuote | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  
  // Form states
  const [shippingAddress, setShippingAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [quantity] = useState(state?.quantity || 1);
  const [selectedVariant] = useState(state?.selectedVariant || "");

  useEffect(() => {
    if (!state?.quoteId) {
      setError("Không tìm thấy thông tin sản phẩm");
      setLoading(false);
      return;
    }
    fetchQuoteDetails();
  }, [state]);

  const fetchQuoteDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/quotes/${state.quoteId}`);
      setProduct(response.data);
    } catch (err: any) {
      console.error("Failed to fetch quote details:", err);
      if (err.response?.status === 404) {
        setError("Không tìm thấy báo giá sản phẩm");
      } else {
        setError("Đã có lỗi xảy ra khi tải thông tin sản phẩm");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!shippingAddress.trim()) {
      setError("Vui lòng nhập địa chỉ giao hàng");
      return;
    }

    setCreatingOrder(true);
    setError(null);

    try {
      // TODO: Replace with actual customerId from auth context
      const customerId = 1; // Temporary hardcoded value

      const response = await api.post("/orders", {
        customerId,
        productQuoteId: state.quoteId,
        quantity,
        variantSelected: selectedVariant,
        shippingAddress: shippingAddress.trim(),
        customerNote: customerNote.trim() || null,
      });

      // Navigate to payment page with orderId
      navigate("/order/payment", {
        state: {
          orderId: response.data.orderId,
          orderCode: response.data.orderCode,
          depositAmount: response.data.depositAmountVnd,
        },
      });
    } catch (err: any) {
      console.error("Failed to create order:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 404) {
        setError("Không tìm thấy thông tin sản phẩm hoặc khách hàng");
      } else {
        setError("Đã có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại");
      }
    } finally {
      setCreatingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <AlertCircle className="w-16 h-16 text-destructive" />
            <p className="text-lg font-medium">{error}</p>
            <Button onClick={() => navigate("/order/new")}>
              Quay lại trang chủ
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!product) return null;

  // Calculate totals for current quantity
  const totalForQuantity = product.grandTotalVnd * quantity;
  const depositForQuantity = product.depositAmountVnd * quantity;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Xác nhận đơn hàng</h1>

      <div className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Shipping Address */}
        <Card>
          <div className="mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5" />
              Địa chỉ giao hàng
            </h2>
            <textarea
              value={shippingAddress}
              onChange={(e) => {
                setShippingAddress(e.target.value);
                setError(null);
              }}
              placeholder="Nhập địa chỉ giao hàng đầy đủ (Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
              className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              disabled={creatingOrder}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Ghi chú (tùy chọn)</label>
            <textarea
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="Ghi chú thêm về đơn hàng..."
              className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={2}
              disabled={creatingOrder}
            />
          </div>
        </Card>

        {/* Product Summary */}
        <Card>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Package className="w-5 h-5" />
            Sản phẩm
          </h2>
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.nameVi}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                  Không có ảnh
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{product.nameVi}</h3>
              <p className="text-sm text-muted-foreground mb-2">{product.nameZh}</p>
              {selectedVariant && (
                <p className="text-sm text-muted-foreground mb-2">Phân loại: {selectedVariant}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Số lượng: {quantity}</span>
                <span className="font-semibold">¥{product.priceCny.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Cost Summary */}
        <Card>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5" />
            Chi phí
          </h2>
          <div className="space-y-3">
            {product.costBreakdown.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-muted-foreground">{item.label}</span>
                <span>
                  {item.currency === "¥"
                    ? `¥${(item.value * quantity).toFixed(2)}`
                    : `${(item.value * quantity).toLocaleString()}₫`}
                </span>
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-semibold text-lg">Tổng cộng</span>
              <span className="text-2xl font-bold text-primary">
                {totalForQuantity.toLocaleString()}₫
              </span>
            </div>
          </div>
        </Card>

        {/* Deposit Info */}
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <h3 className="font-semibold mb-2">💰 Thanh toán đặt cọc</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Bạn cần thanh toán 70% giá trị đơn hàng để xác nhận. Số tiền còn lại sẽ được thanh toán sau khi kiểm hàng tại kho Việt Nam.
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground">Đặt cọc:</span>
            <span className="text-2xl font-bold text-primary">
              {depositForQuantity.toLocaleString()}₫
            </span>
            <span className="text-sm text-muted-foreground">(70%)</span>
          </div>
        </Card>

        <Button
          size="lg"
          className="w-full"
          onClick={handleCreateOrder}
          disabled={creatingOrder || !shippingAddress.trim()}
        >
          {creatingOrder ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              Tiếp tục thanh toán
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}