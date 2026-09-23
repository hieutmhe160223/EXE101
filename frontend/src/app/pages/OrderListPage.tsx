import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Search, Filter, Package } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";

type OrderStatus =
  | "WAITING_DEPOSIT"
  | "DEPOSIT_PAID"
  | "PURCHASED"
  | "SHOP_SHIPPING"
  | "CHINA_WAREHOUSE"
  | "INTERNATIONAL_SHIPPING"
  | "VIETNAM_WAREHOUSE"
  | "WAITING_FINAL_PAYMENT"
  | "FINAL_PAID"
  | "DELIVERING"
  | "COMPLETED"
  | "RETURN_REQUESTED"
  | "CANCELLED"
  | "REFUNDED";

type OrderSummary = {
  id: number;
  orderCode: string;
  status: OrderStatus;
  quantity: number;
  totalAmountVnd: number;
  paidAmountVnd: number;
  finalAmountVnd: number;
  createdAt: string;
  updatedAt: string;
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

const statusColors: Record<string, string> = {
  WAITING_DEPOSIT: "bg-amber-100 text-amber-700",
  DEPOSIT_PAID: "bg-blue-100 text-blue-700",
  PURCHASED: "bg-blue-100 text-blue-700",
  SHOP_SHIPPING: "bg-purple-100 text-purple-700",
  CHINA_WAREHOUSE: "bg-purple-100 text-purple-700",
  INTERNATIONAL_SHIPPING: "bg-orange-100 text-orange-700",
  VIETNAM_WAREHOUSE: "bg-emerald-100 text-emerald-700",
  WAITING_FINAL_PAYMENT: "bg-amber-100 text-amber-700",
  FINAL_PAID: "bg-green-100 text-green-700",
  DELIVERING: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-green-100 text-green-700",
  RETURN_REQUESTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-muted text-muted-foreground",
  REFUNDED: "bg-muted text-muted-foreground",
};

const filterGroups: Record<string, OrderStatus[]> = {
  ordered: ["WAITING_DEPOSIT", "DEPOSIT_PAID", "PURCHASED"],
  warehouse_cn: ["SHOP_SHIPPING", "CHINA_WAREHOUSE"],
  shipping: ["INTERNATIONAL_SHIPPING", "VIETNAM_WAREHOUSE", "WAITING_FINAL_PAYMENT", "FINAL_PAID", "DELIVERING"],
  delivered: ["COMPLETED"],
};

function getCustomerId() {
  return Number(localStorage.getItem("userId") || "2");
}

function formatMoney(value: number) {
  return `${Number(value || 0).toLocaleString()} VND`;
}

function formatDate(value: string) {
  return value ? new Date(value).toLocaleDateString("vi-VN") : "";
}

export function OrderListPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get<OrderSummary[]>("/orders", {
          params: { customerId: getCustomerId() },
        });
        setOrders(response.data);
      } catch (err) {
        console.error("Cannot load orders", err);
        setError("Khong the tai danh sach don hang.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter = filter === "all" || filterGroups[filter]?.includes(order.status);
      const keyword = search.trim().toLowerCase();
      const matchesSearch = !keyword || order.orderCode.toLowerCase().includes(keyword);
      return matchesFilter && matchesSearch;
    });
  }, [filter, orders, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Quan ly don hang</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tim kiem don hang..."
            className="w-full pl-10 pr-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Loc
        </Button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: "all", label: "Tat ca" },
          { id: "ordered", label: "Da dat" },
          { id: "warehouse_cn", label: "Kho TQ" },
          { id: "shipping", label: "Dang van chuyen" },
          { id: "delivered", label: "Hoan thanh" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filter === tab.id ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Card className="text-center py-12 text-muted-foreground">Dang tai don hang...</Card>
      ) : error ? (
        <Card className="text-center py-12 text-destructive">{error}</Card>
      ) : filteredOrders.length === 0 ? (
        <Card className="text-center py-16">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Chua co don hang</h3>
          <p className="text-muted-foreground mb-6">
            Don hang se hien thi sau khi duoc tao tren he thong.
          </p>
          <Link to="/order/new">
            <Button>Tao don hang</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} hover>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Link to={`/orders/${order.id}`} className="font-semibold hover:text-primary">
                    {order.orderCode}
                  </Link>
                  <div className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status] ?? "bg-muted text-muted-foreground"}`}>
                  {statusLabels[order.status] ?? order.status}
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">So luong: {order.quantity}</div>
                <div className="text-right">
                  <div className="font-semibold text-lg">{formatMoney(order.totalAmountVnd)}</div>
                  <div className="text-xs text-muted-foreground">Da thanh toan: {formatMoney(order.paidAmountVnd)}</div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link to={`/orders/${order.id}`}>
                  <Button variant="outline" size="sm">
                    <Package className="w-4 h-4 mr-2" />
                    Chi tiet
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
