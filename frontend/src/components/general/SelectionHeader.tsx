import { bemHelper } from "../../utility/bemHelper";
import { Props } from "../../utility/types";
import "./SelectionHeader.css";

const { bemBlock, bemElement } = bemHelper("selection-header");

type SelectionHeaderProps = Props<{
  entries: string[];
  selectedEntry: string;
  setSelectedEntry: (e: string) => void;
  descriptor?: string;
}>;

const SelectionHeader = ({
  entries,
  selectedEntry,
  setSelectedEntry,
  className,
}: SelectionHeaderProps) => {
  return (
    <div className={bemBlock(className)} role={"tablist"}>
      {entries.map((entry) => {
        const isSelected = selectedEntry === entry;
        return (
          <span
            key={entry}
            role={"tab"}
            className={bemElement("element", {
              selected: isSelected,
            })}
            onClick={() => setSelectedEntry(entry)}
          >
            {entry}
          </span>
        );
      })}
    </div>
  );
};

export default SelectionHeader;
