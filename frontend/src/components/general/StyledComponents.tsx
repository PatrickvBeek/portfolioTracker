import styled from "@emotion/styled";
import { Button } from "@mui/material";

export const StyledIcon = styled.i`
  color: white;
`;

export const StyledMuiButton = styled(Button)<{ isPrimary?: boolean }>`
  font-size: 1rem;
  border-radius: 4px;
  padding: 1rem;
  font-weight: 800;
  text-transform: none;
  min-width: auto;
  line-height: unset;

  ${({ isPrimary }) =>
    isPrimary &&
    `
    background-color: var(--theme-highlight);
    color: white;
    border: none;

    &:hover {
      background-color: var(--theme-highlight);
      opacity: 0.9;
    }

    &:disabled {
      background-color: var(--theme);
      opacity: 0.4;
      color: white;
    }
  `}

  ${({ isPrimary }) =>
    !isPrimary &&
    `
    background-color: white;
    border: 2px solid var(--theme-highlight);
    color: var(--theme-highlight);

    &:hover {
      background-color: var(--theme-tint-soft);
      border: 2px solid var(--theme-highlight);
    }

    &:disabled {
      background-color: white;
      border: 2px solid var(--theme-tint);
      color: var(--theme-tint);
    }
  `}
`;
