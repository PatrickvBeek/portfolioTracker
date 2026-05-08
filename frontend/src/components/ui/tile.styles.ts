import { cva } from "class-variance-authority";

export const tileVariants = cva(
  "bg-bg-card w-fit rounded-md shadow-sm border border-border"
);

export const styles = {
  element: "p-4",
  headerElement: "bg-accent text-white text-base font-bold rounded-t-md p-4",
} as const;
