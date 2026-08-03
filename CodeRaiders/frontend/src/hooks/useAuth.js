import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // note the curly braces

const useAuth = () => {
  return useContext(AuthContext);
};

export { useAuth as default } from "../context/AuthContext";