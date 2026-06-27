import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Copy, Share2, Users, Gift, LogIn } from "lucide-react";

interface ReferralData {
  referralCode: string;
  totalInvited: number;
  successfulRegistrations: number;
  totalReward: number;
}

export function ReferralPage() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState<ReferralData | null>(null);
  
  const isLoggedIn = userData !== null;

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        setUserData(null); 
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu giới thiệu:", error);
      }
    };

    fetchReferralData();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert("Đã sao chép mã giới thiệu thành công!");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Chương trình giới thiệu</h1>

      {isLoggedIn ? (
        /* da dang nhap*/
        <>
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 mb-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Giới thiệu bạn bè - Nhận thưởng hấp dẫn!</h2>
              <p className="text-muted-foreground mb-6">
                Nhận 50,000₫ cho mỗi bạn bè đăng ký thành công
              </p>
              <div className="bg-white rounded-xl p-6 mb-4 max-w-md mx-auto shadow-sm">
                <div className="text-sm text-muted-foreground mb-2">Mã giới thiệu của bạn</div>
                {/* Đổ dữ liệu động */}
                <div className="text-3xl font-bold text-primary mb-4">{userData.referralCode}</div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => handleCopyCode(userData.referralCode)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Sao chép mã
                  </Button>
                  <Button variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Chia sẻ
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Hàng chứa 3 ô Thống kê số liệu */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card className="text-center p-6">
              <Users className="w-12 h-12 mx-auto mb-3 text-primary" />
              <div className="text-2xl font-bold mb-1">{userData.totalInvited}</div>
              <div className="text-sm text-muted-foreground">Bạn bè đã mời</div>
            </Card>
            <Card className="text-center p-6">
              <Gift className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
              <div className="text-2xl font-bold mb-1">{userData.successfulRegistrations}</div>
              <div className="text-sm text-muted-foreground">Đã đăng ký thành công</div>
            </Card>
            <Card className="text-center p-6 flex flex-col justify-center items-center">
              <div className="text-3xl font-bold mb-1 text-primary">
                {userData.totalReward.toLocaleString()}₫
              </div>
              <div className="text-sm text-muted-foreground mt-2">Tổng thưởng đã nhận</div>
            </Card>
          </div>
        </>
      ) : (
        /* chua dang nhap */
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 mb-6 p-8 text-center">
          <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <Gift className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Giới thiệu bạn bè - Nhận thưởng hấp dẫn!</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6 text-sm">
            Nhận ngay <span className="font-semibold text-primary">50,000₫</span> vào tài khoản cho mỗi lượt giới thiệu thành công. Đăng nhập ngay để kích hoạt mã giới thiệu của riêng bạn.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => navigate("/login")} className="px-6 flex items-center justify-center gap-2">
              <LogIn className="w-4 h-4 mr-2" /> Đăng nhập
            </Button>
            <Button variant="outline" onClick={() => navigate("/register")} className="bg-white">
              Đăng ký tài khoản
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Cách thức hoạt động</h2>
        <div className="space-y-6">
          {[
            { step: 1, title: "Chia sẻ mã giới thiệu", desc: "Gửi mã cá nhân của bạn cho bạn bè hoặc người quen." },
            { step: 2, title: "Bạn bè đăng ký tài khoản", desc: "Người được giới thiệu tiến hành đăng ký và điền mã của bạn tại biểu mẫu." },
            { step: 3, title: "Cùng nhận thưởng", desc: "Tiền thưởng tự động cộng vào số dư ví của bạn ngay khi hệ thống xác nhận tài khoản hợp lệ." },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                {item.step}
              </div>
              <div>
                <div className="font-semibold text-gray-800">{item.title}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}