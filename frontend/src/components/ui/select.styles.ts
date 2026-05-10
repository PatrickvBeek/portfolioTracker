import { cva } from "class-variance-authority";

export const selectVariants = cva(
  "w-full px-3 py-2.5 pr-8 rounded-md text-sm border text-text focus:outline-none transition-colors duration-150 appearance-none bg-bg-input bg-[length:16px] bg-[right_8px_center] bg-no-repeat bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%236b7394%22%20d%3D%22M4.47%205.97a.75.75%200%200%201%201.06%200L8%208.44l2.47-2.47a.75.75%200%200%201%201.06%201.06l-3%203a.75.75%200%200%201-1.06%200l-3-3a.75.75%200%200%201%200-1.06%22%2F%3E%3C%2Fsvg%3E')]",
  {
    variants: {
      state: {
        default:
          "border-border focus:border-border-focus focus:ring-1 focus:ring-border-focus",
        error:
          "border-danger focus:border-danger focus:ring-1 focus:ring-danger",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);
