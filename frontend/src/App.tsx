import React from "react";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";

const App: React.FC = () => {
  const { user } = useAuth();
  return user ? <Dashboard /> : <LoginPage />;
};

export default App;
