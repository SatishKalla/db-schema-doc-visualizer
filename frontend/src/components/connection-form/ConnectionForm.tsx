import React from "react";
import { Form, Input, Button, Select } from "antd";
import "./ConnectionForm.css";

interface Props {
  onFinish: (values: Record<string, string | number>) => Promise<void>;
  loading: boolean;
}

const ConnectionForm: React.FC<Props> = ({ onFinish, loading }) => {
  const [form] = Form.useForm();

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} className="form-container">
      <Form.Item label="Database Type" name="database" rules={[{ required: true }]}>
        <Select placeholder="Select database type">
          <Select.Option value="mysql2">MySQL</Select.Option>
          <Select.Option value="pg">Postgres</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="Host" name="host" rules={[{ required: true }]}> 
        <Input placeholder="Enter host address" />
      </Form.Item>

      <Form.Item label="Port" name="port" rules={[{ required: true }]}> 
        <Input placeholder="Enter port number" type="number" />
      </Form.Item>

      <Form.Item label="User" name="user" rules={[{ required: true }]}> 
        <Input placeholder="Enter username" />
      </Form.Item>

      <Form.Item label="Password" name="password" rules={[{ required: true }]}> 
        <Input.Password placeholder="Enter password" />
      </Form.Item>

      <Form.Item className="form-submit">
        <Button type="primary" htmlType="submit" disabled={loading}>
          {loading ? "Connecting..." : "Connect"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ConnectionForm;
