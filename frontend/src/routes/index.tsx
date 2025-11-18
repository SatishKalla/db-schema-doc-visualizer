import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/login/Login";
import Connections from "../pages/connections/Connections";
import ProtectedRoute from "./ProtectedRoute";
import Databases from "../pages/databases/Databases";
import Users from "../pages/users/Users";

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    {/* Protected routes */}
    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<Connections />} />
      <Route path="/connections" element={<Connections />} />
      <Route path="/databases" element={<Databases />} />
      <Route path="/users" element={<Users />} />
    </Route>

    {/* fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
