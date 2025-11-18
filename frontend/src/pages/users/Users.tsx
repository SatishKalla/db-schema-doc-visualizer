import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Spin,
  Select,
  notification,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  CopyOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  getUsersByStatus,
  approveOrRejectUser,
  deleteUser,
} from "../../api/users";
import type { User } from "../../api/users";
import "./Users.css";

type StatusFilter = "pending" | "approved" | "rejected";

const Users: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [api, contextHolderNotification] = notification.useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("pending");

  const handleCopy = async (password: string): Promise<void> => {
    await navigator.clipboard.writeText(password);
    messageApi.open({
      type: "success",
      content: "Password copied to clipboard",
    });
  };

  const openNotification = (password: string) => {
    api.open({
      message: "User Added Successfully",
      description: (
        <>
          <p>The new user has been added to the system.</p>
          <p>
            Here is the password: <strong>{password}</strong> &nbsp;
            <CopyOutlined onClick={() => handleCopy(password)} />
          </p>
        </>
      ),
      duration: 0,
    });
  };

  // Fetch users on component mount and when status filter changes
  useEffect(() => {
    fetchUsers(selectedStatus);
  }, [selectedStatus]);

  const fetchUsers = async (status: StatusFilter) => {
    setLoading(true);
    try {
      const data = await getUsersByStatus(status);
      setUsers(data);
    } catch (error) {
      messageApi.open({
        type: "error",
        content: (error as Error).message || "Failed to fetch users",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (value: StatusFilter) => {
    setSelectedStatus(value);
  };

  const handleApprove = async (userId: string) => {
    setActionLoading("approve");
    setUserId(userId);
    try {
      const currentUser = localStorage.getItem("user");
      const reviewedBy = currentUser ? JSON.parse(currentUser).email : "admin";

      const { password } = await approveOrRejectUser(
        userId,
        "approved",
        reviewedBy
      );
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, status: "approved" } : user
        )
      );
      messageApi.open({
        type: "success",
        content: "User approved",
      });
      openNotification(password);
    } catch (error) {
      messageApi.open({
        type: "error",
        content: (error as Error).message || "Failed to approve user",
      });
    } finally {
      setActionLoading(null);
      setUserId(null);
    }
  };

  const handleReject = async (userId: string) => {
    setActionLoading("reject");
    setUserId(userId);
    try {
      const currentUser = localStorage.getItem("user");
      const reviewedBy = currentUser ? JSON.parse(currentUser).email : "admin";

      await approveOrRejectUser(userId, "rejected", reviewedBy);
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, status: "rejected" } : user
        )
      );
      messageApi.open({
        type: "info",
        content: "User rejected",
      });
    } catch (error) {
      messageApi.open({
        type: "error",
        content: (error as Error).message || "Failed to reject user",
      });
    } finally {
      setActionLoading(null);
      setUserId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    setActionLoading("delete");
    setUserId(userId);
    try {
      await deleteUser(userId);
      setUsers(users.filter((user) => user.id !== userId));
      messageApi.open({
        type: "warning",
        content: "User deleted",
      });
    } catch (error) {
      messageApi.open({
        type: "error",
        content: (error as Error).message || "Failed to delete user",
      });
    } finally {
      setActionLoading(null);
      setUserId(null);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span className={`status-${status}`}>{status || "pending"}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: User) => (
        <Space size="small">
          {record.status &&
            ["approved", "rejected"].includes(record.status) === false && (
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                loading={userId === record.id && actionLoading === "approve"}
                onClick={() => handleApprove(record.id)}
              >
                Approve
              </Button>
            )}
          {record.status &&
            ["approved", "rejected"].includes(record.status) === false && (
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                loading={userId === record.id && actionLoading === "reject"}
                onClick={() => handleReject(record.id)}
              >
                Reject
              </Button>
            )}
          <Popconfirm
            title="Delete User"
            description="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              type="text"
              loading={record.id === userId && actionLoading === "delete"}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="users-container">
      {contextHolder}
      {contextHolderNotification}
      <div className="users-header">
        <h1>Users</h1>
        <div className="users-filter">
          <label>Status:</label>
          <Select
            value={selectedStatus}
            onChange={handleStatusChange}
            style={{ width: 150 }}
            options={[
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" },
            ]}
          />
        </div>
      </div>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </Spin>
    </div>
  );
};

export default Users;
