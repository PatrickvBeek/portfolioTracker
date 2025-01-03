import { ReactElement, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import "./App.less";
import Assets from "./components/Assets/Assets";
import Dashboard from "./components/Dashboard/Dashboard";
import { Header } from "./components/header/Header";
import Portfolios from "./components/Portfolios/Portfolios";
import { queryClientConfig } from "./queryClient/config";
import { bemHelper } from "./utility/bemHelper";
import { GeneralComponentProps } from "./utility/types";

const { bemBlock, bemElement } = bemHelper("app");

const queryClient = new QueryClient(queryClientConfig);

function App() {
  const TABS = ["Dashboard", "Portfolios", "Assets"];
  const [selectedTab, setSelectedTab] = useState(TABS[0]);

  const componentByTabName: Record<
    string,
    ({ className }: GeneralComponentProps) => ReactElement
  > = {
    Dashboard: Dashboard,
    Portfolios: Portfolios,
    Assets: Assets,
  };

  const TabToRender = componentByTabName[selectedTab];

  return (
    <div className={bemBlock("")}>
      <QueryClientProvider client={queryClient}>
        <Header
          tabs={TABS}
          selectedTab={selectedTab}
          onSelect={setSelectedTab}
        />
        <TabToRender className={bemElement("tab-content")} />
      </QueryClientProvider>
    </div>
  );
}

export default App;
