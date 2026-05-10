import { FC, PropsWithChildren, ReactNode } from "react";
import { cn } from "../../utility/cn";
import { styles, tileVariants } from "../ui/tile.styles";

const Tile: FC<
  PropsWithChildren<{
    header?: ReactNode;
    className?: string;
  }>
> = ({ header, children, className }) => {
  return (
    <div className={cn(tileVariants(), className)}>
      {header && (
        <div className={cn(styles.headerElement, styles.element)}>{header}</div>
      )}
      <div className={styles.element}>{children}</div>
    </div>
  );
};

export default Tile;
