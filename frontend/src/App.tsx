import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactElement, StrictMode, useState } from "react";
import "./App.less";
import Assets from "./components/Assets/Assets";
import Dashboard from "./components/Dashboard/Dashboard";
import { Header } from "./components/header/Header";
import Portfolios from "./components/Portfolios/Portfolios";
import { queryClientConfig } from "./queryClient/config";
import { UserDataProvider } from "./userDataContext";
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
      <StrictMode>
        <UserDataProvider>
          <QueryClientProvider client={queryClient}>
            <Header
              tabs={TABS}
              selectedTab={selectedTab}
              onSelect={setSelectedTab}
            />
            <TabToRender className={bemElement("tab-content")} />
          </QueryClientProvider>
        </UserDataProvider>
      </StrictMode>
    </div>
  );
}

export default App;
