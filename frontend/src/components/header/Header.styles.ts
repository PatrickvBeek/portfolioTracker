import { cva } from "class-variance-authority";

const headerVariants = cva(
  "sticky top-0 z-50 bg-bg-card border-b border-border",
  {
    variants: {},
    defaultVariants: {},
  }
);

export const styles = {
  header: headerVariants,
  content:
    "flex items-center justify-between px-4 md:px-6 py-3 max-w-7xl mx-auto",
  logo: "text-lg font-bold text-text",
  desktopNav: "hidden md:flex",
  mobileMenuButton:
    "md:hidden inline-flex items-center justify-center p-2 text-text-muted hover:text-text hover:bg-bg-elevated rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus",
  actionStack: "hidden md:flex items-center gap-2",
} as const;
