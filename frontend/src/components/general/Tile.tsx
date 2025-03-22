import classNames from "classnames";
import { FC, PropsWithChildren, ReactNode } from "react";
import styles from "./Tile.module.less";

const Tile: FC<
  PropsWithChildren<{
    header?: ReactNode;
    className?: string;
  }>
> = ({ header, children, className }) => {
  return (
    <div className={classNames(styles.tile, className)}>
      {header && (
        <div className={classNames(styles.header_element, styles.element)}>
          {header}
        </div>
      )}
      <div className={styles.element}>{children}</div>
    </div>
  );
};

export default Tile;
