import { uid } from "radash";
import { calculateGradientOffset } from "./chartUtils";

export function getSplitColorGradientDef<T>(data: T[], dataKey: keyof T) {
  const offset = calculateGradientOffset(data, dataKey);

  const id = uid(3);
  const fillId = `splitFill-${id}`;
  const strokeId = `splitStroke-${id}`;

  const fillUrl = `url(#${fillId}`;
  const strokeUrl = `url(#${strokeId})`;

  const gradientDefinition = (
    <defs>
      <linearGradient id={strokeId} x1="0" y1="0" x2="0" y2="1">
        <stop offset={offset} stopColor="var(--green)" stopOpacity={1} />
        <stop offset={offset} stopColor="var(--red)" stopOpacity={1} />
      </linearGradient>
      <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
        <stop offset={0} stopColor="var(--green)" stopOpacity={0.75} />
        <stop offset={offset} stopColor="var(--green)" stopOpacity={0.1} />
        <stop offset={offset} stopColor="var(--red)" stopOpacity={0.1} />
        <stop offset={1} stopColor="var(--red)" stopOpacity={0.75} />
      </linearGradient>
    </defs>
  );

  return { fillUrl, strokeUrl, gradientDefinition };
}
