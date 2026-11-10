'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Typography,
} from 'antd';

const { Title } = Typography;
const API_BASE = 'http://127.0.0.1:5000/api';

export default function AdminScreen() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/products`);
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
      } else {
        messageApi.error(result.message || 'Không thể lấy danh sách sản phẩm');
      }
    } catch (error) {
      messageApi.error('Lỗi kết nối máy chủ khi lấy danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/categories`);
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      } else {
        messageApi.error(result.message || 'Không thể lấy danh sách danh mục');
      }
    } catch (error) {
      messageApi.error('Lỗi kết nối máy chủ khi lấy danh sách danh mục');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleFinish = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        barcode: values.barcode.trim(),
        retailPrice: Number(values.retailPrice),
        imageUrl: values.imageUrl ? values.imageUrl.trim() : '',
        categoryId: values.categoryId,
      };

      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        messageApi.success('Thêm sản phẩm mới thành công!');
        handleCloseModal();
        fetchProducts();
      } else {
        messageApi.error(result.message || 'Thêm sản phẩm thất bại!');
      }
    } catch (error) {
      messageApi.error('Lỗi kết nối máy chủ khi thêm sản phẩm!');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 100,
      align: 'center',
      render: (url, record) => (
        <img
          src={
            url ||
            `https://placehold.co/60x60?text=${encodeURIComponent(
              record.name ? record.name.substring(0, 3) : 'SP'
            )}`
          }
          alt={record.name}
          style={{
            width: 50,
            height: 50,
            objectFit: 'cover',
            borderRadius: 4,
            border: '1px solid #f0f0f0',
          }}
        />
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Mã vạch (barcode)',
      dataIndex: 'barcode',
      key: 'barcode',
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (cat) => (cat && cat.name ? cat.name : 'Chưa phân loại'),
    },
    {
      title: 'Giá bán',
      dataIndex: 'retailPrice',
      key: 'retailPrice',
      align: 'right',
      render: (price) => `${Number(price || 0).toLocaleString('vi-VN')} đ`,
    },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#fff', minHeight: '100vh' }}>
      {contextHolder}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Quản lý Hàng hóa
        </Title>
        <Button type="primary" size="large" onClick={handleOpenModal}>
          Thêm Sản phẩm
        </Button>
      </div>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={products}
        loading={loading}
        pagination={{ pageSize: 8 }}
        bordered
      />

      <Modal
        title="Thêm Sản phẩm Mới"
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
          >
            <Input placeholder="Nhập tên sản phẩm" />
          </Form.Item>

          <Form.Item
            name="barcode"
            label="Mã vạch"
            rules={[{ required: true, message: 'Vui lòng nhập mã vạch!' }]}
          >
            <Input placeholder="Nhập mã vạch sản phẩm" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map((category) => (
                <Select.Option key={category._id} value={category._id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="retailPrice"
            label="Giá bán"
            rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="Nhập giá bán (VNĐ)"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item name="imageUrl" label="Link hình ảnh">
            <Input placeholder="Nhập URL hình ảnh (ví dụ: https://...)" />
          </Form.Item>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '24px',
            }}
          >
            <Button onClick={handleCloseModal}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Lưu Sản phẩm
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
