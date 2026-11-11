'use client';

import { useState, useEffect } from 'react';
import LoginScreen from '@/components/LoginScreen';
import AdminScreen from '@/components/AdminScreen';
import PosScreen from '@/components/PosScreen';

export default function Home() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setUserRole(role);
    }
  }, []);

  const handleLoginSuccess = (role) => {
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUserRole(null);
  };

  return (
    <>
      {userRole !== null && (
        <button
          onClick={handleLogout}
          style={{
            position: 'fixed',
            top: 12,
            right: 16,
            zIndex: 9999,
            padding: '6px 16px',
            background: '#ff4d4f',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Đăng xuất
        </button>
      )}
      {userRole === null && <LoginScreen onLoginSuccess={handleLoginSuccess} />}
      {userRole === 'Admin' && <AdminScreen />}
      {userRole === 'Cashier' && <PosScreen />}
    </>
  );
}
