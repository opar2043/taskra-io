import useLoginUser from "./useLoginUser";

// File keeps the project's legacy "Freelencer" spelling; the role value is "professional".
const useFreelancer = () => {
  const { currentUser } = useLoginUser();
  const isfreelancer = currentUser?.role === "professional";
  return isfreelancer;
};

export default useFreelancer;
