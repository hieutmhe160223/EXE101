import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { User, Phone, MapPin, CreditCard, Lock, Save } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../utils/api";
import { AddressModal } from "./AddressModal";
import { BankModal } from "./BankModal";

interface Address {
  id: string | number;
  fullName: string;
  phone: string;
  addressDetail: string;
  isDefault: boolean;
}

export function UserProfilePage() {
  const [activeTab, setActiveTab] = useState<"info" | "address" | "bank" | "security">("info");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [addresses, setAddresses] = useState<any[]>([]); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [editingAddress, setEditingAddress] = useState<any | null>(null); 
  const [banks, setBanks] = useState<any[]>([]);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<any | null>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    setFullName(localStorage.getItem("userFullName") || "");
    setEmail(localStorage.getItem("userEmail") || "");
    setDob(localStorage.getItem("userDob") || "");
    setPhone(localStorage.getItem("userPhone") || "");
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put("/user/profile", {
        fullName: fullName,
        email: email,           
        dob: dob,               
        phoneNumber: phone     
      });

      localStorage.setItem("userFullName", fullName);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userDob", dob);
      localStorage.setItem("userPhone", phone);

      alert(response.data || "Cập nhật thông tin cá nhân thành công!");
    } catch (error: any) {
      console.error("Lỗi chi tiết khi lưu vào Database:", error);
      const serverError = error.response?.data;
      alert(typeof serverError === "string" ? serverError : "Có lỗi xảy ra, không thể chỉnh sửa thông tin vào Database!");
    }
  };

  const fetchBanks = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail") || "";
      const response = await api.get(`/user/banks?email=${userEmail}`);
      setBanks(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách ngân hàng:", error);
    }
  };

  const handleAddBankNew = () => {
    setEditingBank(null);
    setIsBankModalOpen(true);
  };

  const handleBankEdit = (bank: any) => {
    setEditingBank(bank);
    setIsBankModalOpen(true);
  };

  const handleBankDelete = async (bankId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản ngân hàng này không?")) return;
    try {
      
      await api.delete(`/user/banks/${bankId}`);
      setBanks(banks.filter((item) => item.id !== bankId));
      alert("Xóa tài khoản ngân hàng thành công!");
    } catch (error) {
      console.error("Error deleting bank:", error);
      alert("Không thể xóa tài khoản, vui lòng thử lại!");
    }
  };

 const fetchAddresses = async () => {
  try {
    const userEmail = localStorage.getItem("userEmail") || "";
    const response = await api.get(`/user/addresses?email=${userEmail}`);
    setAddresses(response.data); 
  } catch (error) {
    console.error("Lỗi khi lấy danh sách địa chỉ:", error);
  }
};

  useEffect(() => {
    if (activeTab === "address") {
      fetchAddresses();
    } else if (activeTab === "bank") { 
      fetchBanks();
    }
  }, [activeTab]);

  const handleAddNew = () => {
  setEditingAddress(null); 
  setIsModalOpen(true);    
};

  const handleEdit = (addr: any) => {
  setEditingAddress(addr); 
  setIsModalOpen(true);    
};

  const handleDelete = async (addressId: number) => {
  if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này không?")) return;

  try {
    await api.delete(`/user/addresses/${addressId}`); 
    
    setAddresses(addresses.filter((item) => item.id !== addressId));
    alert("Xóa địa chỉ thành công!");
  } catch (error) {
    console.error("Error deleting address:", error);
    alert("Không thể xóa địa chỉ, vui lòng thử lại!");
  }
};

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
      return;
    }

    try {
      const response = await api.put("/user/change-password", {
        email: email, 
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });

      setPasswordMessage({ type: "success", text: response.data || "Đổi mật khẩu thành công!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      const errorData = error.response?.data;
      const errorMsg = typeof errorData === "object" && errorData?.message 
        ? errorData.message 
        : (typeof errorData === "string" ? errorData : "Có lỗi xảy ra, vui lòng thử lại!");

      setPasswordMessage({ type: "error", text: errorMsg });
    }
  };

  const tabs = [
    { id: "info" as const, label: "Thông tin cá nhân", icon: User },
    { id: "address" as const, label: "Địa chỉ giao hàng", icon: MapPin },
    { id: "bank" as const, label: "Tài khoản ngân hàng", icon: CreditCard },
    { id: "security" as const, label: "Bảo mật", icon: Lock },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tài khoản của tôi</h1>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-4">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setPasswordMessage({ type: "", text: "" }); // Xóa thông báo cũ khi đổi tab
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeTab === tab.id ? "bg-primary text-white" : "hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeTab === "info" && (
            <Card>
              <h2 className="text-xl font-semibold mb-6">Thông tin cá nhân</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Họ và tên</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"  
                    value={email} readOnly
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ngày sinh</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
                <Button type="submit"><Save className="w-4 h-4 mr-2" /> Lưu thay đổi</Button>
              </form>
            </Card>
          )}

          {activeTab === "address" && (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Địa chỉ giao hàng</h2>
              <Button size="sm" onClick={handleAddNew}>
                Thêm địa chỉ mới
              </Button>
            </div>

            <div className="space-y-4">
              {addresses.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">
                  Bạn chưa có địa chỉ giao hàng nào.
                </p>
              ) : (
                addresses.map((addr) => {
                  const isDefaultAddress = !!(addr.isDefault || (addr as any).default);

                  return (
                    <Card
                      key={addr.id}
                      className={`p-4 ${isDefaultAddress ? "border-2 border-primary" : ""}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{addr.fullName}</span>
                            
                            {isDefaultAddress && (
                              <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            <Phone className="w-4 h-4 inline mr-1" /> {addr.phone}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 inline mr-1" /> {addr.addressDetail}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(addr)}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(addr.id)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>

                      {isModalOpen && (
                        <AddressModal
                          address={
                            editingAddress
                              ? {
                                  id: editingAddress.id,
                                  fullName: editingAddress.fullName,
                                  phone: editingAddress.phone,
                                  addressDetail: editingAddress.addressDetail,
                                  isDefault: !!(editingAddress.isDefault || (editingAddress as any).default),
                                }
                              : null
                          }
                          onClose={() => setIsModalOpen(false)}
                          onSaveSuccess={() => {
                            setIsModalOpen(false);
                            fetchAddresses(); 
                          }}
                        />
                      )}
                    </Card>
                  )}

          {activeTab === "bank" && (
                    <Card>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Tài khoản ngân hàng</h2>
                        <Button size="sm" onClick={handleAddBankNew}>Thêm tài khoản</Button>
                      </div>
                      
                      <div className="space-y-4">
                        {banks.length === 0 ? (
                          <p className="text-center text-muted-foreground py-10">
                            Bạn chưa liên kết tài khoản ngân hàng nào.
                          </p>
                        ) : (
                          banks.map((bank) => {
                            const isDefaultBank = !!(bank.isDefault || (bank as any).default);
                            const maskedAccountNumber = bank.accountNumber 
                              ? `**** **** **** ${bank.accountNumber.slice(-4)}`
                              : "**** **** **** ****";

                            return (
                              <Card 
                                key={bank.id} 
                                className={`p-6 text-white transition-all rounded-2xl ${
                                  isDefaultBank 
                                    ? "bg-gradient-to-br from-orange-500 to-amber-600 border border-orange-400/40 shadow-lg shadow-orange-500/20 scale-[1.01]" 
                                    : "bg-gradient-to-r from-slate-800 to-slate-950 border border-border"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-4">
                                  <CreditCard className={`w-6 h-6 ${isDefaultBank ? "text-white" : "text-orange-500"}`} />
                                  <span className="font-semibold text-lg">{bank.bankName}</span>
                                  
                                  {isDefaultBank && (
                                    <span className="text-xs bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-md font-medium ml-1 backdrop-blur-sm">
                                      Mặc định
                                    </span>
                                  )}

                                  <div className="ml-auto flex gap-2">
                                    <button 
                                      onClick={() => handleBankEdit(bank)}
                                      className={`text-xs px-3 py-1 rounded transition-colors ${
                                        isDefaultBank 
                                          ? "bg-white/10 hover:bg-white/20 border border-white/20 text-white" 
                                          : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                                      }`}
                                    >
                                      Sửa
                                    </button>
                                    <button 
                                      onClick={() => handleBankDelete(bank.id)}
                                      className={`text-xs px-3 py-1 rounded transition-colors ${
                                        isDefaultBank 
                                          ? "bg-black/10 hover:bg-black/20 border border-black/10 text-orange-100" 
                                          : "bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300"
                                      }`}
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                </div>

                                <div className="text-2xl tracking-wider mb-4 font-mono text-white">
                                  {maskedAccountNumber}
                                </div>

                                <div className="flex justify-between text-white/90">
                                  <div>
                                    <div className="text-xs opacity-75">Chủ tài khoản</div>
                                    <div className="font-semibold uppercase">{bank.accountHolderName}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs opacity-75">Chi nhánh</div>
                                    <div className="font-semibold">{bank.branch || "N/A"}</div>
                                  </div>
                                </div>
                              </Card>
                            );
                          })
                        )}
                      </div>

                      {isBankModalOpen && (
                        <BankModal
                          bank={
                            editingBank ? {
                              id: editingBank.id,
                              bankName: editingBank.bankName,
                              accountNumber: editingBank.accountNumber,
                              accountHolderName: editingBank.accountHolderName,
                              branch: editingBank.branch,
                              isDefault: !!(editingBank.isDefault || (editingBank as any).default),
                            } : null
                          }
                          onClose={() => setIsBankModalOpen(false)}
                          onSaveSuccess={() => {
                            setIsBankModalOpen(false);
                            fetchBanks();
                          }}
                        />
                      )}
                    </Card>
                  )}

          {activeTab === "security" && (
            <Card>
              <h2 className="text-xl font-semibold mb-6">Bảo mật tài khoản</h2>
              
              {passwordMessage.text && (
                <div className={`p-4 mb-4 rounded-xl text-sm ${
                  passwordMessage.type === "success" 
                    ? "bg-green-100 text-green-800 border border-green-200" 
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}>
                  {passwordMessage.text}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mật khẩu mới</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <Button type="submit" className="w-full md:w-auto">
                  <Lock className="w-4 h-4 mr-2" />
                  Đổi mật khẩu
                </Button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}