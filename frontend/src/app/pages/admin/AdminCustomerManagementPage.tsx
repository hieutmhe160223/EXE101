import { useEffect, useState, useCallback } from "react";
import api from "../../../app/utils/api";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { 
  Search, 
  Eye, 
  Lock, 
  Unlock, 
  UserCheck,
  Ban, 
  X, 
  MapPin, 
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  ShieldAlert
} from "lucide-react";

export type AccountStatus = "ACTIVE" | "LOCKED" | "DISABLED";

export interface CustomerResponse {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  totalOrders: number;
  walletBalance: number;
  status: AccountStatus;
}

export interface AddressResponse {
  id: number;
  fullName: string;
  phone: string;
  addressDetail: string;
  default: boolean;
}

export interface BankResponse {
  id: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  branch: string;
  default: boolean;
}

export interface CustomerDetailResponse {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  role: string;
  loyaltyPoints: number;
  walletBalance: number;
  status: AccountStatus;
  totalOrders: number;
  addresses: AddressResponse[];
  banks: BankResponse[]; 
}

interface SpringPage<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export function AdminCustomerManagementPage() {
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [customerDetail, setCustomerDetail] = useState<CustomerDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch danh sách
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = { page, size: 10 };
      if (search.trim()) params.keyword = search.trim();
      if (statusFilter) params.status = statusFilter;

