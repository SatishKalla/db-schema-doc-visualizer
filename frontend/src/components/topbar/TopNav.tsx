import React from "react";
import { Typography, Avatar, Dropdown, Menu } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import "./TopNav.css";

const { Title } = Typography;

type TopNavProps = {
  userName?: string;
  email?: string;
  onLogout?: () => void;
};

const TopNav: React.FC<TopNavProps> = ({ userName, email, onLogout }) => {
  const handleLogout = () => {
    if (onLogout) onLogout();
    else console.log("Logout clicked (no onLogout handler provided)");
  };

  const menu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <header className="navbar">
      <div className="logo">
        <img src="/logo-svg.svg" alt="Logo" className="logo-icon" />
        <Title level={3} className="navbar-title">
          Database Copilot
        </Title>
      </div>

      <div className="navbar-left">
        <Dropdown overlay={menu} placement="bottomLeft" trigger={["click"]}>
          <div className="profile" role="button" aria-label="User menu">
            <Avatar size="large" icon={<UserOutlined />} />
            <div className="profile-details">
              <span className="profile-name">{userName || "Admin"}</span>
              <span className="email">{email}</span>
            </div>
          </div>
        </Dropdown>
      </div>
    </header>
  );
};

export default TopNav;
