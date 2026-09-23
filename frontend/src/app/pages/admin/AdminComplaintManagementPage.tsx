import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Search, X } from "lucide-react";
import api from "../../utils/api";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";

type ComplaintStatus = "REQUESTED" | "REVIEWING" | "APPROVED" | "REJECTED" | "RETURNING" | "COMPLETED";

interface Complaint {
  id: number;
  orderId: number;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  reason: string;
  evidenceUrl: string | null;
  status: ComplaintStatus;
  adminNote: string | null;
  createdAt: string;
}

interface SpringPage<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

const statusLabels: Record<ComplaintStatus, string> = {
  REQUESTED: "Mới gửi",
  REVIEWING: "Đang xử lý",
  APPROVED: "Đã chấp thuận",
  REJECTED: "Đã từ chối",
  RETURNING: "Đang hoàn trả",
  COMPLETED: "Hoàn tất",
};

const statusClasses: Record<ComplaintStatus, string> = {
  REQUESTED: "bg-amber-100 text-amber-700",
  REVIEWING: "bg-blue-100 text-blue-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  RETURNING: "bg-violet-100 text-violet-700",
  COMPLETED: "bg-slate-100 text-slate-700",
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));

export function AdminComplaintManagementPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page, size: 10 };
      if (search.trim()) params.keyword = search.trim();
      if (statusFilter) params.status = statusFilter;

      const response = await api.get<SpringPage<Complaint>>("/v1/admin/complaints", { params });
      setComplaints(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tải danh sách khiếu nại.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const openDetail = async (complaint: Complaint) => {
    try {
      const response = await api.get<Complaint>(`/v1/admin/complaints/${complaint.id}`);
      setSelected(response.data);
      setAdminNote(response.data.adminNote || "");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Không thể tải chi tiết khiếu nại.");
    }
  };

  const updateComplaint = async (nextStatus: ComplaintStatus) => {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await api.patch<Complaint>(`/v1/admin/complaints/${selected.id}`, {
        status: nextStatus,
        adminNote,
      });
      setSelected(response.data);
      setAdminNote(response.data.adminNote || "");
      await fetchComplaints();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Cập nhật khiếu nại thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Quản lý khiếu nại</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Tổng cộng {totalElements} khiếu nại trong hệ thống
        </p>
      </div>

      <Card className="mb-6 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              placeholder="Tìm theo mã đơn, tên, email hoặc lý do..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(0);
            }}
            className="px-4 py-2.5 bg-slate-50 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm min-w-[190px]"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Đang tải danh sách khiếu nại...</div>
        ) : error ? (
          <div className="py-12 text-center text-rose-500">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500 bg-slate-50/50">
                    <th className="p-4">Mã đơn</th>
                    <th className="p-4">Khách hàng</th>
                    <th className="p-4">Lý do</th>
                    <th className="p-4">Ngày gửi</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        Không tìm thấy khiếu nại phù hợp.
                      </td>
                    </tr>
                  ) : complaints.map((complaint) => (
                    <tr key={complaint.id} className="border-b last:border-0 hover:bg-slate-50/50">
                      <td className="p-4 font-medium">{complaint.orderCode}</td>
                      <td className="p-4">
                        <div>{complaint.customerName}</div>
                        <div className="text-xs text-muted-foreground">{complaint.customerEmail}</div>
                      </td>
                      <td className="p-4 max-w-xs truncate text-muted-foreground">{complaint.reason}</td>
                      <td className="p-4 text-muted-foreground">{formatDate(complaint.createdAt)}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses[complaint.status]}`}>
                          {statusLabels[complaint.status]}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openDetail(complaint)}
                          title="Xem chi tiết"
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-primary"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t p-4 text-sm">
              <span className="text-muted-foreground">
                Trang {totalPages === 0 ? 0 : page + 1} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="p-2 border rounded-lg disabled:opacity-40">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button disabled={page >= totalPages - 1} onClick={() => setPage((current) => current + 1)} className="p-2 border rounded-lg disabled:opacity-40">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Chi tiết khiếu nại</h2>
                <p className="text-sm text-muted-foreground">Đơn hàng {selected.orderCode}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm mb-5">
              <p><span className="text-muted-foreground">Khách hàng: </span>{selected.customerName}</p>
              <p><span className="text-muted-foreground">Email: </span>{selected.customerEmail}</p>
              <p><span className="text-muted-foreground">Ngày gửi: </span>{formatDate(selected.createdAt)}</p>
              <p><span className="text-muted-foreground">Trạng thái: </span>{statusLabels[selected.status]}</p>
            </div>

            <div className="mb-5">
              <p className="text-sm font-semibold mb-2">Lý do</p>
              <p className="rounded-xl bg-slate-50 p-4 text-sm whitespace-pre-wrap">{selected.reason}</p>
            </div>

            {selected.evidenceUrl && (
              <div className="mb-5">
                <p className="text-sm font-semibold mb-2">Bằng chứng</p>
                <a href={selected.evidenceUrl} target="_blank" rel="noreferrer" className="text-primary underline break-all">{selected.evidenceUrl}</a>
              </div>
            )}

            <label className="block text-sm font-semibold mb-2">Ghi chú xử lý</label>
            <textarea value={adminNote} onChange={(event) => setAdminNote(event.target.value)} rows={3} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Nhập ghi chú cho khách hàng hoặc nội bộ..." />

            <div className="flex flex-wrap justify-end gap-2 mt-5">
              <Button variant="outline" onClick={() => setSelected(null)}>Đóng</Button>
              <Button disabled={saving} onClick={() => updateComplaint("REVIEWING")}>Tiếp nhận</Button>
              <Button disabled={saving} onClick={() => updateComplaint("APPROVED")}>Chấp thuận</Button>
              <Button disabled={saving} variant="outline" onClick={() => updateComplaint("REJECTED")}>Từ chối</Button>
              <Button disabled={saving} onClick={() => updateComplaint("COMPLETED")}>Hoàn tất</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
