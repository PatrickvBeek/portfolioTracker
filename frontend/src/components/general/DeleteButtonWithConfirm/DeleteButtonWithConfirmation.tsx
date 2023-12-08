import { ReactElement, useState } from "react";
import { bemHelper } from "../../../utility/bemHelper";
import { Props } from "../../../utility/types";
import Confirmation, { ConfirmationProps } from "../Confirmation/Confirmation";
import "./DeleteButtonWithConfirmation.css";

type DeleteButtonWithConfirmationProps = Props<{ deleteHandler: () => void }> &
  Pick<ConfirmationProps, "body" | "title">;

const { bemBlock, bemElement } = bemHelper("delete-button-with-confirmation");

function DeleteButtonWithConfirmation({
  title,
  body,
  deleteHandler,
}: DeleteButtonWithConfirmationProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={bemBlock("")}>
      <i
        className={"fa fa-trash " + bemElement("button")}
        onClick={() => setIsOpen(true)}
      ></i>
      {isOpen && (
        <Confirmation
          title={title}
          body={body}
          confirmLabel={"Delete"}
          cancelLabel={"Cancel"}
          onConfirm={() => {
            deleteHandler();
            setIsOpen(false);
          }}
          onCancel={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default DeleteButtonWithConfirmation;
