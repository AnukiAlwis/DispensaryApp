import React, { useState, useCallback } from "react";
import { Snackbar, Alert } from "@mui/material";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

let snackbarState: SnackbarState = {
  open: false,
  message: "",
  severity: "info",
};

let listeners: ((state: SnackbarState) => void)[] = [];

const notifyListeners = () => {
  listeners.forEach((listener) => listener({ ...snackbarState }));
};

export const showSnackbar = (
  message: string,
  options?: { severity?: "success" | "error" | "warning" | "info"; duration?: number }
) => {
  snackbarState = {
    open: true,
    message,
    severity: options?.severity || "info",
  };
  notifyListeners();

  if (options?.duration !== 0) {
    setTimeout(() => {
      snackbarState.open = false;
      notifyListeners();
    }, options?.duration || 4000);
  }
};

export default function GlobalSnackbar() {
  const [state, setState] = useState<SnackbarState>(snackbarState);

  const subscribe = useCallback(() => {
    listeners.push(setState);
    return () => {
      listeners = listeners.filter((listener) => listener !== setState);
    };
  }, []);

  React.useEffect(subscribe, [subscribe]);

  const handleClose = () => {
    snackbarState.open = false;
    notifyListeners();
  };

  return (
    <Snackbar
      open={state.open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={handleClose}
        severity={state.severity}
        sx={{
          width: "100%",
          ...(state.severity === "error" && {
            backgroundColor: "#d32f2f",
            color: "white",
            "& .MuiAlert-icon": {
              color: "white",
            },
          }),
        }}
      >
        {state.message}
      </Alert>
    </Snackbar>
  );
}
