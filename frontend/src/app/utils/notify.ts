import { toast } from "sonner";

function messageText(message: unknown, fallback: string) {
  if (typeof message === "string" && message.trim()) return message;

  if (message && typeof message === "object" && "message" in message) {
    const nestedMessage = (message as { message?: unknown }).message;
    if (typeof nestedMessage === "string" && nestedMessage.trim()) return nestedMessage;
  }

  return fallback;
}

export const notify = {
  success(message: unknown, fallback = "Thao tác thành công.") {
    toast.success(messageText(message, fallback));
  },
  error(message: unknown, fallback = "Có lỗi xảy ra, vui lòng thử lại.") {
    toast.error(messageText(message, fallback));
  },
  warning(message: unknown, fallback = "Vui lòng kiểm tra lại thông tin.") {
    toast.warning(messageText(message, fallback));
  },
  info(message: unknown, fallback = "Đã cập nhật thông tin.") {
    toast.info(messageText(message, fallback));
  },
};

interface ConfirmOptions {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function confirmAction(message: string, options: ConfirmOptions = {}) {
  return new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (result: boolean) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    toast.warning(options.title ?? "Xác nhận thao tác", {
      description: message,
      duration: Infinity,
      action: {
        label: options.confirmLabel ?? "Xác nhận",
        onClick: () => finish(true),
      },
      cancel: {
        label: options.cancelLabel ?? "Hủy",
        onClick: () => finish(false),
      },
      onDismiss: () => finish(false),
    });
  });
}
