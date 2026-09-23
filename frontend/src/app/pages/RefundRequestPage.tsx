import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { AlertCircle, Upload } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../utils/api";

function getCustomerId() {
  return Number(localStorage.getItem("userId") || "2");
}

export function RefundRequestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;

    try {
      setSubmitting(true);
      await api.post(`/orders/${id}/return-requests`, {
        customerId: getCustomerId(),
        reason: `${reason}${description ? ` - ${description}` : ""}`,
        evidenceUrl: evidenceUrl || null,
      });
      navigate(`/orders/${id}`);
    } catch (err: any) {
      console.error("Cannot create return request", err);
      alert(err.response?.data?.message || err.response?.data || "Khong the gui yeu cau doi/tra.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Yeu cau doi/tra hang</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Ly do</label>
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Chon ly do...</option>
              <option value="Sai san pham">Sai san pham</option>
              <option value="Hang bi hu hong">Hang bi hu hong</option>
              <option value="Hang gia, hang nhai">Hang gia, hang nhai</option>
              <option value="Khong dung mo ta">Khong dung mo ta</option>
              <option value="Ly do khac">Ly do khac</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mo ta chi tiet</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={6}
              placeholder="Mo ta chi tiet van de cua ban..."
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Link anh / video minh chung</label>
            <div className="relative">
              <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="url"
                value={evidenceUrl}
                onChange={(event) => setEvidenceUrl(event.target.value)}
                placeholder="https://..."
                className="w-full pl-10 pr-4 py-3 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Luu y</p>
                <p className="text-xs">Yeu cau doi/tra se duoc ghi nhan va xu ly boi bo phan ho tro.</p>
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Dang gui..." : "Gui yeu cau"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
