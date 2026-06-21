import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Search, Eye, Ban, CheckCircle } from "lucide-react";

export function AdminCustomerManagementPage() {
  const customers = [
    { id: 1, name: "Nguyễn Văn A", email: "nguyenvana@example.com", phone: "0912345678", orders: 12, wallet: "311,057₫", status: "active" },
    { id: 2, name: "Trần Thị B", email: "tranthib@example.com", phone: "0987654321", orders: 8, wallet: "150,000₫", status: "active" },
    { id: 3, name: "Lê Văn C", email: "levanc@example.com", phone: "0909876543", orders: 25, wallet: "1,200,000₫", status: "vip" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Quản lý khách hàng</h1>

      <Card className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng..."
            className="w-full pl-10 pr-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-semibold">Tên</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Điện thoại</th>
                <th className="pb-3 font-semibold">Đơn hàng</th>
                <th className="pb-3 font-semibold">Số dư ví</th>
                <th className="pb-3 font-semibold">Trạng thái</th>
                <th className="pb-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b last:border-0">
                  <td className="py-4 font-medium">{customer.name}</td>
                  <td className="py-4 text-muted-foreground">{customer.email}</td>
                  <td className="py-4 text-muted-foreground">{customer.phone}</td>
                  <td className="py-4">{customer.orders}</td>
                  <td className="py-4 font-semibold">{customer.wallet}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      customer.status === "vip" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                    }`}>
                      {customer.status === "vip" ? "VIP" : "Active"}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Ban className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
