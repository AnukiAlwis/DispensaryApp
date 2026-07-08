import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#0D47A1",
      light: "#E8F0FE",
      dark: "#0C3C78",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#1976d2",
    },
    background: {
      default: "#F5F7FA",
      paper: "#ffffff",
    },
    text: {
      primary: "#1E293B",
      secondary: "#64748B",
    },
    success: {
      main: "#16A34A",
      light: "#DCFCE7",
      contrastText: "#166534",
    },
    warning: {
      main: "#F59E0B",
      light: "#FEF3C7",
      contrastText: "#92400E",
    },
    error: {
      main: "#DC2626",
      light: "#FEE2E2",
      contrastText: "#991B1B",
    },
    info: {
      main: "#2563EB",
      light: "#DBEAFE",
      contrastText: "#1E40AF",
    },
    divider: "#E5E9F0",
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
    h5: { fontWeight: 700, color: "#1E293B" },
    h6: { fontWeight: 600, color: "#1E293B" },
    subtitle1: { color: "#64748B" },
    subtitle2: { fontWeight: 600, color: "#475569" },
    body2: { color: "#64748B" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 600,
          px: 2.5,
          py: 1,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            backgroundColor: "#ffffff",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
          border: "1px solid #E5E9F0",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: "#475569",
          backgroundColor: "#F8FAFC",
          borderBottom: "1px solid #E5E9F0",
          fontSize: "0.75rem",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        },
        body: {
          borderBottom: "1px solid #F1F5F9",
          color: "#334155",
          fontSize: "0.875rem",
          py: 1.5,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#F8FAFC",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: "0.75rem",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        },
      },
    },
  },
});
