import useAxios from "./useAxios";
import { useQuery } from "@tanstack/react-query";

const useQuote = () => {
  const axiosSecure = useAxios();
  const {
    data: quotes,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["quote"],
    queryFn: async () => {
      const res = await axiosSecure.get("/quote");
      return res.data;
    },
  });
  return [quotes, refetch, isLoading];
};

export default useQuote;
