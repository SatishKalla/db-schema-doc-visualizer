import React from "react";
import { Modal, Form, Input, Button, message } from "antd";

type Props = {
  open: boolean;
  onClose: () => void;
};

const RequestAccessModal: React.FC<Props> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState(false);

  const onFinish = async (values: { name: string; email: string }) => {
    setSubmitting(true);
    try {
      // TODO: replace with real API call to request access
      await new Promise((res) => setTimeout(res, 800));
      message.success(
        `Request submitted for ${values.name} (${values.email}). We'll be in touch soon.`
      );
      form.resetFields();
      onClose();
    } catch (err) {
      // log the error for debugging
      console.error(err);
      message.error("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Request Access"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="name" label="Full name" rules={[{ required: true }]}>
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
