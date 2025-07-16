import { useContactMessagesStore } from "@/store/contactMessagesStore";

export function useNewMessagesCount() {
  const newMessagesCount = useContactMessagesStore((state) => state.newMessagesCount);
  const loading = useContactMessagesStore((state) => state.loading);
  const setNewMessagesCount = useContactMessagesStore((state) => state.setNewMessagesCount);

  const refetch = () => {
    // This will be handled by the contact messages page when it fetches data
    // The store will automatically update the count
  };

  return { newMessagesCount, loading, refetch };
}
