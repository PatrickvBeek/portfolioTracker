import { createTheme } from "@mui/material/styles";

const colors = {
  primary: "rgb(65, 138, 216)", // Matching @theme from definitions.less
  primaryHighlight: "rgb(0, 101, 209)",
  primaryTint: "rgb(198, 219, 243)", // Matching @theme-tint from definitions.less
  primaryHover: "rgb(0, 91, 188)",
  secondary: "rgb(217, 161, 65)", // Matching @theme-complement from definitions.less
  white: "white",
  contrastText: "#fff",
} as const;

const createRgba = (rgbColor: string, alpha: number): string => {
  const rgbValues = rgbColor.match(/\d+/g);
  if (!rgbValues) return rgbColor;
  return `rgba(${rgbValues.join(", ")}, ${alpha})`;
};

const theme = createTheme({
  spacing: (factor: number) => `${factor}rem`,
  palette: {
    primary: {
      main: colors.primary,
      contrastText: colors.contrastText,
    },
    secondary: {
      main: colors.secondary,
      contrastText: colors.contrastText,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
          borderRadius: "4px",
          padding: "1rem",
          fontWeight: 800,
          textTransform: "none",
          minWidth: "auto",
          lineHeight: "unset",
        },
        containedPrimary: {
          backgroundColor: colors.primaryHighlight,
          color: colors.white,
          border: "none",
          "&:hover": {
            backgroundColor: colors.primaryHover,
          },
          "&:disabled": {
            backgroundColor: colors.primary,
            opacity: 0.4,
            color: colors.white,
          },
        },
        outlinedPrimary: {
          backgroundColor: colors.white,
          border: `2px solid ${colors.primaryHighlight}`,
          color: colors.primaryHighlight,
          "&:hover": {
            backgroundColor: createRgba(colors.primaryHighlight, 0.05),
            border: `2px solid ${colors.primaryHighlight}`,
          },
          "&:disabled": {
            backgroundColor: colors.white,
            border: `2px solid ${colors.primaryTint}`,
            color: colors.primaryTint,
          },
        },
      },
    },
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
