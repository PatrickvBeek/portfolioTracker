import classNames from "classnames";
import { FC } from "react";
import styles from "./Headline.module.less";

export const Headline: FC<{ text: string; className?: string }> = ({
  text,
  className,
}) => <div className={classNames(styles.headline, className)}>{text}</div>;
