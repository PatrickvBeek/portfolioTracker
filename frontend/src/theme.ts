import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  spacing: (factor: number) => `${factor}rem`, // Custom spacing scale
  palette: {
    primary: {
      main: "rgb(65, 138, 216)", // Matching @theme from definitions.less
      contrastText: "#fff",
    },
    secondary: {
      main: "rgb(217, 161, 65)", // Matching @theme-complement from definitions.less
      contrastText: "#fff",
    },
  },
  components: {
    MuiChip: {
      styleOverrides: {
        root: {},
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
