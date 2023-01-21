import { ReactElement } from "react";

export type GeneralComponentProps = {
  children?: ReactElement | ReactElement[];
  className?: string;
};

export type Props<T> = T & GeneralComponentProps;
