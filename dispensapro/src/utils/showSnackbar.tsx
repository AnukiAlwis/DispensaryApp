import { showSnackbar as showMuiSnackbar } from "../components/GlobalSnackbar";

export function showSnackbar(message: string, options?: { severity?: "success" | "error" | "warning" | "info"; duration?: number }) {
  showMuiSnackbar(message, options);
}
