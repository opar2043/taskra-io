import useAxios from "./useAxios";
import { useQuery } from "@tanstack/react-query";

// Role-aware dashboard stats (file keeps the project's legacy spelling).
const useFrelencerStat = (email) => {
  const axiosSecure = useAxios();
  const {
    data: stats,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["dashboard-stats", email],
    enabled: !!email,
    queryFn: async () => {
      const res = await axiosSecure.get(`/dashboard-stats/${email}`);
      return res.data;
    },
  });
  return [stats, refetch, isLoading];
};

export default useFrelencerStat;
