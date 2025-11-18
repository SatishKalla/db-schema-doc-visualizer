import React from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { requestAccess } from "../../../api/access";

type Props = {
  open: boolean;
  onClose: () => void;
};

const RequestAccessModal: React.FC<Props> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [submitting, setSubmitting] = React.useState(false);

  const onFinish = async (values: { full_name: string; email: string }) => {
    setSubmitting(true);
    try {
      // Call real API to request access
      await requestAccess(values);

      messageApi.open({
        type: "success",
        content: `Request submitted for ${values.full_name} (${values.email}). We'll be in touch soon.`,
      });
      form.resetFields();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      // show server-provided message when available
      const content =
        (err instanceof Error && err.message) ||
        String(err) ||
        "Failed to submit request. Please try again.";
      messageApi.open({ type: "error", content });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Request Access"
      open={open}
      onCancel={onClose}
      footer={contextHolder}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="full_name"
          label="Full name"
          rules={[{ required: true }]}
        >
          <Input placeholder="Your full name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: "email" }]}
        >
          <Input placeholder="you@example.com" />
        </Form.Item>

        <Form.Item>
          <Button htmlType="submit" type="primary" block loading={submitting}>
            Submit request
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RequestAccessModal;
