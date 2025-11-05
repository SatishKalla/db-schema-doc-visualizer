import React, { useState } from "react";
import { Form, Input, Button, Typography, Alert } from "antd";
import { useAuth } from "../../hooks/useAuth";
import RequestAccessModal from "../../components/modals/request-access/RequestAccessModal";
import "./Login.css";

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [openRequest, setOpenRequest] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setError(null);
    try {
      await login(values.email, values.password);
      // on success, auth state updates and app will redirect to dashboard
    } catch (err: unknown) {
      setError((err as Error).message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="logo-card">
        <img
          src="/logo-with-text.png"
          alt="Database Copilot"
          className="card-logo"
        />
      </div>

      <div className="glass-card" role="region" aria-label="Sign in">
        <div className="card-header">Your AI-powered database assistant.</div>

        <div className="card-body">
          <Title level={3} className="login-title">
            Sign In
          </Title>

          {error && (
            <Alert className="login-alert" type="error" message={error} />
          )}

          <Form
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ email: "" }}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Please input your email" }]}
            >
              <Input
                className="input-field"
                autoComplete="email"
                aria-label="Email"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password" },
              ]}
            >
              <Input.Password
                className="input-field"
                autoComplete="current-password"
                aria-label="Password"
                visibilityToggle
              />
            </Form.Item>

            <Form.Item>
              <Button
                className="primary-btn"
                type="primary"
                htmlType="submit"
                block
                loading={loading}
              >
                Sign in
              </Button>
            </Form.Item>

            <Form.Item>
              <Button
                className="secondary-btn"
                type="default"
                htmlType="button"
                block
                onClick={() => setOpenRequest(true)}
              >
                Request Access
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      <RequestAccessModal
        open={openRequest}
        onClose={() => setOpenRequest(false)}
      />
    </div>
  );
};

export default LoginPage;
