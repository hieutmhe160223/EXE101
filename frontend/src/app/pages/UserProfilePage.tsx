import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { User, Phone, Mail, MapPin, CreditCard, Lock, Save } from "lucide-react";
import { useState } from "react";

export function UserProfilePage() {
  const [activeTab, setActiveTab] = useState<"info" | "address" | "bank" | "security">("info");

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
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeTab === tab.id
                        ? "bg-primary text-white"
                        : "hover:bg-muted"
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
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Họ và tên</label>
                    <input
                      type="text"
                      defaultValue="Nguyễn Văn A"
                      className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      defaultValue="0912345678"
                      className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="nguyenvana@example.com"
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ngày sinh</label>
                  <input
                    type="date"
                    defaultValue="1990-01-01"
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <Button type="submit" className="w-full md:w-auto">
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </form>
            </Card>
          )}

          {activeTab === "address" && (
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Địa chỉ giao hàng</h2>
                <Button size="sm">Thêm địa chỉ mới</Button>
              </div>

              <div className="space-y-4">
                <Card className="border-2 border-primary">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">Nguyễn Văn A</span>
                        <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                          Mặc định
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <Phone className="w-4 h-4 inline mr-1" />
                        0912345678
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Sửa</Button>
                      <Button variant="ghost" size="sm">Xóa</Button>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold mb-2">Nguyễn Văn A</div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <Phone className="w-4 h-4 inline mr-1" />
                        0987654321
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        456 Đường DEF, Phường UVW, Quận 2, TP. Hà Nội
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Sửa</Button>
                      <Button variant="ghost" size="sm">Xóa</Button>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          )}

          {activeTab === "bank" && (
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Tài khoản ngân hàng</h2>
                <Button size="sm">Thêm tài khoản</Button>
              </div>

              <div className="space-y-4">
                <Card className="bg-gradient-to-r from-primary to-orange-600 text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-6 h-6" />
                    <span className="font-semibold">Vietcombank</span>
                    <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded">
                      Mặc định
                    </span>
                  </div>
                  <div className="text-2xl tracking-wider mb-4">
                    **** **** **** 1234
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <div className="text-xs opacity-75">Chủ tài khoản</div>
                      <div className="font-semibold">NGUYEN VAN A</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-75">Chi nhánh</div>
                      <div className="font-semibold">Hà Nội</div>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <h2 className="text-xl font-semibold mb-6">Bảo mật tài khoản</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mật khẩu mới</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <Button type="submit" className="w-full md:w-auto">
                  <Lock className="w-4 h-4 mr-2" />
                  Đổi mật khẩu
                </Button>
              </form>

              <div className="mt-8 pt-8 border-t">
                <h3 className="font-semibold mb-4">Xác thực hai yếu tố</h3>
                <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                  <div>
                    <div className="font-medium">Xác thực qua SMS</div>
                    <div className="text-sm text-muted-foreground">
                      Nhận mã OTP qua số điện thoại
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Bật</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
