import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 min — no refetch within this window
      gcTime: 30 * 60 * 1000, // 30 min — keep in cache after unmount
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default queryClient;
