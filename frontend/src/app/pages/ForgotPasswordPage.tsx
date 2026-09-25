import { Link } from "react-router";
import { Card } from "../components/Card";
export function ForgotPasswordPage(){return <div className="max-w-xl mx-auto p-8"><Card><h1 className="text-2xl font-bold mb-4">Khôi phục mật khẩu</h1><p>Dịch vụ gửi email khôi phục chưa được cấu hình. Vui lòng liên hệ bộ phận hỗ trợ của hệ thống.</p><Link to="/login" className="block text-primary mt-4">Quay lại đăng nhập</Link></Card></div>;}
