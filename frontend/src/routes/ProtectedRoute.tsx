import React from "react";

import { message, Spin, Layout } from "antd";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import TopNav from "../components/topbar/TopNav";
import "../App.css";
import Sidebar from "../components/sidebar/Sidebar";

const ProtectedRoute: React.FC = () => {
  const { loading, logout } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const stored = localStorage.getItem("auth");
  const user = stored ? JSON.parse(stored).user : null;

  const navigate = useNavigate();

  if (loading) {
    // you might want a spinner here; keep simple text to avoid extra deps
    return (
      <div className="loading-spinner">
        <Spin tip="Loading" size="large"></Spin>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      // navigate to login after successful logout
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      messageApi.open({
        type: "error",
        content: (err as Error).message || "Logout failed",
      });
    }
  };

  return user ? (
    <Layout className="layout">
      {contextHolder}
      <Layout.Header style={{ padding: 0 }}>
        <TopNav userName={user?.name} onLogout={handleLogout} />
      </Layout.Header>

      <Layout>
        <Layout.Sider
          width={240}
          breakpoint="lg"
          collapsedWidth={80}
          style={{ background: "#001529", padding: "16px 0" }}
        >
          <Sidebar userName={user?.name} />
        </Layout.Sider>

        <Layout.Content className="main-content">
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
