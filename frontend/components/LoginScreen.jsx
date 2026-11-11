'use client';

import { useState } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';

const { Title } = Typography;

export default function LoginScreen({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: values.username, password: values.password }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('role', result.role);
        onLoginSuccess(result.role);
      } else {
        messageApi.error(result.message || 'Sai tài khoản hoặc mật khẩu');
      }
    } catch {
      messageApi.error('Lỗi kết nối máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
        <Card style={{ width: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', borderRadius: 12 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={3} style={{ margin: 0 }}>Đăng nhập hệ thống</Title>
            <p style={{ color: '#888', marginTop: 4 }}>MiniMall POS</p>
          </div>
          <Form layout="vertical" onFinish={handleSubmit} autoComplete="off">
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input size="large" placeholder="Nhập tên đăng nhập" />
            </Form.Item>
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password size="large" placeholder="Nhập mật khẩu" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  );
}
