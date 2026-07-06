import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { AlertCircle, CreditCard, Image, MapPin, MessageCircle, Package, Video } from "lucide-react";
import { Link, useParams } from "react-router";
import { useEffect, useState } from "react";
import api from "../utils/api";

type TimelineItem = {
  status: string;
  label: string;
  reached: boolean;
  location: string | null;
  note: string | null;
  createdAt: string | null;
};

type InspectionMedia = {
  id: number;
  mediaType: string;
  mediaUrl: string;
  note: string | null;
  createdAt: string;
};

type OrderDetail = {
  id: number;
  orderCode: string;
  status: string;
  quantity: number;
  totalAmountVnd: number;
  depositAmountVnd: number;
  finalAmountVnd: number;
  paidAmountVnd: number;
  shippingAddress: string | null;
  customerNote: string | null;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineItem[];
  inspectionMedia: InspectionMedia[];
  returnRequests: unknown[];
};

const statusLabels: Record<string, string> = {
  WAITING_DEPOSIT: "Cho thanh toan coc",
  DEPOSIT_PAID: "Da dat hang",
  PURCHASED: "Da mua hang",
  SHOP_SHIPPING: "Shop dang giao",
  CHINA_WAREHOUSE: "Kho Trung Quoc",
  INTERNATIONAL_SHIPPING: "Van chuyen quoc te",
  VIETNAM_WAREHOUSE: "Kho Viet Nam",
  WAITING_FINAL_PAYMENT: "Cho thanh toan 30%",
  FINAL_PAID: "Da thanh toan 30%",
  DELIVERING: "Dang giao khach",
  COMPLETED: "Hoan thanh",
  RETURN_REQUESTED: "Yeu cau doi/tra",
  CANCELLED: "Da huy",
  REFUNDED: "Da hoan tien",
};

function getCustomerId() {
  return Number(localStorage.getItem("userId") || "2");
}

function formatMoney(value: number) {
  return `${Number(value || 0).toLocaleString()} VND`;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("vi-VN") : "";
}

function canPayFinal(status: string) {
  return status === "VIETNAM_WAREHOUSE" || status === "WAITING_FINAL_PAYMENT";
}

function canRequestReturn(status: string) {
  return ["FINAL_PAID", "DELIVERING", "COMPLETED"].includes(status);
}

export function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get<OrderDetail>(`/orders/${id}`, {
          params: { customerId: getCustomerId() },
        });
        setOrder(response.data);
      } catch (err) {
        console.error("Cannot load order detail", err);
        setError("Khong the tai chi tiet don hang.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card className="text-center py-12 text-muted-foreground">Dang tai chi tiet don hang...</Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card className="text-center py-12 text-destructive">{error || "Khong tim thay don hang."}</Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Don hang {order.orderCode}</h1>
          <p className="text-muted-foreground">{statusLabels[order.status] ?? order.status}</p>
        </div>
        <Link to="/chat">
          <Button variant="outline">
            <MessageCircle className="w-4 h-4 mr-2" />
            Ho tro
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-xl font-semibold mb-6">Trang thai tung chang</h2>
            <div className="space-y-4">
              {order.timeline.map((item, index) => (
                <div key={item.status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.reached ? "bg-accent text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {item.reached ? "✓" : index + 1}
                    </div>
                    {index < order.timeline.length - 1 && (
                      <div className={`w-0.5 h-14 ${item.reached ? "bg-accent" : "bg-muted"}`} />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className={`font-medium ${item.reached ? "text-foreground" : "text-muted-foreground"}`}>
                      {item.label || statusLabels[item.status] || item.status}
                    </div>
                    {item.location && <div className="text-sm text-muted-foreground">{item.location}</div>}
                    {item.note && <div className="text-sm text-muted-foreground">{item.note}</div>}
                    {item.createdAt && <div className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</div>}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <Package className="w-5 h-5" />
              Thong tin don hang
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">So luong</div>
                <div className="font-semibold">{order.quantity}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Ghi chu</div>
                <div className="font-semibold">{order.customerNote || "Khong co"}</div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <Image className="w-5 h-5" />
              Anh / video kiem hang
            </h2>
            {order.inspectionMedia.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chua co anh hoac video kiem hang.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {order.inspectionMedia.map((media) => (
                  <a key={media.id} href={media.mediaUrl} target="_blank" rel="noreferrer" className="block">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                      {media.mediaType?.toLowerCase().includes("video") ? (
                        <Video className="w-8 h-8 text-muted-foreground" />
                      ) : (
                        <img src={media.mediaUrl} alt={media.note || "Inspection media"} className="w-full h-full object-cover" />
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5" />
              Chi phi
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tong don hang</span>
                <span>{formatMoney(order.totalAmountVnd)}</span>
              </div>
              <div className="flex justify-between text-accent">
                <span>Da thanh toan</span>
                <span>{formatMoney(order.paidAmountVnd)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Con lai</span>
                <span className="text-primary">{formatMoney(Math.max(order.totalAmountVnd - order.paidAmountVnd, 0))}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5" />
              Dia chi giao hang
            </h2>
            <div className="text-sm text-muted-foreground">
              {order.shippingAddress || "Chua co dia chi giao hang"}
            </div>
          </Card>

          <div className="space-y-2">
            {canPayFinal(order.status) && (
              <Link to={`/orders/${order.id}/final-payment`}>
                <Button className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Thanh toan 30% con lai
                </Button>
              </Link>
            )}
            {canRequestReturn(order.status) && (
              <Link to={`/orders/${order.id}/refund`}>
                <Button variant="outline" className="w-full">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Yeu cau doi/tra hang
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
