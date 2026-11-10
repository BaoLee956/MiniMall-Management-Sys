export const metadata = {
  title: 'MiniMall POS — Hệ thống quản lý bán hàng',
  description: 'Màn hình thu ngân và quản lý hàng hóa MiniMall',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
