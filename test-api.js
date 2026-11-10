const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5000/api';

const runTests = async () => {
  try {
    console.log('====================================================');
    console.log('   BẮT ĐẦU KỊCH BẢN KIỂM THỬ PHÂN HỆ HÀNG HÓA & DANH MỤC');
    console.log('====================================================\n');

    console.log('>>> Bước 1: Gửi yêu cầu POST tạo danh mục mới...');
    const categoryPayload = {
      name: 'Đồ uống',
      description: 'Các loại nước giải khát, nước ngọt và trà',
    };

    const createCategoryRes = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryPayload),
    });

    const categoryData = await createCategoryRes.json();

    if (createCategoryRes.status === 201 && categoryData.success) {
      console.log('Kết quả: [ĐẠT] Tạo danh mục thành công (Mã phản hồi: 201)');
      console.log('Dữ liệu trả về:', JSON.stringify(categoryData, null, 2));
    } else {
      console.log(`Kết quả: [THẤT BẠI] Tạo danh mục thất bại (Mã phản hồi: ${createCategoryRes.status})`);
      console.log('Dữ liệu trả về:', JSON.stringify(categoryData, null, 2));
      return;
    }

    const createdCategoryId = categoryData.data._id;
    console.log(`-> Đã lấy được ID danh mục: ${createdCategoryId}\n`);

    console.log('>>> Bước 2: Gửi yêu cầu POST tạo sản phẩm mới thuộc danh mục trên...');
    const uniqueBarcode = `SP${Date.now()}`;
    const productPayload = {
      barcode: uniqueBarcode,
      name: 'Trà Xanh Không Độ',
      retailPrice: 10000,
      categoryId: createdCategoryId,
      imageUrl: 'https://example.com/tra-xanh.jpg',
    };

    const createProductRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productPayload),
    });

    const productData = await createProductRes.json();

    if (createProductRes.status === 201 && productData.success) {
      console.log('Kết quả: [ĐẠT] Tạo sản phẩm thành công (Mã phản hồi: 201)');
      console.log('Dữ liệu trả về:', JSON.stringify(productData, null, 2));
    } else {
      console.log(`Kết quả: [THẤT BẠI] Tạo sản phẩm thất bại (Mã phản hồi: ${createProductRes.status})`);
      console.log('Dữ liệu trả về:', JSON.stringify(productData, null, 2));
      return;
    }

    const createdProductId = productData.data._id;
    console.log(`-> Đã lấy được ID sản phẩm: ${createdProductId}\n`);

    console.log('>>> Bước 3: Gửi yêu cầu GET kiểm tra danh sách danh mục...');
    const getCategoriesRes = await fetch(`${BASE_URL}/categories`);
    const allCategoriesData = await getCategoriesRes.json();

    if (getCategoriesRes.status === 200 && allCategoriesData.success) {
      const isCategoryExist = allCategoriesData.data.some(
        (cat) => cat._id === createdCategoryId
      );

      if (isCategoryExist) {
        console.log('Kết quả: [ĐẠT] Lấy danh sách thành công và đã tìm thấy danh mục vừa tạo (Mã phản hồi: 200)');
      } else {
        console.log('Kết quả: [THẤT BẠI] Lấy danh sách thành công nhưng không tìm thấy danh mục vừa tạo');
      }
      console.log(`Tổng số danh mục hiện tại: ${allCategoriesData.data.length}`);
      console.log('Dữ liệu trả về:', JSON.stringify(allCategoriesData, null, 2));
    } else {
      console.log(`Kết quả: [THẤT BẠI] Lấy danh sách danh mục thất bại (Mã phản hồi: ${getCategoriesRes.status})`);
      console.log('Dữ liệu trả về:', JSON.stringify(allCategoriesData, null, 2));
      return;
    }

    console.log('\n>>> Bước 4: Gửi yêu cầu GET kiểm tra danh sách sản phẩm và kiểm tra populate danh mục...');
    const getProductsRes = await fetch(`${BASE_URL}/products`);
    const allProductsData = await getProductsRes.json();

    if (getProductsRes.status === 200 && allProductsData.success) {
      const foundProduct = allProductsData.data.find(
        (prod) => prod._id === createdProductId
      );

      if (foundProduct) {
        console.log('Kết quả: [ĐẠT] Lấy danh sách thành công và đã tìm thấy sản phẩm vừa tạo trong cơ sở dữ liệu (Mã phản hồi: 200)');
        console.log('Thông tin danh mục đi kèm (Populate):', JSON.stringify(foundProduct.categoryId, null, 2));
      } else {
        console.log('Kết quả: [THẤT BẠI] Không tìm thấy sản phẩm vừa tạo trong cơ sở dữ liệu');
      }
      console.log(`Tổng số sản phẩm hiện tại: ${allProductsData.data.length}`);
      console.log('Dữ liệu trả về:', JSON.stringify(allProductsData, null, 2));
    } else {
      console.log(`Kết quả: [THẤT BẠI] Lấy danh sách sản phẩm thất bại (Mã phản hồi: ${getProductsRes.status})`);
      console.log('Dữ liệu trả về:', JSON.stringify(allProductsData, null, 2));
      return;
    }

    console.log('\n====================================================');
    console.log('   HOÀN THÀNH TẤT CẢ CÁC BƯỚC KIỂM THỬ VỚI KẾT QUẢ ĐẠT!');
    console.log('====================================================');
  } catch (error) {
    console.error('\n[LỖI HỆ THỐNG] Không thể hoàn thành quá trình kiểm thử:', error.message);
  }
};

runTests();
