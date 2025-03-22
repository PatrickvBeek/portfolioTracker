import { FC } from "react";
import styles from "./Headline.module.less";

export const Headline: FC<{ text: string }> = ({ text }) => (
  <div className={styles.headline}>{text}</div>
);
