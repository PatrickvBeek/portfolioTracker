import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "../../utility/cn";
import { themeButtonVariants, styles } from "./ThemeToggle.styles";

interface ThemeToggleProps {
  theme: "system" | "light" | "dark";
  onThemeChange: (theme: "system" | "light" | "dark") => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onThemeChange,
}) => {
  return (
    <div className={styles.container} role="group" aria-label="Theme selection">
      <button
        type="button"
        aria-label="System theme"
        aria-pressed={theme === "system"}
        title="System theme"
        onClick={() => onThemeChange("system")}
        className={cn(themeButtonVariants({ selected: theme === "system" }))}
      >
        <Monitor size={16} />
      </button>
      <button
        type="button"
        aria-label="Light theme"
        aria-pressed={theme === "light"}
        title="Light theme"
        onClick={() => onThemeChange("light")}
        className={cn(themeButtonVariants({ selected: theme === "light" }))}
      >
        <Sun size={16} />
      </button>
      <button
        type="button"
        aria-label="Dark theme"
        aria-pressed={theme === "dark"}
        title="Dark theme"
        onClick={() => onThemeChange("dark")}
        className={cn(themeButtonVariants({ selected: theme === "dark" }))}
      >
        <Moon size={16} />
      </button>
    </div>
  );
};
