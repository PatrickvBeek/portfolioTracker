import { QueryClientConfig } from "react-query";

export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
      refetchOnReconnect: "always",
      cacheTime: 1000 * 60 * 60, //1 hour
      refetchInterval: 1000 * 60 * 60, //1 hour
      refetchIntervalInBackground: false,
      suspense: false,
      staleTime: 1000 * 60 * 60,
    },
    mutations: {
      retry: 2,
    },
  },
};
