import { IconButton } from "@mui/material";
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
      <IconButton
        size={"small"}
        className={bemElement("button")}
        onClick={() => setIsOpen(true)}
        aria-label={"Delete"}
      >
        <i className="fa fa-trash"></i>
      </IconButton>
      <Confirmation
        title={title}
        body={body}
        open={isOpen}
        confirmLabel={"Delete"}
        cancelLabel={"Cancel"}
        onConfirm={() => {
          deleteHandler();
          setIsOpen(false);
        }}
        onCancel={() => setIsOpen(false)}
      />
    </div>
  );
}

export default DeleteButtonWithConfirmation;
