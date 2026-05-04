import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    custom: {
      doubleBorder: object;
    };
  }
  // allow `theme.custom` in `createTheme`
  interface ThemeOptions {
    custom?: {
      doubleBorder?: object;
    };
  }
}

export const theme = createTheme({
  palette: {
    primary: {
      main: "#0D47A1",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#1976d2",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
          },
        },
      },
    },
  },
  typography: {
    fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
  },

  // custom reusable styles
  custom: {
    doubleBorder: {
      border: "6px double #c4d8f9ff",
      borderRadius: 2,
      padding: "0px",
    },
  },
});
