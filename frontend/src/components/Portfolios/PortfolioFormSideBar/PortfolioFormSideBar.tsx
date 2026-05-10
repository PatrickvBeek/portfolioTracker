import { Stack } from "@mui/material";
import { ReactElement, useState } from "react";
import { Heading } from "../../ui/Heading";
import SelectionHeader from "../../general/SelectionHeader";
import { OrderInputForm } from "../OrderInputForm/OrderInputForm";
import DividendForm from "./DividendForm/DividendForm";

type PortfolioFormSideBarProps = { portfolioName: string };

const FORM = {
  ORDER: "Order",
  DIVIDEND: "Dividend",
} as const;
type Forms = (typeof FORM)[keyof typeof FORM];

function PortfolioFormSideBar({
  portfolioName,
}: PortfolioFormSideBarProps): ReactElement {
  const [tab, setTab] = useState<Forms>(FORM.ORDER);

  return (
    <Stack spacing={1}>
      <Heading level="h1">Add Data to Portfolio</Heading>
      <Stack direction="row" sx={{ justifyContent: "center" }}>
        <SelectionHeader
          entries={[FORM.ORDER, FORM.DIVIDEND]}
          selectedEntry={tab}
          setSelectedEntry={(newValue: Forms) => {
            setTab(newValue);
          }}
        />
      </Stack>

      {tab === FORM.ORDER ? (
        <OrderInputForm portfolioName={portfolioName} />
      ) : (
        <DividendForm portfolioName={portfolioName} />
      )}
    </Stack>
  );
}

export default PortfolioFormSideBar;
