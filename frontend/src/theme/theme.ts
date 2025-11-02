import { createTheme } from "@mui/material/styles";

const colors = {
  primary: "rgb(65, 138, 216)", // Matching @theme from definitions.less
  contrastText: "#fff",
} as const;

const theme = createTheme({
  spacing: (factor: number) => `${factor}rem`,
  breakpoints: {
    values: {
      xs: 0,
      sm: 768,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  palette: {
    primary: {
      main: colors.primary,
      contrastText: colors.contrastText,
    },
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          padding: "1rem",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: "0",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "0",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "0",
          paddingTop: "2rem",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          alignItems: "flex-end",
          display: "flex",
          minHeight: "2rem",
        },
        indicator: {
          height: "2px",
          backgroundColor: "var(--theme-highlight)",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          padding: "0.5rem 1rem",
          fontSize: "var(--font-base)",
          minHeight: "1rem",
          cursor: "pointer",
          color: "#555",
          textTransform: "none", // Disable uppercase transformation
          "&.Mui-selected": {
            fontWeight: "bold",
            color: "var(--theme-highlight)",
          },
        },
      },
    },
  },
});

export default theme;
