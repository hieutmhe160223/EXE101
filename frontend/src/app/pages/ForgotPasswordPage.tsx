import { Link, useNavigate } from "react-router";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ShoppingCart, Mail, Lock, ArrowLeft } from "lucide-react";
import { useState } from "react";
import api from "../utils/api"; 

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (step === "email") {
        await api.post("/auth/forgot-password", { 
          email: formData.email 
        });
        setMessage("Mã OTP đã được gửi về hòm thư của bạn.");
        setStep("otp");
      } else if (step === "otp") {
        await api.post("/auth/verify-otp", {
          email: formData.email,
          otp: formData.otp,
        });
        setMessage("Xác thực OTP thành công. Vui lòng nhập mật khẩu mới.");
        setStep("password");
      } else {
        if (formData.newPassword !== formData.confirmPassword) {
          setError("Mật khẩu xác nhận không trùng khớp!");
          setLoading(false);
          return;
        }

        await api.post("/auth/reset-password", {
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword,
        });

        alert("Đổi mật khẩu thành công! Bạn sẽ được chuyển hướng về trang đăng nhập.");
        navigate("/login");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data || "Đã xảy ra lỗi hệ thống. Vui lòng thử lại!";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setMessage(null);
    try {
      await api.post("/auth/forgot-password", { email: formData.email });
      setMessage("Một mã OTP mới đã được gửi lại vào email của bạn.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể gửi lại mã OTP.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Quên mật khẩu</h1>
          <p className="text-muted-foreground">
            {step === "email" && "Nhập email để nhận mã xác thực"}
            {step === "otp" && "Nhập mã OTP đã gửi đến email"}
            {step === "password" && "Tạo mật khẩu mới"}
          </p>
        </div>

        <Card>
          {/* Hiển thị Alert báo lỗi hệ thống */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Hiển thị Alert thông báo thành công */}
          {message && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 text-sm rounded-xl border border-green-200">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === "email" && (
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {step === "otp" && (
              <div>
                <label className="block text-sm font-medium mb-2">Mã OTP</label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) =>
                    setFormData({ ...formData, otp: e.target.value })
                  }
                  placeholder="123456"
                  className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Chưa nhận được mã?{" "}
                  <button 
                    type="button" 
                    onClick={handleResendOtp}
                    className="text-primary hover:underline font-medium"
                    disabled={loading}
                  >
                    Gửi lại
                  </button>
                </p>
              </div>
            )}

            {step === "password" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Mật khẩu mới</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, newPassword: e.target.value })
                      }
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Đang xử lý..." : (
                <>
                  {step === "email" && "Gửi mã OTP"}
                  {step === "otp" && "Xác thực"}
                  {step === "password" && "Đặt lại mật khẩu"}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}