import {
  createContext,
  useContext,
  FC,
  PropsWithChildren,
  useState,
  useEffect,
  useCallback,
  useSyncExternalStore,
} from "react";

type Theme = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const DARK_MODE_QUERY = "(prefers-color-scheme: dark)";

const subscribeToSystemTheme = (onChange: () => void): (() => void) => {
  const mediaQuery = window.matchMedia(DARK_MODE_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
};

const getSystemPrefersDark = (): boolean =>
  window.matchMedia(DARK_MODE_QUERY).matches;

function applyThemeClass(resolved: ResolvedTheme): void {
  if (resolved === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

function readThemeFromLocalStorage(): Theme {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark" || saved === "system") {
    return saved;
  }
  return "system";
}

export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(readThemeFromLocalStorage);
  const systemPrefersDark = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemPrefersDark
  );
  const resolvedTheme: ResolvedTheme =
    theme === "system" ? (systemPrefersDark ? "dark" : "light") : theme;

  const setTheme = useCallback((nextTheme: Theme) => {
    localStorage.setItem("theme", nextTheme);
    setThemeState(nextTheme);
  }, []);

  useEffect(() => {
    applyThemeClass(resolvedTheme);
  }, [resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
