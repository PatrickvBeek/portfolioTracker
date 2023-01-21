import { ReactElement } from "react";
import { bemHelper } from "../../../utility/bemHelper";
import "./FormRowFlex.css";

const { bemBlock, bemElement } = bemHelper("form-row-flex");

export interface FormRowFlexProps {
  children: ReactElement[];
  className?: string;
}

export function FormRowFlex({
  children,
  className,
}: FormRowFlexProps): ReactElement | null {
  return (
    <div className={bemBlock(className)}>
      {children.map((child, i) => (
        <div key={i} className={bemElement("item")}>
          {child}
        </div>
      ))}
    </div>
  );
}
