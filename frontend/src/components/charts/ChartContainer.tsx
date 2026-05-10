import { FC, ReactElement } from "react";
import { ResponsiveContainer } from "recharts";
import { LoadingIndicator } from "../general/LoadingIndicator/LoadingIndicator";
import { styles } from "./ChartContainer.styles";
import "./ChartContainer.css";

export const ChartContainer: FC<{
  isLoading: boolean;
  children: ReactElement;
}> = ({ isLoading, children }) => (
  <div className={`chartContainer ${styles.container}`}>
    {isLoading && (
      <div className={styles.overlay}>
        <LoadingIndicator />
      </div>
    )}
    <ResponsiveContainer width={"100%"}>{children}</ResponsiveContainer>
  </div>
);
