import classNames from "classnames";
import { mapKeys, partial } from "lodash";

type Modifiers =
  | string
  | (string | null)[]
  | { [key: string]: unknown }
  | undefined;

const withModifier = (className: string, modifier: string): string =>
  `${className}--${modifier}`;

function modify(className: string, modifiers: Modifiers): Modifiers {
  if (!modifiers) {
    return undefined;
  }

  if (typeof modifiers === "string") {
    return withModifier(className, modifiers);
  }

  if (Array.isArray(modifiers)) {
    return modifiers.map((modifier) =>
      modifier ? withModifier(className, modifier) : null
    );
  }

  return mapKeys(modifiers, (enabled, modifier) =>
    withModifier(className, modifier)
  );
}

export function bemBlock(
  block: string,
  className: string | undefined,
  modifiers?: Modifiers
): string {
  return classNames(block, modify(block, modifiers), className);
}

export function bemElement(
  block: string,
  element: string,
  modifiers?: Modifiers
): string {
  const elementName = `${block}__${element}`;
  return classNames(elementName, modify(elementName, modifiers));
}

interface BemHelper {
  bemBlock: (className: string | undefined, modifiers?: Modifiers) => string;
  bemElement: (element: string, modifiers?: Modifiers) => string;
}

export function bemHelper(block: string): BemHelper {
  return {
    bemBlock: partial(bemBlock, block),
    bemElement: partial(bemElement, block),
  };
}
