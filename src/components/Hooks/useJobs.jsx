import useAxios from "./useAxios";
import { useQuery } from "@tanstack/react-query";

const useJobs = () => {
  const axiosSecure = useAxios();
  const {
    data: jobs,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await axiosSecure.get("/jobs");
      return res.data;
    },
  });
  return [jobs, refetch, isLoading];
};

export default useJobs;
