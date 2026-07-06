import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CreditCard, Image, Video } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import api from "../utils/api";

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
  totalAmountVnd: number;
  paidAmountVnd: number;
  finalAmountVnd: number;
  inspectionMedia: InspectionMedia[];
};

function getCustomerId() {
  return Number(localStorage.getItem("userId") || "2");
}

function formatMoney(value: number) {
  return `${Number(value || 0).toLocaleString()} VND`;
}

export function FinalPaymentPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
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
        console.error("Cannot load final payment order", err);
        setError("Khong the tai thong tin thanh toan.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handlePayment = async () => {
    if (!id) return;
    try {
      setPaying(true);
      await api.post(`/orders/${id}/final-payment`, {
        customerId: getCustomerId(),
        paymentMethod: "BANK_TRANSFER",
        providerTransactionCode: `FE-FINAL-${id}-${Date.now()}`,
      });
      navigate(`/orders/${id}`);
    } catch (err: any) {
      console.error("Cannot pay final amount", err);
      alert(err.response?.data?.message || err.response?.data || "Thanh toan that bai.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="text-center py-12 text-muted-foreground">Dang tai thong tin thanh toan...</Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="text-center py-12 text-destructive">{error || "Khong tim thay don hang."}</Card>
      </div>
    );
  }

  const remainingAmount = Math.max(order.totalAmountVnd - order.paidAmountVnd, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Thanh toan phan con lai</h1>
      <p className="text-muted-foreground mb-8">{order.orderCode}</p>

      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Image className="w-5 h-5" />
          Anh / video kiem hang
        </h2>
        {order.inspectionMedia.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chua co anh hoac video kiem hang.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {order.inspectionMedia.map((media) => (
              <a key={media.id} href={media.mediaUrl} target="_blank" rel="noreferrer">
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

      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Thanh toan
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tong don hang</span>
            <span>{formatMoney(order.totalAmountVnd)}</span>
          </div>
          <div className="flex justify-between text-accent">
            <span>Da thanh toan</span>
            <span>-{formatMoney(order.paidAmountVnd)}</span>
          </div>
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="font-semibold text-lg">Con lai</span>
            <span className="text-2xl font-bold text-primary">{formatMoney(remainingAmount || order.finalAmountVnd)}</span>
          </div>
        </div>
      </Card>

      <Button size="lg" className="w-full" onClick={handlePayment} disabled={paying}>
        {paying ? "Dang xu ly..." : "Xac nhan thanh toan"}
      </Button>
    </div>
  );
}
