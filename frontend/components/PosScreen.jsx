'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

const ReceiptTemplate = React.forwardRef(({ cart, totalAmount, date }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: '300px',
        padding: '16px',
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: '#000',
        backgroundColor: '#fff',
        fontSize: '12px',
        lineHeight: '1.4',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 'bold' }}>
          MINIPOS STORE
        </h3>
        <p style={{ margin: 0, fontSize: '12px' }}>
          Thời gian in: {date || new Date().toLocaleString('vi-VN')}
        </p>
      </div>

      <div style={{ borderBottom: '1px dashed #000', marginBottom: '8px' }}></div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #000' }}>
            <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Tên món</th>
            <th style={{ textAlign: 'center', paddingBottom: '4px' }}>SL</th>
            <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Giá</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item._id} style={{ borderBottom: '1px dotted #ccc' }}>
              <td style={{ padding: '4px 0', maxWidth: '140px', wordBreak: 'break-word' }}>
                {item.name}
              </td>
              <td style={{ textAlign: 'center', padding: '4px 0' }}>
                {item.quantity}
              </td>
              <td style={{ textAlign: 'right', padding: '4px 0' }}>
                {(item.retailPrice * item.quantity).toLocaleString('vi-VN')} đ
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '16px',
          fontWeight: 'bold',
          margin: '12px 0',
        }}
      >
        <span>Tổng tiền:</span>
        <span>{totalAmount.toLocaleString('vi-VN')} đ</span>
      </div>

      <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>

      <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>
          Cảm ơn quý khách
        </p>
      </div>
    </div>
  );
});

ReceiptTemplate.displayName = 'ReceiptTemplate';

export default function PosScreen() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [receiptDate, setReceiptDate] = useState('');
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Hoa_Don_MINIPOS',
    onAfterPrint: () => {
      setCart([]);
    },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        const result = await response.json();
        if (result.success) {
          setProducts(result.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId, amount) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item._id === productId) {
            return { ...item, quantity: item.quantity + amount };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.retailPrice * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Giỏ hàng đang trống!');
      return;
    }

    const orderPayload = {
      cashierId: '65a000000000000000000001',
      paymentMethod: 'CASH',
      items: cart.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
        unitPrice: item.retailPrice,
      })),
    };

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();

      if (response.status === 201 || (response.ok && result.success)) {
        setReceiptDate(new Date().toLocaleString('vi-VN'));
        handlePrint();
      } else {
        alert(`Lỗi thanh toán: ${result.message}`);
      }
    } catch (error) {
      console.error('Lỗi kết nối máy chủ:', error);
      alert('Lỗi kết nối máy chủ!');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ flex: 6, padding: '20px', backgroundColor: '#f0f2f5', overflowY: 'auto' }}>
        <h2>Màn hình Thu ngân (POS)</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {products.length === 0 ? <p>Đang tải dữ liệu sản phẩm...</p> : null}
          {products.map((product) => (
            <div
              key={product._id}
              onClick={() => handleAddToCart(product)}
              style={{
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'center',
                width: '150px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <img
                src={
                  product.imageUrl ||
                  `https://placehold.co/100x100?text=${encodeURIComponent(
                    product.name.substring(0, 3)
                  )}`
                }
                alt={product.name}
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              />
              <h4 style={{ margin: '10px 0 5px', fontSize: '14px' }}>{product.name}</h4>
              <p style={{ margin: 0, color: '#ff4d4f', fontWeight: 'bold' }}>
                {product.retailPrice.toLocaleString('vi-VN')} đ
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          flex: 4,
          padding: '20px',
          borderLeft: '1px solid #ddd',
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h2>Giỏ hàng thanh toán</h2>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {cart.length === 0 ? (
            <p>Chưa có sản phẩm nào được chọn.</p>
          ) : (
            cart.map((item) => (
              <div
                key={item._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px',
                  borderBottom: '1px dashed #ccc',
                  paddingBottom: '10px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 5px' }}>{item.name}</h4>
                  <p style={{ margin: 0, color: '#888' }}>
                    {item.retailPrice.toLocaleString('vi-VN')} đ
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginRight: '15px',
                  }}
                >
                  <button
                    onClick={() => handleUpdateQuantity(item._id, -1)}
                    style={{ padding: '5px 10px', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span
                    style={{
                      fontWeight: 'bold',
                      width: '20px',
                      textAlign: 'center',
                    }}
                  >
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQuantity(item._id, 1)}
                    style={{ padding: '5px 10px', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
                <div
                  style={{
                    fontWeight: 'bold',
                    minWidth: '80px',
                    textAlign: 'right',
                  }}
                >
                  {(item.retailPrice * item.quantity).toLocaleString('vi-VN')} đ
                </div>
              </div>
            ))
          )}
        </div>

        <div
          style={{
            borderTop: '2px solid #333',
            paddingTop: '20px',
            marginTop: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '20px',
            }}
          >
            <span>Tổng tiền:</span>
            <span style={{ color: '#ff4d4f' }}>
              {totalAmount.toLocaleString('vi-VN')} đ
            </span>
          </div>
          <button
            onClick={handleCheckout}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            THANH TOÁN
          </button>
        </div>
      </div>

      <div style={{ display: 'none' }}>
        <ReceiptTemplate
          ref={componentRef}
          cart={cart}
          totalAmount={totalAmount}
          date={receiptDate}
        />
      </div>
    </div>
  );
}
