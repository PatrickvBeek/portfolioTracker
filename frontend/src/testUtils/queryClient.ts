import { QueryClient, QueryClientConfig } from "@tanstack/react-query";
import { queryClientConfig } from "../queryClient/config";

const testQueryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      ...queryClientConfig.defaultOptions?.queries,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    },
    mutations: {
      ...queryClientConfig.defaultOptions?.mutations,
      retry: false,
    },
  },
};

export const createTestQueryClient = (): QueryClient =>
  new QueryClient(testQueryClientConfig);
