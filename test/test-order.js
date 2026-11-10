const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5000/api';

const runOrderTests = async () => {
  try {
    console.log('======================================================================');
    console.log('   BẮT ĐẦU KỊCH BẢN KIỂM THỬ: BÁN HÀNG, TRỪ KHO VÀ TRANSACTION');
    console.log('======================================================================\n');

    console.log('>>> Bước 1: Gửi yêu cầu GET lấy danh sách sản phẩm để chọn 1 sản phẩm...');
    const getProductRes = await fetch(`${BASE_URL}/products`);
    const productData = await getProductRes.json();

    if (!getProductRes.ok || !productData.success || !productData.data || productData.data.length === 0) {
      console.log('Kết quả: ✖ [THẤT BẠI] Không tìm thấy sản phẩm nào trong hệ thống để thực hiện kiểm thử');
      return;
    }

    const targetProduct = productData.data[0];
    const productId = targetProduct._id;
    console.log(`Kết quả: ✔ [ĐẠT] Đã chọn sản phẩm: "${targetProduct.name}" (Mã: ${targetProduct.barcode}, ID: ${productId})`);

    const checkStockBeforeRes = await fetch(`${BASE_URL}/inventory?productId=${productId}`);
    const checkStockBeforeData = await checkStockBeforeRes.json();
    const initialStock = checkStockBeforeData.data?.totalStock || 0;
    console.log(`[THÔNG TIN] Tồn kho ban đầu của sản phẩm: ${initialStock}\n`);

    console.log('>>> Bước 2: Gửi yêu cầu POST nhập thêm 10 sản phẩm vào kho...');
    const batchCode = `LOKHO_${Date.now()}`;
    const importPayload = {
      productId,
      batchCode,
      quantity: 10,
      costPrice: 5000,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const importRes = await fetch(`${BASE_URL}/inventory/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(importPayload),
    });

    const importData = await importRes.json();

    if (importRes.status === 201 && importData.success) {
      console.log(`Kết quả: ✔ [ĐẠT] Nhập kho thành công 10 sản phẩm (Lô: ${batchCode}, HTTP 201)`);
      console.log('Dữ liệu lô hàng:', JSON.stringify(importData.data, null, 2));
    } else {
      console.log(`Kết quả: ✖ [THẤT BẠI] Nhập kho thất bại (HTTP ${importRes.status})`);
      console.log('Dữ liệu trả về:', JSON.stringify(importData, null, 2));
      return;
    }

    const expectedStockAfterImport = initialStock + 10;
    console.log(`[THÔNG TIN] Tổng tồn kho sau khi nhập thêm 10: ${expectedStockAfterImport}\n`);

    console.log('>>> Bước 3: Gửi yêu cầu POST tạo hóa đơn mua 3 sản phẩm...');
    const orderPayload = {
      cashierId: '65a000000000000000000001',
      paymentMethod: 'CASH',
      items: [
        {
          productId,
          quantity: 3,
        },
      ],
    };

    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });

    const orderData = await orderRes.json();

    if (orderRes.status === 201 && orderData.success) {
      console.log('Kết quả: ✔ [ĐẠT] Tạo đơn hàng thành công (HTTP 201)');
      console.log(`Mã hóa đơn: ${orderData.data.order._id}`);
      console.log(`Tổng tiền thanh toán: ${orderData.data.order.totalAmount} VNĐ`);
      console.log('Chi tiết đơn:', JSON.stringify(orderData.data.details, null, 2));
    } else {
      console.log(`Kết quả: ✖ [THẤT BẠI] Tạo đơn hàng thất bại (HTTP ${orderRes.status})`);
      console.log('Dữ liệu lỗi:', JSON.stringify(orderData, null, 2));
      return;
    }

    console.log('\n>>> Bước 4: Gửi yêu cầu GET kiểm tra tồn kho sau khi mua (Kỳ vọng đã bị trừ 3)...');
    const checkStockAfterRes = await fetch(`${BASE_URL}/inventory?productId=${productId}`);
    const checkStockAfterData = await checkStockAfterRes.json();
    const currentStock = checkStockAfterData.data?.totalStock;
    const expectedRemaining = expectedStockAfterImport - 3;

    if (checkStockAfterRes.status === 200 && currentStock === expectedRemaining) {
      console.log(`Kết quả: ✔ [ĐẠT] Tồn kho đã được trừ chính xác! Hiện còn: ${currentStock} (Kỳ vọng: ${expectedRemaining}, HTTP 200)`);
    } else {
      console.log(`Kết quả: ✖ [THẤT BẠI] Sai lệch số lượng tồn kho! Thực tế: ${currentStock}, Kỳ vọng: ${expectedRemaining}`);
      return;
    }

    console.log('\n>>> Bước 5: Cố tình đặt mua 100 sản phẩm (Vượt quá tồn kho để kiểm tra Rollback)...');
    const overflowOrderPayload = {
      cashierId: '65a000000000000000000001',
      paymentMethod: 'CASH',
      items: [
        {
          productId,
          quantity: 100,
        },
      ],
    };

    const overflowOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(overflowOrderPayload),
    });

    const overflowOrderData = await overflowOrderRes.json();

    if (overflowOrderRes.status === 400 && !overflowOrderData.success) {
      console.log('Kết quả: ✔ [ĐẠT] Giao dịch bị từ chối và Rollback toàn bộ thành công đúng kỳ vọng (HTTP 400)');
      console.log(`Thông báo lỗi từ hệ thống: "${overflowOrderData.message}"`);
    } else {
      console.log(`Kết quả: ✖ [THẤT BẠI] Hệ thống không chặn được đơn hàng vượt tồn kho (HTTP ${overflowOrderRes.status})`);
      console.log('Dữ liệu trả về:', JSON.stringify(overflowOrderData, null, 2));
      return;
    }

    console.log('\n>>> Kiểm tra lại tồn kho sau khi Rollback giao dịch lỗi...');
    const rollbackStockRes = await fetch(`${BASE_URL}/inventory?productId=${productId}`);
    const rollbackStockData = await rollbackStockRes.json();
    const stockAfterRollback = rollbackStockData.data?.totalStock;

    if (stockAfterRollback === expectedRemaining) {
      console.log(`Kết quả: ✔ [ĐẠT] Số lượng tồn kho được bảo toàn nguyên vẹn sau Rollback: ${stockAfterRollback}`);
    } else {
      console.log(`Kết quả: ✖ [THẤT BẠI] Tồn kho bị thay đổi bất thường sau giao dịch lỗi! Tồn kho: ${stockAfterRollback}`);
    }

    console.log('\n======================================================================');
    console.log('   TẤT CẢ CÁC BƯỚC KIỂM THỬ ĐƠN HÀNG VÀ TRANSACTION ĐỀU THÀNH CÔNG!');
    console.log('======================================================================');
  } catch (error) {
    console.error('\n[LỖI HỆ THỐNG] Quá trình kiểm thử bị gián đoạn:', error.message);
    if (error.cause) {
      console.error('Chi tiết nguyên nhân:', error.cause.message || error.cause);
    }
  }
};

runOrderTests();
