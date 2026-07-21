import useAxios from "./useAxios";
import { useQuery } from "@tanstack/react-query";

const useOrders = () => {
  const axiosSecure = useAxios();
  const {
    data: orders,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/orders");
      return res.data;
    },
  });
  return [orders, refetch, isLoading];
};

export default useOrders;
