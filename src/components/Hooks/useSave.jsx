import useAxios from "./useAxios";
import { useQuery } from "@tanstack/react-query";

// Saved freelancers. GET /save returns ALL rows — filter by userEmail client-side.
const useSave = () => {
  const axiosSecure = useAxios();
  const {
    data: saves,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["save"],
    queryFn: async () => {
      const res = await axiosSecure.get("/save");
      return res.data;
    },
  });
  return [saves, refetch, isLoading];
};

export default useSave;