      const response = await api.get<SpringPage<CustomerResponse>>("/v1/admin/customers", { params });
      setCustomers(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (err: any) {
      console.error("Lỗi khi tải dữ liệu khách hàng:", err);
      setError(err?.response?.data?.message || "Không thể lấy danh sách khách hàng!");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Đổi trạng thái tài khoản
  const handleUpdateStatus = async (customer: CustomerResponse, newStatus: AccountStatus) => {
    let confirmMsg = "";
    if (newStatus === "LOCKED") confirmMsg = `Bạn có chắc muốn TẠM KHÓA tài khoản của ${customer.fullName}?`;
    else if (newStatus === "ACTIVE") confirmMsg = `Bạn có chắc muốn MỞ KHÓA tài khoản của ${customer.fullName}?`;
    else if (newStatus === "DISABLED") confirmMsg = `CẢNH BÁO: Bạn có chắc muốn VÔ HIỆU HÓA tài khoản của ${customer.fullName}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.patch(`/v1/admin/customers/${customer.id}/status`, { status: newStatus });
      fetchCustomers();
      if (customerDetail && customerDetail.id === customer.id) {
        setCustomerDetail({ ...customerDetail, status: newStatus });
      }
    } catch (err: any) {
      alert("Cập nhật thất bại: " + (err?.response?.data?.message || err.message));
    }
  };

  // Xem Chi Tiết
  const handleOpenDetail = async (id: number) => {
    setSelectedCustomerId(id);
    setLoadingDetail(true);
    try {
      const response = await api.get<CustomerDetailResponse>(`/v1/admin/customers/${id}`);
      setCustomerDetail(response.data);
    } catch (err: any) {
      alert("Không thể tải thông tin chi tiết khách hàng!");
      setSelectedCustomerId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
  };

  const renderStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            Hoạt động
          </span>
        );
      case "LOCKED":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
            Tạm khóa
          </span>
        );
      case "DISABLED":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
            Vô hiệu
          </span>
        );
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Quản lý khách hàng</h1>
          <p className="text-muted-foreground text-sm mt-1">Tổng cộng {totalElements} khách hàng trong hệ thống</p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="px-4 py-2.5 bg-slate-50 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm min-w-[180px]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="LOCKED">Tạm khóa</option>
            <option value="DISABLED">Vô hiệu hóa</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="py-12 text-center text-muted-foreground font-medium">Đang tải danh sách khách hàng...</div>
        ) : error ? (
          <div className="py-12 text-center text-rose-500 font-medium">{error}</div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500 bg-slate-50/50">
                    <th className="p-4 font-semibold">Tên khách hàng</th>
                    <th className="p-4 font-semibold">Email</th>
                    <th className="p-4 font-semibold">Điện thoại</th>
                    <th className="p-4 font-semibold">Đơn hàng</th>
                    <th className="p-4 font-semibold">Số dư ví</th>
                    <th className="p-4 font-semibold">Trạng thái</th>
                    <th className="p-4 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        Không tìm thấy khách hàng phù hợp.
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr key={customer.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-medium">{customer.fullName || "N/A"}</td>
                        <td className="p-4 text-muted-foreground">{customer.email || "N/A"}</td>
                        <td className="p-4 text-muted-foreground">{customer.phoneNumber || "N/A"}</td>
                        <td className="p-4 font-medium">{customer.totalOrders}</td>
                        <td className="p-4 font-semibold text-emerald-600">{formatCurrency(customer.walletBalance)}</td>
                        <td className="p-4">{renderStatusBadge(customer.status)}</td>
                        <td className="p-4 text-right">
                          <div className="flex gap-1.5 justify-end">
                            {/* Nút 1: Xem chi tiết */}
                            <button
                              onClick={() => handleOpenDetail(customer.id)}
                              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-primary transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {customer.status === "DISABLED" ? (
                              <button
                                onClick={() => handleUpdateStatus(customer, "ACTIVE")}
                                className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors"
                                title="Kích hoạt lại tài khoản"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            ) : (
                              <>
                                {/* Nút 2: Tạm khóa / Mở khóa */}
                                {customer.status === "LOCKED" ? (
                                  <button
                                    onClick={() => handleUpdateStatus(customer, "ACTIVE")}
                                    className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors"
                                    title="Mở khóa tài khoản"
                                  >
                                    <Unlock className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUpdateStatus(customer, "LOCKED")}
                                    className="p-2 hover:bg-amber-50 rounded-lg text-amber-600 transition-colors"
                                    title="Tạm khóa tài khoản"
                                  >
                                    <Lock className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Nút 3: Vô hiệu hóa */}
                                <button
                                  onClick={() => handleUpdateStatus(customer, "DISABLED")}
                                  className="p-2 hover:bg-rose-50 rounded-lg text-rose-500 transition-colors"
                                  title="Vô hiệu hóa tài khoản"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t text-sm">
                <div className="text-muted-foreground">
                  Trang {page + 1} / {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Sau <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* POPUP MODAL XEM CHI TIẾT KHÁCH HÀNG */}
      {selectedCustomerId !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl border">
            <button
              onClick={() => {
                setSelectedCustomerId(null);
                setCustomerDetail(null);
              }}
              className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {loadingDetail || !customerDetail ? (
              <div className="py-16 text-center text-slate-500">Đang tải thông tin chi tiết khách hàng...</div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b pr-10">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                  {customerDetail.fullName ? customerDetail.fullName.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{customerDetail.fullName}</h2>
                  <p className="text-xs text-slate-500">Mã khách hàng: #{customerDetail.id}</p>
                </div>
                {/* Thêm mr-2 hoặc mr-4 để giữ khoảng cách an toàn với nút X */}
                <div className="ml-auto mr-2 shrink-0">
                  {renderStatusBadge(customerDetail.status)}
                </div>
              </div>

                {/* Thông tin cá nhân */}
                <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-xl text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[11px] text-slate-400 block">Email</span>
                      <span className="font-medium">{customerDetail.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[11px] text-slate-400 block">Số điện thoại</span>
                      <span className="font-medium">{customerDetail.phoneNumber || "Chưa cập nhật"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[11px] text-slate-400 block">Ngày sinh</span>
                      <span className="font-medium">{customerDetail.dateOfBirth || "Chưa cập nhật"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[11px] text-slate-400 block">Vai trò</span>
                      <span className="font-medium">{customerDetail.role}</span>
                    </div>
                  </div>
                </div>

                {/* Tài chính & Đơn hàng */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="text-[11px] text-emerald-600 block font-medium">Số dư ví</span>
                    <span className="text-base font-bold text-emerald-700">{formatCurrency(customerDetail.walletBalance)}</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <span className="text-[11px] text-amber-600 block font-medium">Điểm tích lũy</span>
                    <span className="text-base font-bold text-amber-700">{customerDetail.loyaltyPoints} điểm</span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <span className="text-[11px] text-blue-600 block font-medium">Tổng đơn hàng</span>
                    <span className="text-base font-bold text-blue-700">{customerDetail.totalOrders} đơn</span>
                  </div>
                </div>

                {/* SỔ ĐỊA CHỈ */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-slate-800">
                  <MapPin className="w-4 h-4 text-rose-500" /> Sổ địa chỉ ({customerDetail.addresses?.length || 0})
                </h3>
                
                {!customerDetail.addresses || customerDetail.addresses.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-dashed rounded-xl text-xs text-slate-400 italic text-center">
                    Khách hàng chưa đăng ký địa chỉ nào.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customerDetail.addresses.map((addr) => (
                      <div key={addr.id} className="p-3 border rounded-xl text-xs bg-white flex justify-between items-center shadow-sm">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {addr.fullName} <span className="font-normal text-slate-500">({addr.phone})</span>
                          </p>
                          <p className="text-slate-500 mt-1">{addr.addressDetail}</p>
                        </div>
                        {addr.default && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded font-semibold shrink-0">
                            Mặc định
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* TÀI KHOẢN NGÂN HÀNG */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-slate-800">
                  <CreditCard className="w-4 h-4 text-blue-500" /> Tài khoản ngân hàng ({customerDetail.banks?.length || 0})
                </h3>
                
                {!customerDetail.banks || customerDetail.banks.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-dashed rounded-xl text-xs text-slate-400 italic text-center">
                    Khách hàng chưa liên kết tài khoản ngân hàng nào.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customerDetail.banks.map((bank) => (
                      <div key={bank.id} className="p-3 border rounded-xl text-xs bg-white flex justify-between items-center shadow-sm">
                        <div>
                          <p className="font-semibold text-slate-800">{bank.bankName}</p>
                          <p className="text-slate-500 mt-1">
                            STK: <span className="font-mono text-slate-700">{bank.accountNumber}</span> - Chủ TK: {bank.accountHolderName}
                            {bank.branch && <span className="ml-2 text-slate-400">({bank.branch})</span>}
                          </p>
                        </div>
                        {bank.default && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded font-semibold shrink-0">
                            Mặc định
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}