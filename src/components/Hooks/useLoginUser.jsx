import useAuth from "./useAuth";
import useUser from "./useUser";

const useLoginUser = () => {
  const { user } = useAuth();
  const { users, refetch, isLoading } = useUser();

  const email = user?.email;
  const currentUser = users?.find((u) => u.email === email);

  return { currentUser, refetch, isLoading };
};

export default useLoginUser;
