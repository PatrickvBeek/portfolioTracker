import { bemHelper } from "../../utility/bemHelper";
import { Props } from "../../utility/types";

const { bemBlock } = bemHelper("dashboard");

export type DashboardProps = Props<{}>;

function Dashboard({ className }: DashboardProps) {
  return (
    <div className={bemBlock(className)}>
      <h1>Dashboard</h1>
    </div>
  );
}

export default Dashboard;
