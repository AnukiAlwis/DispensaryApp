import { toast } from "react-hot-toast";

export function showSnackbar(message: string, options?: { duration?: number }) {
  toast(message, {
    duration: options?.duration ?? 4000,
    position: "top-right",
  });
}
