import { ReactElement } from "react";
import { bemHelper } from "../../utility/bemHelper";
import "./Tile.css";

const { bemElement, bemBlock } = bemHelper("tile");

interface TileProps {
  body: ReactElement;
  header?: ReactElement;
  className?: string;
}

const Tile = ({ header, body, className }: TileProps) => {
  return (
    <div className={bemBlock(className)}>
      {header && (
        <div className={bemElement("element", "header")}>{header}</div>
      )}
      <div className={bemElement("element", "body")}>{body}</div>
    </div>
  );
};

export default Tile;
