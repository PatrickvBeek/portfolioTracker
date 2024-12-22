import { FC, useState } from "react";
import { Button } from "../../general/Button";
import { SymbolConnectionIndicator } from "../AssetTable/SymbolConnectionIndicator";
import styles from "./CheckSymbolButton.module.less";

type CheckSymbolButtonProps = {
  symbol: string;
};

const CheckSymbolButton: FC<CheckSymbolButtonProps> = ({ symbol }) => {
  const [activeSymbol, setActiveSymbol] = useState("");

  return (
    <div className={styles.container}>
      {!!activeSymbol && <SymbolConnectionIndicator symbol={activeSymbol} />}
      <Button
        onClick={() => setActiveSymbol(symbol)}
        label={"Check Symbol"}
        isPrimary={false}
      />
    </div>
  );
};

export default CheckSymbolButton;
