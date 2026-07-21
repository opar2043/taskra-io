import useAxios from "./useAxios";
import { useQuery } from "@tanstack/react-query";

// Saved jobs. GET /save-jobs returns ALL rows — filter by userEmail client-side.
const useSaveJobs = () => {
  const axiosSecure = useAxios();
  const {
    data: savedJobs,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["save-jobs"],
    queryFn: async () => {
      const res = await axiosSecure.get("/save-jobs");
      return res.data;
    },
  });
  return [savedJobs, refetch, isLoading];
};

export default useSaveJobs;
