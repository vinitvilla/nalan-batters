import { useContactMessagesStore } from "@/store/contactMessagesStore";

/**
 * Hook to get count of new contact messages
 * Uses a selector to compute count from messages array
 */
export function useNewMessagesCount() {
  const newMessagesCount = useContactMessagesStore((state) =>
    state.messages.filter((m) => m.status === "NEW").length
  );
  const loading = useContactMessagesStore((state) => state.loading);

  const refetch = () => {
    // This will be handled by the contact messages page when it fetches data
    // The store will automatically update the count
  };

  return { newMessagesCount, loading, refetch };
}
