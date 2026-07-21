import useAxios from "./useAxios";
import { useQuery } from "@tanstack/react-query";

const useUser = () => {
  const axiosSecure = useAxios();
  const {
    data: users,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users");
      return res.data;
    },
  });
  return { users, refetch, isLoading };
};

export default useUser;
