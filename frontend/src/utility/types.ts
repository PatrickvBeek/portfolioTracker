import { ReactElement } from "react";

export type GeneralComponentProps = {
  children?: ReactElement | ReactElement[];
  className?: string;
};

export type Props<T extends object = object> = T & GeneralComponentProps;

export function isNotNil<T>(val: T | undefined | null): val is T {
  return val !== undefined && val !== null;
}
