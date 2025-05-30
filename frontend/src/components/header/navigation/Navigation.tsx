import { Tab, Tabs } from "@mui/material";
import { FC } from "react";

export const Navigation: FC<{
  tabs: string[];
  selectedTab: string;
  onSelect: (s: string) => void;
}> = ({ tabs, selectedTab, onSelect }) => {
  return (
    <div role={"navigation"}>
      <Tabs
        value={selectedTab}
        onChange={(_, tab) => onSelect(tab)}
        textColor="primary"
        sx={{
          "& .MuiTabs-indicator": {
            display: "none",
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            sx={{
              color: "var(--theme-tint)",
              fontWeight: "bold",
              fontSize: "var(--font-large1)",

              // to make the left icon aligned with the layout width
              marginLeft: "calc(-1 * var(--default-spacing))",

              ":hover": {
                color: "white",
                cursor: "pointer",
              },

              "&.Mui-selected": {
                color: "white",
              },
            }}
            key={tab}
            label={tab}
            value={tab}
          />
        ))}
      </Tabs>
    </div>
  );
};
