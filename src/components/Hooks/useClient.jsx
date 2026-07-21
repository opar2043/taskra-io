import useLoginUser from "./useLoginUser";

const useClient = () => {
  const { currentUser } = useLoginUser();
  const isclient = currentUser?.role === "client";
  return isclient;
};

export default useClient;
