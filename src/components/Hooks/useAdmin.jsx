import useLoginUser from "./useLoginUser";

const useAdmin = () => {
  const { currentUser } = useLoginUser();
  const isadmin = currentUser?.role === "admin" || currentUser?.role === "owner";
  return isadmin;
};

export default useAdmin;
