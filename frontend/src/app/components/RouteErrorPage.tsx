import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router";

export function RouteErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.statusText || String(error.data?.message || "Không thể mở trang này.")
    : error instanceof Error
      ? error.message
      : "Đã có lỗi không mong muốn xảy ra.";

  return <main className="grid min-h-screen place-items-center bg-muted p-6">
    <div className="w-full max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
      <AlertTriangle className="mx-auto h-12 w-12 text-orange-500" />
      <h1 className="mt-4 text-2xl font-bold">Trang vừa gặp sự cố</h1>
      <p className="mt-2 text-muted-foreground">{message}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-white">
          <RefreshCw className="h-4 w-4" /> Tải lại trang
        </button>
        <Link to="/" className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 font-medium">
          <Home className="h-4 w-4" /> Về trang chủ
        </Link>
      </div>
    </div>
  </main>;
}
