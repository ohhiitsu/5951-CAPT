import { Outlet, Navigate } from "react-router";
import { auth } from "../config/firebase";

const useAuth = () => {
  return auth.currentUser;
};

const ProtectedRoutes = () => {
  const isAuth = useAuth();
  return isAuth ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;
