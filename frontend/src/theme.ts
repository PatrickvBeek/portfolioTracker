import { createTheme } from "@mui/material/styles";

const theme = createTheme({
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
  },
});

export default theme;
