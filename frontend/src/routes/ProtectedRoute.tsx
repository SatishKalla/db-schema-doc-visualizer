import React, { useState } from "react";

import { message, Spin, Layout, Button, Tooltip } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import TopNav from "../components/topbar/TopNav";
import "../App.css";
import Sidebar from "../components/sidebar/Sidebar";

const { Header, Sider } = Layout;

const ProtectedRoute: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
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
      <Header style={{ padding: 0 }}>
        <TopNav userName={user?.name} onLogout={handleLogout} />
      </Header>

      <Layout className="inner-layout">
        <Sider
          width={240}
          breakpoint="lg"
          collapsedWidth={80}
          style={{
            background: "#001529",
            padding: "16px 0",
            position: "relative",
          }}
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="dark"
          trigger={null}
        >
          <Sidebar userName={user?.name} />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              padding: "16px",
            }}
          >
            <Tooltip title={collapsed ? "Expand" : "Collapse"}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  color: "white",
                  border: "none",
                  width: "100%",
                  textAlign: "center",
                  fontSize: "16px",
                }}
              />
            </Tooltip>
          </div>
        </Sider>

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
