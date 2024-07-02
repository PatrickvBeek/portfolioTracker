import { ReactElement, useCallback, useEffect } from "react";
import { bemHelper } from "../../../utility/bemHelper";
import "./Overlay.css";

const { bemBlock, bemElement } = bemHelper("overlay");

export interface OverlayProps {
  onClose: () => void;
  children?: ReactElement;
  title?: string | ReactElement;
}

const Overlay = ({ onClose, children, title }: OverlayProps) => {
  const handleEsc = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEsc, false);
  });

  return (
    <div className={bemBlock("")}>
      <div className={bemElement("background")}>
        <div className={bemElement("content")} role={"dialog"}>
          <div className={bemElement("header")}>
            <span className={bemElement("title")}>{title}</span>
            <span className={bemElement("close-button")} onClick={onClose}>
              <i className="fa fa-times" />
            </span>
          </div>
          <div className={bemElement("body")}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Overlay;
