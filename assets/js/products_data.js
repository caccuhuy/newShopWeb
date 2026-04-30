// Dữ liệu 67 sản phẩm từ Excel (Đã sửa lỗi tiêu đề cột)
const MOCK_PRODUCTS = [
  {
    "id": 1,
    "brand": "Apple",
    "name": "Điện thoại iPhone 17 Pro Max 256GB",
    "price": 9500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/342679/iphone-17-pro-max-cam-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại iPhone 17 Pro Max 256GB chính hãng từ Apple.",
    "specs": {
      "OS": "iOS 26",
      "RAM": "Hãng không công bố",
      "Storage": "256 GB",
      "Battery": "37 giờ"
    }
  },
  {
    "id": 2,
    "brand": "OPPO",
    "name": "Điện thoại OPPO Reno15 5G 8GB/256GB",
    "price": 26500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/360238/oppo-reno15-5g-8gb-256gb-xanh-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại OPPO Reno15 5G 8GB/256GB chính hãng từ OPPO.",
    "specs": {
      "OS": "ColorOS 16 (Android 16)",
      "RAM": "8 GB",
      "Storage": "256 GB",
      "Battery": "6500 mAh"
    }
  },
  {
    "id": 3,
    "brand": "Vivo",
    "name": "Điện thoại vivo Y21d 6GB/128GB",
    "price": 16000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/358669/vivo-y21d-purple-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại vivo Y21d 6GB/128GB chính hãng từ Vivo.",
    "specs": {
      "OS": "Android 15",
      "RAM": "6 GB",
      "Storage": "128 GB",
      "Battery": "6500 mAh"
    }
  },
  {
    "id": 4,
    "brand": "Realme",
    "name": "Điện thoại realme 16 Pro 5G 12GB/256GB",
    "price": 14500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/361707/realme-16-pro-5g-12gb-256gb-tim-thumb-1-600x600.jpg",
    "description": "Sản phẩm Điện thoại realme 16 Pro 5G 12GB/256GB chính hãng từ Realme.",
    "specs": {
      "OS": "Android 16",
      "RAM": "12 GB",
      "Storage": "256 GB",
      "Battery": "7000 mAh"
    }
  },
  {
    "id": 5,
    "brand": "Apple",
    "name": "Điện thoại iPhone 16 Pro Max 256GB",
    "price": 23500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/329149/iphone-16-pro-max-sa-mac-thumb-1-600x600.jpg",
    "description": "Sản phẩm Điện thoại iPhone 16 Pro Max 256GB chính hãng từ Apple.",
    "specs": {
      "OS": "iOS 18",
      "RAM": "8 GB",
      "Storage": "256 GB",
      "Battery": "33 giờ"
    }
  },
  {
    "id": 6,
    "brand": "Apple",
    "name": "Điện thoại iPhone 17 256GB",
    "price": 5500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/342667/iphone-17-xanh-duong-thumb-2-600x600.jpg",
    "description": "Sản phẩm Điện thoại iPhone 17 256GB chính hãng từ Apple.",
    "specs": {
      "OS": "iOS 26",
      "RAM": "Hãng không công bố",
      "Storage": "256 GB",
      "Battery": "30 giờ"
    }
  },
  {
    "id": 7,
    "brand": "Samsung",
    "name": "Điện thoại Samsung Galaxy A07 4GB/64GB",
    "price": 19500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/341802/samsung-galaxy-a07-violet-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại Samsung Galaxy A07 4GB/64GB chính hãng từ Samsung.",
    "specs": {
      "OS": "Android 15",
      "RAM": "4 GB",
      "Storage": "64 GB",
      "Battery": "5000 mAh"
    }
  },
  {
    "id": 8,
    "brand": "OPPO",
    "name": "Điện thoại OPPO Reno15 Pro 5G 12GB/256GB",
    "price": 21000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/360236/oppo-reno15-pro-5g-12gb-256gb-xanh-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại OPPO Reno15 Pro 5G 12GB/256GB chính hãng từ OPPO.",
    "specs": {
      "OS": "ColorOS 16 (Android 16)",
      "RAM": "12 GB",
      "Storage": "256 GB",
      "Battery": "6200 mAh"
    }
  },
  {
    "id": 9,
    "brand": "Realme",
    "name": "Điện thoại realme 16 5G 8GB/256GB",
    "price": 26500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/361703/realme-16-5g-8gb-256gb-trang-thumb-1-600x600.jpg",
    "description": "Sản phẩm Điện thoại realme 16 5G 8GB/256GB chính hãng từ Realme.",
    "specs": {
      "OS": "Android 16",
      "RAM": "8 GB",
      "Storage": "256 GB",
      "Battery": "7000 mAh"
    }
  },
  {
    "id": 10,
    "brand": "HONOR",
    "name": "Điện thoại HONOR X9d 5G 12GB/256GB",
    "price": 17500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/358683/honor-x9d-5g-12gb-256gb-do-thumb-1-2-600x600.jpg",
    "description": "Sản phẩm Điện thoại HONOR X9d 5G 12GB/256GB chính hãng từ HONOR.",
    "specs": {
      "OS": "Android 15",
      "RAM": "12 GB",
      "Storage": "256 GB",
      "Battery": "8300 mAh"
    }
  },
  {
    "id": 11,
    "brand": "Samsung",
    "name": "Điện thoại Samsung Galaxy S25 Ultra 5G 12GB/256GB",
    "price": 23000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/333347/samsung-galaxy-s25-ultra-blue-thumbai-600x600.jpg",
    "description": "Sản phẩm Điện thoại Samsung Galaxy S25 Ultra 5G 12GB/256GB chính hãng từ Samsung.",
    "specs": {
      "OS": "Android 15",
      "RAM": "12 GB",
      "Storage": "256 GB",
      "Battery": "5000 mAh"
    }
  },
  {
    "id": 12,
    "brand": "Samsung",
    "name": "Điện thoại Samsung Galaxy A56 5G 12GB/256GB",
    "price": 8500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/334932/samsung-galaxy-a56-5g-gray-thumb-1-600x600.jpg",
    "description": "Sản phẩm Điện thoại Samsung Galaxy A56 5G 12GB/256GB chính hãng từ Samsung.",
    "specs": {
      "OS": "Android 15",
      "RAM": "12 GB",
      "Storage": "256 GB",
      "Battery": "5000 mAh"
    }
  },
  {
    "id": 13,
    "brand": "Samsung",
    "name": "Điện thoại Samsung Galaxy A36 5G 12GB/256GB",
    "price": 7500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/334930/samsung-galaxy-a36-5g-green-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại Samsung Galaxy A36 5G 12GB/256GB chính hãng từ Samsung.",
    "specs": {
      "OS": "Android 15",
      "RAM": "12 GB",
      "Storage": "256 GB",
      "Battery": "5000 mAh"
    }
  },
  {
    "id": 14,
    "brand": "Samsung",
    "name": "Điện thoại Samsung Galaxy S25 5G 12GB/256GB",
    "price": 33000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/333363/samsung-galaxy-s25-green-thumbai-600x600.jpg",
    "description": "Sản phẩm Điện thoại Samsung Galaxy S25 5G 12GB/256GB chính hãng từ Samsung.",
    "specs": {
      "OS": "Android 15",
      "RAM": "12 GB",
      "Storage": "256 GB",
      "Battery": "4000 mAh"
    }
  },
  {
    "id": 15,
    "brand": "Samsung",
    "name": "Điện thoại Samsung Galaxy Z Flip7 FE 5G 8GB/128GB",
    "price": 30500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/338741/samsung-galaxy-z-flip7-fe-black-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại Samsung Galaxy Z Flip7 FE 5G 8GB/128GB chính hãng từ Samsung.",
    "specs": {
      "OS": "Android 16",
      "RAM": "8 GB",
      "Storage": "128 GB",
      "Battery": "4000 mAh"
    }
  },
  {
    "id": 16,
    "brand": "Apple",
    "name": "Điện thoại iPhone Air 256GB",
    "price": 34500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/342670/iphone-air-vang-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại iPhone Air 256GB chính hãng từ Apple.",
    "specs": {
      "OS": "iOS 26",
      "RAM": "Hãng không công bố",
      "Storage": "256 GB",
      "Battery": "27 giờ"
    }
  },
  {
    "id": 17,
    "brand": "Apple",
    "name": "Điện thoại iPhone 14 128GB",
    "price": 21500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/240259/iPhone-14-plus-thumb-xanh-600x600.jpg",
    "description": "Sản phẩm Điện thoại iPhone 14 128GB chính hãng từ Apple.",
    "specs": {
      "OS": "iOS 17",
      "RAM": "6 GB",
      "Storage": "128 GB",
      "Battery": "3279 mAh"
    }
  },
  {
    "id": 18,
    "brand": "Apple",
    "name": "Điện thoại iPhone 16e 128GB",
    "price": 28000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/334864/iphone-16e-white-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại iPhone 16e 128GB chính hãng từ Apple.",
    "specs": {
      "OS": "iOS 18",
      "RAM": "8 GB",
      "Storage": "128 GB",
      "Battery": "26 giờ"
    }
  },
  {
    "id": 19,
    "brand": "Samsung",
    "name": "Điện thoại Samsung Galaxy Z Fold7 5G 12GB/256GB",
    "price": 29000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/338738/samsung-galaxy-z-fold7-black-thumb-1-600x600.jpg",
    "description": "Sản phẩm Điện thoại Samsung Galaxy Z Fold7 5G 12GB/256GB chính hãng từ Samsung.",
    "specs": {
      "OS": "Android 16",
      "RAM": "12 GB",
      "Storage": "256 GB",
      "Battery": "4400 mAh"
    }
  },
  {
    "id": 20,
    "brand": "Samsung",
    "name": "Điện thoại Samsung Galaxy A06 5G 6GB/128GB",
    "price": 14500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/335234/samsung-galaxy-a06-5g-black-thumbn-600x600.jpg",
    "description": "Sản phẩm Điện thoại Samsung Galaxy A06 5G 6GB/128GB chính hãng từ Samsung.",
    "specs": {
      "OS": "Android 15",
      "RAM": "6 GB",
      "Storage": "128 GB",
      "Battery": "5000 mAh"
    }
  },
  {
    "id": 21,
    "brand": "Samsung",
    "name": "Điện thoại Samsung Galaxy A17 5G 8GB/128GB",
    "price": 11500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/341688/galaxy-a17-5g-gray-thumbai-600x600.jpg",
    "description": "Sản phẩm Điện thoại Samsung Galaxy A17 5G 8GB/128GB chính hãng từ Samsung.",
    "specs": {
      "OS": "Android 15",
      "RAM": "8 GB",
      "Storage": "128 GB",
      "Battery": "5000 mAh"
    }
  },
  {
    "id": 22,
    "brand": "Samsung",
    "name": "Điện thoại Samsung Galaxy A17 4GB/128GB",
    "price": 29500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/341797/samsung-galaxy-a17-lte-xam-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại Samsung Galaxy A17 4GB/128GB chính hãng từ Samsung.",
    "specs": {
      "OS": "Android 15",
      "RAM": "4 GB",
      "Storage": "128 GB",
      "Battery": "5000 mAh"
    }
  },
  {
    "id": 23,
    "brand": "Samsung",
    "name": "Điện thoại Samsung Galaxy A07 5G 4GB/128GB",
    "price": 16500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/361709/samsung-galaxy-a07-5g-4gb-128gb-tim-xanh-600x600.jpg",
    "description": "Sản phẩm Điện thoại Samsung Galaxy A07 5G 4GB/128GB chính hãng từ Samsung.",
    "specs": {
      "OS": "Android 16",
      "RAM": "4 GB",
      "Storage": "128 GB",
      "Battery": "6000 mAh"
    }
  },
  {
    "id": 24,
    "brand": "Samsung",
    "name": "Điện thoại Samsung Galaxy S25 FE 5G 8GB/128GB",
    "price": 20000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/342560/samsung-galaxy-s25-fe-blue-thumbai-600x600.jpg",
    "description": "Sản phẩm Điện thoại Samsung Galaxy S25 FE 5G 8GB/128GB chính hãng từ Samsung.",
    "specs": {
      "OS": "Android 16",
      "RAM": "8 GB",
      "Storage": "128 GB",
      "Battery": "4900 mAh"
    }
  },
  {
    "id": 25,
    "brand": "Samsung",
    "name": "Điện thoại Samsung Galaxy S24 Ultra 5G 12GB/256GB",
    "price": 10500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-violet-thumbnew-600x600.jpg",
    "description": "Sản phẩm Điện thoại Samsung Galaxy S24 Ultra 5G 12GB/256GB chính hãng từ Samsung.",
    "specs": {
      "OS": "Android 14",
      "RAM": "12 GB",
      "Storage": "256 GB",
      "Battery": "5000 mAh"
    }
  },
  {
    "id": 26,
    "brand": "Xiaomi",
    "name": "Điện thoại Xiaomi Redmi Note 15 6GB/128GB",
    "price": 27500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/360302/xiaomi-redmi-note-15-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại Xiaomi Redmi Note 15 6GB/128GB chính hãng từ Xiaomi.",
    "specs": {
      "OS": "Xiaomi HyperOS 2",
      "RAM": "6 GB",
      "Storage": "128 GB",
      "Battery": "6000 mAh"
    }
  },
  {
    "id": 27,
    "brand": "Xiaomi",
    "name": "Điện thoại Xiaomi Redmi Note 15 5G 6GB/128GB",
    "price": 29500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/360310/xiaomi-redmi-note-15-5g-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại Xiaomi Redmi Note 15 5G 6GB/128GB chính hãng từ Xiaomi.",
    "specs": {
      "OS": "Xiaomi HyperOS 2",
      "RAM": "6 GB",
      "Storage": "128 GB",
      "Battery": "5520 mAh"
    }
  },
  {
    "id": 28,
    "brand": "Xiaomi",
    "name": "Điện thoại Xiaomi Redmi Note 15 Pro 5G 8GB/256GB",
    "price": 16500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/360312/xiaomi-redmi-note-15-pro-5g-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại Xiaomi Redmi Note 15 Pro 5G 8GB/256GB chính hãng từ Xiaomi.",
    "specs": {
      "OS": "Xiaomi HyperOS 2.2",
      "RAM": "8 GB",
      "Storage": "256 GB",
      "Battery": "6580 mAh"
    }
  },
  {
    "id": 29,
    "brand": "Xiaomi",
    "name": "Điện thoại Xiaomi Redmi Note 15 Pro 8GB/256GB",
    "price": 18500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/360307/xiaomi-redmi-note-15-pro-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại Xiaomi Redmi Note 15 Pro 8GB/256GB chính hãng từ Xiaomi.",
    "specs": {
      "OS": "Xiaomi HyperOS 2.2",
      "RAM": "8 GB",
      "Storage": "256 GB",
      "Battery": "6500 mAh"
    }
  },
  {
    "id": 30,
    "brand": "Xiaomi",
    "name": "Điện thoại Xiaomi Redmi Note 15 Pro+ 5G 12GB/256GB",
    "price": 18500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/360309/xiaomi-redmi-note-15-pro-plus-5g-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại Xiaomi Redmi Note 15 Pro+ 5G 12GB/256GB chính hãng từ Xiaomi.",
    "specs": {
      "OS": "Xiaomi HyperOS 2.2",
      "RAM": "12 GB",
      "Storage": "256 GB",
      "Battery": "6500 mAh"
    }
  },
  {
    "id": 31,
    "brand": "Xiaomi",
    "name": "Điện thoại Xiaomi 15T Pro 5G 12GB/512GB",
    "price": 20000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/356739/xiaomi-15t-pro-5g-12gb-512gb-xam-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại Xiaomi 15T Pro 5G 12GB/512GB chính hãng từ Xiaomi.",
    "specs": {
      "OS": "Android 15",
      "RAM": "12 GB",
      "Storage": "512 GB",
      "Battery": "5500 mAh"
    }
  },
  {
    "id": 32,
    "brand": "Xiaomi",
    "name": "Điện thoại Xiaomi Redmi 15C 6GB/128GB",
    "price": 27500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/346265/xiaomi-redmi-15c-6gb-128gb-xanh-la-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại Xiaomi Redmi 15C 6GB/128GB chính hãng từ Xiaomi.",
    "specs": {
      "OS": "Xiaomi HyperOS 2",
      "RAM": "6 GB",
      "Storage": "128 GB",
      "Battery": "6000 mAh"
    }
  },
  {
    "id": 33,
    "brand": "Xiaomi",
    "name": "Điện thoại Xiaomi Redmi 15 6GB/128GB",
    "price": 30000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/341272/xiaomi-redmi-15-tim-thumbnew-600x600.jpg",
    "description": "Sản phẩm Điện thoại Xiaomi Redmi 15 6GB/128GB chính hãng từ Xiaomi.",
    "specs": {
      "OS": "Android 15",
      "RAM": "6 GB",
      "Storage": "128 GB",
      "Battery": "7000 mAh"
    }
  },
  {
    "id": 34,
    "brand": "Xiaomi",
    "name": "Điện thoại Xiaomi 15T 5G 12GB/256GB",
    "price": 9500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/344644/xiaomi-15t-12gb-256gb-vang-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại Xiaomi 15T 5G 12GB/256GB chính hãng từ Xiaomi.",
    "specs": {
      "OS": "Android 15",
      "RAM": "12 GB",
      "Storage": "256 GB",
      "Battery": "5500 mAh"
    }
  },
  {
    "id": 35,
    "brand": "Xiaomi",
    "name": "Điện thoại Xiaomi Redmi 15 5G 4GB/128GB",
    "price": 32000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/359776/xiaomi-redmi-15-5g-4gb-128gb-xanh-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại Xiaomi Redmi 15 5G 4GB/128GB chính hãng từ Xiaomi.",
    "specs": {
      "OS": "Android 15 (Trên nền tảng Xiaomi Hyper OS 2.0)",
      "RAM": "4 GB",
      "Storage": "128 GB",
      "Battery": "7000 mAh"
    }
  },
  {
    "id": 36,
    "brand": "OPPO",
    "name": "Điện thoại OPPO Reno15 F 5G 8GB/256GB",
    "price": 13500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/360240/oppo-reno15f-5g-8gb-256gb-hong-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại OPPO Reno15 F 5G 8GB/256GB chính hãng từ OPPO.",
    "specs": {
      "OS": "ColorOS 16 (Android 16)",
      "RAM": "8 GB",
      "Storage": "256 GB",
      "Battery": "7000 mAh"
    }
  },
  {
    "id": 37,
    "brand": "OPPO",
    "name": "Điện thoại OPPO A6x 4GB/64GB",
    "price": 27000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/360244/oppo-a6x-4gb-64gb-tim-titan-thumb-1-600x600.jpg",
    "description": "Sản phẩm Điện thoại OPPO A6x 4GB/64GB chính hãng từ OPPO.",
    "specs": {
      "OS": "Android 15",
      "RAM": "4 GB",
      "Storage": "64 GB",
      "Battery": "6100 mAh"
    }
  },
  {
    "id": 38,
    "brand": "OPPO",
    "name": "Điện thoại OPPO Find X9 5G 12GB/256GB",
    "price": 16000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/344655/oppo-find-x9-black-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại OPPO Find X9 5G 12GB/256GB chính hãng từ OPPO.",
    "specs": {
      "OS": "Android 16",
      "RAM": "12 GB",
      "Storage": "256 GB",
      "Battery": "7025 mAh"
    }
  },
  {
    "id": 39,
    "brand": "OPPO",
    "name": "Điện thoại OPPO Find X9 Pro 5G 16GB/512GB",
    "price": 7000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/344652/oppo-find-x9-pro-white-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại OPPO Find X9 Pro 5G 16GB/512GB chính hãng từ OPPO.",
    "specs": {
      "OS": "Android 16",
      "RAM": "16 GB",
      "Storage": "512 GB",
      "Battery": "7500 mAh"
    }
  },
  {
    "id": 40,
    "brand": "OPPO",
    "name": "Điện thoại OPPO A6 Pro 8GB/128GB",
    "price": 22500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/344651/oppo-a6-pro-4g-pink-thumbai-600x600.jpg",
    "description": "Sản phẩm Điện thoại OPPO A6 Pro 8GB/128GB chính hãng từ OPPO.",
    "specs": {
      "OS": "Android 15",
      "RAM": "8 GB",
      "Storage": "128 GB",
      "Battery": "7000 mAh"
    }
  },
  {
    "id": 41,
    "brand": "OPPO",
    "name": "Điện thoại OPPO A6 Pro 5G 12GB/256GB",
    "price": 18500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/344649/oppo-a6-pro-5g-pink-thumbai-600x600.jpg",
    "description": "Sản phẩm Điện thoại OPPO A6 Pro 5G 12GB/256GB chính hãng từ OPPO.",
    "specs": {
      "OS": "Android 15",
      "RAM": "12 GB",
      "Storage": "256 GB",
      "Battery": "6500 mAh"
    }
  },
  {
    "id": 42,
    "brand": "OPPO",
    "name": "Điện thoại OPPO A6t 4GB/64GB",
    "price": 17500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/361191/oppo-a6t-4gb-64gb-xanh-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại OPPO A6t 4GB/64GB chính hãng từ OPPO.",
    "specs": {
      "OS": "Android 15",
      "RAM": "4 GB",
      "Storage": "64 GB",
      "Battery": "6100 mAh"
    }
  },
  {
    "id": 43,
    "brand": "OPPO",
    "name": "Điện thoại OPPO A5x 4GB/64GB",
    "price": 26500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/337846/oppo-a5x-4gb-64gb-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại OPPO A5x 4GB/64GB chính hãng từ OPPO.",
    "specs": {
      "OS": "Android 15",
      "RAM": "4 GB",
      "Storage": "64 GB",
      "Battery": "6000 mAh"
    }
  },
  {
    "id": 44,
    "brand": "OPPO",
    "name": "Điện thoại OPPO A5 8GB/128GB",
    "price": 9000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/341378/oppo-a5-8gb-128gb-xanh-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại OPPO A5 8GB/128GB chính hãng từ OPPO.",
    "specs": {
      "OS": "Android 15",
      "RAM": "8 GB",
      "Storage": "128 GB",
      "Battery": "6000 mAh"
    }
  },
  {
    "id": 45,
    "brand": "OPPO",
    "name": "Điện thoại OPPO Reno14 F 5G 12GB/256GB",
    "price": 8500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/339177/oppo-reno14-f-5g-12gb-256gb-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại OPPO Reno14 F 5G 12GB/256GB chính hãng từ OPPO.",
    "specs": {
      "OS": "Android 15",
      "RAM": "12 GB",
      "Storage": "256 GB",
      "Battery": "6000 mAh"
    }
  },
  {
    "id": 46,
    "brand": "Vivo",
    "name": "Điện thoại vivo X300 5G 12GB/256GB",
    "price": 20000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/357861/vivo-x300-hong-thumbai-600x600.jpg",
    "description": "Sản phẩm Điện thoại vivo X300 5G 12GB/256GB chính hãng từ Vivo.",
    "specs": {
      "OS": "Android 16",
      "RAM": "12 GB",
      "Storage": "256 GB",
      "Battery": "6040 mAh"
    }
  },
  {
    "id": 47,
    "brand": "Vivo",
    "name": "Điện thoại vivo X300 Pro 5G 16GB/512GB",
    "price": 11000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/357862/vivo-x300-pro-den-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại vivo X300 Pro 5G 16GB/512GB chính hãng từ Vivo.",
    "specs": {
      "OS": "Android 16",
      "RAM": "16 GB",
      "Storage": "512 GB",
      "Battery": "6510 mAh"
    }
  },
  {
    "id": 48,
    "brand": "Vivo",
    "name": "Điện thoại vivo V60 Lite 5G 8GB/256GB",
    "price": 34500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/357576/vivo-v60-lite-pink-thumbai-600x600.jpg",
    "description": "Sản phẩm Điện thoại vivo V60 Lite 5G 8GB/256GB chính hãng từ Vivo.",
    "specs": {
      "OS": "Android 15",
      "RAM": "8 GB",
      "Storage": "256 GB",
      "Battery": "6500 mAh"
    }
  },
  {
    "id": 49,
    "brand": "Vivo",
    "name": "Điện thoại vivo Y39 5G 8GB/128GB",
    "price": 6500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/339180/vivo-y39-5g-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại vivo Y39 5G 8GB/128GB chính hãng từ Vivo.",
    "specs": {
      "OS": "Android 15",
      "RAM": "8 GB",
      "Storage": "128 GB",
      "Battery": "6500 mAh"
    }
  },
  {
    "id": 50,
    "brand": "Vivo",
    "name": "Điện thoại vivo Y19s Pro 8GB/128GB",
    "price": 23500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/338918/vivo-y19s-pro-den-thumb-1-600x600.jpg",
    "description": "Sản phẩm Điện thoại vivo Y19s Pro 8GB/128GB chính hãng từ Vivo.",
    "specs": {
      "OS": "Android 15",
      "RAM": "8 GB",
      "Storage": "128 GB",
      "Battery": "6000 mAh"
    }
  },
  {
    "id": 51,
    "brand": "Vivo",
    "name": "Điện thoại vivo V60 5G 12GB/256GB",
    "price": 33000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/341625/vivo-v60-5g-xam-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại vivo V60 5G 12GB/256GB chính hãng từ Vivo.",
    "specs": {
      "OS": "Android 15",
      "RAM": "12 GB",
      "Storage": "256 GB",
      "Battery": "6500 mAh"
    }
  },
  {
    "id": 52,
    "brand": "Vivo",
    "name": "Điện thoại vivo Y04 4GB/128GB",
    "price": 30000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/335228/vivo-y04-green-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại vivo Y04 4GB/128GB chính hãng từ Vivo.",
    "specs": {
      "OS": "Android 14",
      "RAM": "4 GB",
      "Storage": "128 GB",
      "Battery": "5500 mAh"
    }
  },
  {
    "id": 53,
    "brand": "Vivo",
    "name": "Điện thoại vivo Y31d 6GB/128GB",
    "price": 10000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/360671/vivo-y31d-6gb-128gb-trang-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại vivo Y31d 6GB/128GB chính hãng từ Vivo.",
    "specs": {
      "OS": "Android 16",
      "RAM": "6 GB",
      "Storage": "128 GB",
      "Battery": "7200mAh"
    }
  },
  {
    "id": 54,
    "brand": "Vivo",
    "name": "Điện thoại vivo Y29 8GB/128GB",
    "price": 13500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/334226/vivo-y29-trang-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại vivo Y29 8GB/128GB chính hãng từ Vivo.",
    "specs": {
      "OS": "Android 15",
      "RAM": "8 GB",
      "Storage": "128 GB",
      "Battery": "6500 mAh"
    }
  },
  {
    "id": 55,
    "brand": "Vivo",
    "name": "Điện thoại vivo Y03 4GB/128GB",
    "price": 28500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/322996/vivo-y03-xanh-thumb-1-600x600.jpg",
    "description": "Sản phẩm Điện thoại vivo Y03 4GB/128GB chính hãng từ Vivo.",
    "specs": {
      "OS": "Android 14",
      "RAM": "4 GB",
      "Storage": "128 GB",
      "Battery": "5000 mAh"
    }
  },
  {
    "id": 56,
    "brand": "Vivo",
    "name": "Điện thoại vivo V40 Lite 8GB/256GB",
    "price": 16500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/329959/vivo-v40-lite-tim-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại vivo V40 Lite 8GB/256GB chính hãng từ Vivo.",
    "specs": {
      "OS": "Android 14",
      "RAM": "8 GB",
      "Storage": "256 GB",
      "Battery": "5000 mAh"
    }
  },
  {
    "id": 57,
    "brand": "Vivo",
    "name": "Điện thoại vivo V40 5G 12GB/256GB",
    "price": 6500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/331985/vivo-v40-5g-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại vivo V40 5G 12GB/256GB chính hãng từ Vivo.",
    "specs": {
      "OS": "Android 14",
      "RAM": "12 GB",
      "Storage": "256 GB",
      "Battery": "5500 mAh"
    }
  },
  {
    "id": 58,
    "brand": "Vivo",
    "name": "Điện thoại vivo V30e 5G 12GB/256GB",
    "price": 8500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/325136/vivo-v30e-nau-thumb-1-600x600.jpg",
    "description": "Sản phẩm Điện thoại vivo V30e 5G 12GB/256GB chính hãng từ Vivo.",
    "specs": {
      "OS": "Android 14",
      "RAM": "12 GB",
      "Storage": "256 GB",
      "Battery": "5500 mAh"
    }
  },
  {
    "id": 59,
    "brand": "Vivo",
    "name": "Điện thoại vivo Y28 8GB/256GB",
    "price": 9500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/326023/vivo-y28-xanh-thumbn-600x600.jpg",
    "description": "Sản phẩm Điện thoại vivo Y28 8GB/256GB chính hãng từ Vivo.",
    "specs": {
      "OS": "Android 14",
      "RAM": "8 GB",
      "Storage": "256 GB",
      "Battery": "6000 mAh"
    }
  },
  {
    "id": 60,
    "brand": "Realme",
    "name": "Điện thoại realme C85 8GB/128GB",
    "price": 15500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/360344/realme-c85-8gb-128gb-xanh-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại realme C85 8GB/128GB chính hãng từ Realme.",
    "specs": {
      "OS": "Android 15",
      "RAM": "8 GB",
      "Storage": "128 GB",
      "Battery": "7000 mAh"
    }
  },
  {
    "id": 61,
    "brand": "Realme",
    "name": "Điện thoại realme C85 5G 8GB/128GB",
    "price": 14000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/362760/realme-c85-green-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại realme C85 5G 8GB/128GB chính hãng từ Realme.",
    "specs": {
      "OS": "Android 15",
      "RAM": "8 GB",
      "Storage": "128 GB",
      "Battery": "7000 mAh"
    }
  },
  {
    "id": 62,
    "brand": "Realme",
    "name": "Điện thoại realme C85 Pro 8GB/128GB",
    "price": 32500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/357832/realme-c85-pro-purple-thumb-1-600x600.jpg",
    "description": "Sản phẩm Điện thoại realme C85 Pro 8GB/128GB chính hãng từ Realme.",
    "specs": {
      "OS": "Android 15",
      "RAM": "8 GB",
      "Storage": "128 GB",
      "Battery": "7000 mAh"
    }
  },
  {
    "id": 63,
    "brand": "Realme",
    "name": "Điện thoại realme 15T 5G 8GB/256GB",
    "price": 12500000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/343063/realme-15t-sliver-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại realme 15T 5G 8GB/256GB chính hãng từ Realme.",
    "specs": {
      "OS": "Android 15",
      "RAM": "8 GB",
      "Storage": "256 GB",
      "Battery": "7000 mAh"
    }
  },
  {
    "id": 64,
    "brand": "Realme",
    "name": "Điện thoại realme C71 4GB/128GB",
    "price": 7000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/337741/realme-c71-trang-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại realme C71 4GB/128GB chính hãng từ Realme.",
    "specs": {
      "OS": "Android 15",
      "RAM": "4 GB",
      "Storage": "128 GB",
      "Battery": "6300 mAh"
    }
  },
  {
    "id": 65,
    "brand": "Realme",
    "name": "Điện thoại realme Note 60x 3GB/64GB",
    "price": 16500000,
    "image_url": "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/333280/realme-note-60x-xanh-thumb-638702210952165468-600x600.jpg",
    "description": "Sản phẩm Điện thoại realme Note 60x 3GB/64GB chính hãng từ Realme.",
    "specs": {
      "OS": "Android 14",
      "RAM": "3 GB",
      "Storage": "64 GB",
      "Battery": "5000 mAh"
    }
  },
  {
    "id": 66,
    "brand": "Realme",
    "name": "Điện thoại realme Note 60 4GB/128GB",
    "price": 25000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/329329/realme-note-60-blue-thumb-600x600.jpg",
    "description": "Sản phẩm Điện thoại realme Note 60 4GB/128GB chính hãng từ Realme.",
    "specs": {
      "OS": "Android 14",
      "RAM": "4 GB",
      "Storage": "128 GB",
      "Battery": "5000 mAh"
    }
  },
  {
    "id": 67,
    "brand": "Apple",
    "name": "Điện thoại iPhone 16 Pro 1TB",
    "price": 17000000,
    "image_url": "https://cdn.tgdd.vn/Products/Images/42/329148/iphone-16-pro-den-600x600.jpg",
    "description": "Sản phẩm Điện thoại iPhone 16 Pro 1TB chính hãng từ Apple.",
    "specs": {
      "OS": "iOS 18",
      "RAM": "8 GB",
      "Storage": "1 TB",
      "Battery": "27 giờ"
    }
  }
];