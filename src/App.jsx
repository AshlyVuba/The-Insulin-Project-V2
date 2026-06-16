import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import FilingRoomPage from "./pages/FilingRoomPage";
import PharmacyPage from "./pages/PharmacyPage";
import AdminPage from "./pages/AdminPage";
import Layout from "./components/common/Layout";
import { canAccessRoute, getHomeRouteForRole } from "./utils/roleRoutes";

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!canAccessRoute(user?.role, allowedRoles)) {
    return <Navigate to={getHomeRouteForRole(user?.role)} replace />;
  }

  return children;
}

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={getHomeRouteForRole(user?.role)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<HomeRedirect />} />
        <Route
          path="filing"
          element={
            <RoleRoute allowedRoles={["filing"]}>
              <FilingRoomPage />
            </RoleRoute>
          }
        />
        <Route
          path="pharmacy"
          element={
            <RoleRoute allowedRoles={["pharmacy"]}>
              <PharmacyPage />
            </RoleRoute>
          }
        />
        <Route
          path="admin"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <AdminPage />
            </RoleRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}