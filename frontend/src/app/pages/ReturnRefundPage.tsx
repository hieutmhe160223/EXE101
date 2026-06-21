import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { AlertCircle, Upload } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';

export const ReturnRefundPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [reason, setReason] = React.useState('');
  const [description, setDescription] = React.useState('');

  const reasons = [
    'Sản phẩm không đúng mô tả',
    'Sản phẩm bị lỗi/hỏng',
    'Sản phẩm thiếu phụ kiện',
    'Không còn muốn mua',
    'Lý do khác',
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Yêu cầu hoàn trả/hoàn tiền</h1>
        <p className="text-gray-600 mb-8">Mã đơn hàng: {id}</p>

        <Card className="p-6 mb-6">
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg mb-6">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Lưu ý quan trọng:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Vui lòng cung cấp đầy đủ thông tin và bằng chứng</li>
                <li>Yêu cầu sẽ được xử lý trong vòng 24-48 giờ</li>
                <li>Sản phẩm phải còn nguyên vẹn và chưa qua sử dụng</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do hoàn trả *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 outline-none"
              >
                <option value="">Chọn lý do...</option>
                {reasons.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả chi tiết *
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 outline-none"
                rows={6}
                placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tải lên bằng chứng (ảnh/video)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#FF6A00] transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Nhấn để tải lên ảnh hoặc video</p>
                <p className="text-xs text-gray-500">PNG, JPG, MP4 tối đa 10MB</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
            Hủy
          </Button>
          <Button className="flex-1">
            Gửi yêu cầu
          </Button>
        </div>
      </div>
    </div>
  );
};
