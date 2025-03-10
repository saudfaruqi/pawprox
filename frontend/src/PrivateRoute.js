import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ role = "user" }) => {
  const token = localStorage.getItem("token");
  // Retrieve the active role; default to "user" if not set
  const activeRole = localStorage.getItem("activeRole") || "user";

  console.log("PrivateRoute Debug:", { token, activeRole, requiredRole: role });

  if (!token) {
    console.log("No token found. Redirecting to /login");
    return <Navigate to="/login" replace />;
  }
  if (activeRole !== role) {
    console.log(
      `Role mismatch: activeRole (${activeRole}) does not match required role (${role}). Redirecting to /unauthorized`
    );
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
};

export default PrivateRoute;
