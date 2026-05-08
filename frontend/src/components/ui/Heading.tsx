import { ComponentPropsWithRef, createElement, forwardRef } from "react";
import { cn } from "../../utility/cn";
import { headingVariants } from "./heading.styles";

type HeadingLevel = "h1" | "h2" | "section";

type HeadingProps = ComponentPropsWithRef<"h1"> & {
  level?: HeadingLevel;
};

const headingElementMap: Record<HeadingLevel, string> = {
  h1: "h1",
  h2: "h2",
  section: "h2",
};

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = "h1", className, children, ...props }, ref) => {
    return createElement(
      headingElementMap[level],
      { ...props, ref, className: cn(headingVariants({ level }), className) },
      children
    );
  }
);
