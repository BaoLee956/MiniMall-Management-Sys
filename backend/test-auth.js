const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5000/api';

const runAuthTests = async () => {
  try {
    console.log('------------------------------------------------------------');
    console.log('   BẮT ĐẦU KIỂM THỬ HỆ THỐNG XÁC THỰC & PHÂN QUYỀN (JWT)');
    console.log('------------------------------------------------------------\n');

    console.log('>>> Bước 1: Gửi yêu cầu đăng ký tài khoản Admin...');
    const registerPayload = {
      username: 'admin',
      password: '123',
      role: 'Admin',
    };

    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerPayload),
    });

    const registerData = await registerRes.json();

    if (registerRes.status === 201 && registerData.success) {
      console.log('Kết quả: [ĐẠT] Tạo tài khoản Admin thành công (Mã phản hồi: 201)');
      console.log('Thông tin tài khoản:', JSON.stringify(registerData.data, null, 2));
    } else if (
      registerRes.status === 400 ||
      registerRes.status === 409 ||
      (registerData.message && registerData.message.includes('tồn tại'))
    ) {
      console.log('Kết quả: [THÔNG BÁO] Tài khoản đã tồn tại, tiếp tục test đăng nhập');
    } else {
      console.log(`Kết quả: [THẤT BẠI] Đăng ký thất bại (Mã phản hồi: ${registerRes.status})`);
      console.log('Chi tiết lỗi:', JSON.stringify(registerData, null, 2));
    }

    console.log('\n------------------------------------------------------------');
    console.log('>>> Bước 2: Gửi yêu cầu đăng nhập tài khoản Admin...');
    const loginPayload = {
      username: 'admin',
      password: '123',
    };

    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginPayload),
    });

    const loginData = await loginRes.json();

    if (loginRes.status === 200 && loginData.success && loginData.token) {
      console.log('Kết quả: [ĐẠT] Đăng nhập thành công và đã nhận JWT Token (Mã phản hồi: 200)');
      console.log('Vai trò (Role):', loginData.role);
      console.log('Chuỗi JWT Token:');
      console.log(loginData.token);
    } else {
      console.log(`Kết quả: [THẤT BẠI] Đăng nhập thất bại (Mã phản hồi: ${loginRes.status})`);
      console.log('Chi tiết lỗi:', JSON.stringify(loginData, null, 2));
      return;
    }

    console.log('\n------------------------------------------------------------');
    console.log('   TẤT CẢ CÁC BƯỚC KIỂM THỬ AUTH ĐỀU HOÀN TẤT THÀNH CÔNG!');
    console.log('------------------------------------------------------------');
  } catch (error) {
    console.error('\n[LỖI HỆ THỐNG] Quá trình kiểm thử bị gián đoạn:', error.message);
  }
};

runAuthTests();
