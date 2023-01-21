import { bemHelper } from "../../../utility/bemHelper";
import { Button } from "../Button";
import Overlay from "../Overlay/Overlay";
import "./Confirmation.css";

const { bemBlock, bemElement } = bemHelper("confirmation");

export type ConfirmationProps = {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  primary?: "confirm" | "cancel";
};

const Confirmation = ({
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  primary = "cancel",
}: ConfirmationProps) => {
  return (
    <Overlay onClose={onCancel} title={title}>
      <div className={bemBlock("")}>
        <div className={bemElement("description")}>{body}</div>
        <div className={bemElement("buttons")}>
          <Button
            onClick={onCancel}
            label={cancelLabel}
            isPrimary={primary === "cancel"}
            autoFocus={primary === "cancel"}
          />
          <Button
            onClick={onConfirm}
            label={confirmLabel}
            className={bemElement("confirm")}
            isPrimary={primary === "confirm"}
            autoFocus={primary === "confirm"}
          />
        </div>
      </div>
    </Overlay>
  );
};

export default Confirmation;
