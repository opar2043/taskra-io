import useAxios from "./useAxios";
import { useQuery } from "@tanstack/react-query";

const useReview = () => {
  const axiosSecure = useAxios();
  const {
    data: reviews,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const res = await axiosSecure.get("/reviews");
      return res.data;
    },
  });
  return [reviews, refetch, isLoading];
};

export default useReview;
