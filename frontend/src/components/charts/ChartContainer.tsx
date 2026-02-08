import { FC, ReactElement } from "react";
import { ResponsiveContainer } from "recharts";
import { LoadingIndicator } from "../general/LoadingIndicator/LoadingIndicator";
import style from "./ChartContainer.module.less";

export const ChartContainer: FC<{
  isLoading: boolean;
  children: ReactElement;
}> = ({ isLoading, children }) => (
  <div className={style.container}>
    {isLoading && (
      <div className={style.overlay}>
        <LoadingIndicator />
      </div>
    )}
    <ResponsiveContainer width={"100%"}>{children}</ResponsiveContainer>
  </div>
);
