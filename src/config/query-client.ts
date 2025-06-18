import { QueryClient } from '@tanstack/react-query';

function makeQueryClient(staleTime: number) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: staleTime * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(staleTime: number = 5) {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient(staleTime);
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient(staleTime);
    return browserQueryClient;
  }
}
