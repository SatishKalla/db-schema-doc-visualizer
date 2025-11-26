import React from "react";
import { Menu } from "antd";
import {
  LinkOutlined,
  DatabaseOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

type SidebarProps = {
  userName?: string;
};

const Sidebar: React.FC<SidebarProps> = ({ userName }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { label: "Connections", key: "/connections", icon: <LinkOutlined /> },
    { label: "Databases", key: "/databases", icon: <DatabaseOutlined /> },
  ];

  if (userName === "Admin") {
    items.push({ label: "Users", key: "/users", icon: <UserOutlined /> });
  }

  const selectedKey =
    items.find((i) => location.pathname.startsWith(i.key))?.key ||
    "/connections";

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={(e) => navigate(e.key)}
        items={items}
      />
    </div>
  );
};

export default Sidebar;
