import { QueryClientConfig } from "@tanstack/react-query";

export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnMount: false,
      refetchOnWindowFocus: true,
      refetchOnReconnect: "always",
      refetchInterval: 1000 * 60 * 60, //1 hour
      refetchIntervalInBackground: false,
      staleTime: 1000 * 60 * 60,
    },
    mutations: {
      retry: 2,
    },
  },
};
