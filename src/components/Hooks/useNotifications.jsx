import useAxios from "./useAxios";
import { useQuery } from "@tanstack/react-query";

const useNotifications = (email) => {
  const axiosSecure = useAxios();
  const {
    data: notifications,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["notifications", email],
    enabled: !!email,
    queryFn: async () => {
      const res = await axiosSecure.get(`/notifications/${email}`);
      return res.data;
    },
  });
  return [notifications, refetch, isLoading];
};

export default useNotifications;
