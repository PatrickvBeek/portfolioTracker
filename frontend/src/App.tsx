import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactElement, StrictMode, useState } from "react";
import { Assets } from "./components/Assets/Assets";
import Dashboard from "./components/Dashboard/Dashboard";
import { Header } from "./components/header/Header";
import Portfolios from "./components/Portfolios/Portfolios";
import { queryClientConfig } from "./queryClient/config";
import { ThemeProvider } from "./theme/ThemeContext";
import { UserDataProvider } from "./userDataContext";

const queryClient = new QueryClient(queryClientConfig);

function App() {
  const TABS = ["Dashboard", "Portfolios", "Assets"];
  const [selectedTab, setSelectedTab] = useState(TABS[0]);

  const TabToRender: Record<string, () => ReactElement> = {
    Dashboard: Dashboard,
    Portfolios: Portfolios,
    Assets: Assets,
  };

  const Content = TabToRender[selectedTab];

  return (
    <StrictMode>
      <ThemeProvider>
        <UserDataProvider>
          <QueryClientProvider client={queryClient}>
            <Header
              tabs={TABS}
              selectedTab={selectedTab}
              onSelect={setSelectedTab}
            />
            <main className="w-full px-4 md:px-6 py-6 md:py-8">
              <Content />
            </main>
          </QueryClientProvider>
        </UserDataProvider>
      </ThemeProvider>
    </StrictMode>
  );
}

export default App;
