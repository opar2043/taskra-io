import useAxios from "./useAxios";
import { useQuery } from "@tanstack/react-query";

const useInboxQuote = () => {
  const axiosSecure = useAxios();
  const {
    data: inboxQuotes,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["inbox-quote"],
    queryFn: async () => {
      const res = await axiosSecure.get("/inbox-quote");
      return res.data;
    },
  });
  return [inboxQuotes, refetch, isLoading];
};

export default useInboxQuote;
