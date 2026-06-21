import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { CheckCircle, X, Eye } from "lucide-react";

export function AdminComplaintManagementPage() {
  const complaints = [
    { id: 1, order: "YF20260616001", customer: "Nguyễn Văn A", reason: "Hàng bị hư hỏng", date: "2026-06-16", status: "pending" },
    { id: 2, order: "YF20260615002", customer: "Trần Thị B", reason: "Sai sản phẩm", date: "2026-06-15", status: "resolved" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Quản lý khiếu nại</h1>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-semibold">Mã đơn</th>
                <th className="pb-3 font-semibold">Khách hàng</th>
                <th className="pb-3 font-semibold">Lý do</th>
                <th className="pb-3 font-semibold">Ngày</th>
                <th className="pb-3 font-semibold">Trạng thái</th>
                <th className="pb-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="border-b last:border-0">
                  <td className="py-4 font-medium">{complaint.order}</td>
                  <td className="py-4">{complaint.customer}</td>
                  <td className="py-4 text-muted-foreground">{complaint.reason}</td>
                  <td className="py-4 text-muted-foreground">{complaint.date}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      complaint.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-accent/10 text-accent"
                    }`}>
                      {complaint.status === "pending" ? "Đang xử lý" : "Đã giải quyết"}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {complaint.status === "pending" && (
                        <>
                          <Button variant="ghost" size="sm">
                            <CheckCircle className="w-4 h-4 text-accent" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      )}
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
