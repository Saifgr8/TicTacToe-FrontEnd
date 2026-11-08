import { Navigate, Outlet } from "react-router-dom";
import { hasAuthSession } from "./authSession";

const RequireAuth = () => {
  if (!hasAuthSession(localStorage)) {
    return <Navigate to="/signin" replace state={{ loginRequired: true }} />;
  }
  return <Outlet />;
};

export default RequireAuth;
