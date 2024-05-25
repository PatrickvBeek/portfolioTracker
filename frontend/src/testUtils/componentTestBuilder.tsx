import { render } from "@testing-library/react";
import userEvent, { Options } from "@testing-library/user-event";
import { ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { queryClientConfig } from "../queryClient/config";
import { componentHelpers } from "./componentHelper";

type ComponentTestArgs = {
  element: ReactElement;
  userEventOptions?: Options;
};

export function getComponentTest(args: ComponentTestArgs) {
  const queryClient = new QueryClient(queryClientConfig);
  const renderComponent = () => {
    render(
      <QueryClientProvider client={queryClient}>
        {args.element}
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    renderComponent();
  });

  const user = userEvent.setup(args.userEventOptions);

  const helpers = componentHelpers(user);

  return {
    render: renderComponent,
    user,
    ...helpers,
  };
}
