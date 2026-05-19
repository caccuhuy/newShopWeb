const ProductDAO = require('../dao/ProductDAO');
const AppError = require('../utils/AppError');
const path = require('path');
const fs = require('fs');

class ProductModule {
    static formatImageUrl(url, baseUrl) {
        if (url && url.startsWith('/uploads')) {
            return `${baseUrl}${url}`;
        }
        return url;
    }

    static parseSpecs(specsJson) {
        try {
            return specsJson ? JSON.parse(specsJson) : {};
        } catch (err) {
            return {};
        }
    }

    // 1. Lấy tất cả sản phẩm cho Admin
    static async getAllAdmin(baseUrl) {
        const rawProducts = await ProductDAO.getAllAdmin();
        return rawProducts.map(product => ({
            id: product.product_id,
            name: product.product_name,
            brand: product.brand,
            price: product.unit_price,
            image_url: ProductModule.formatImageUrl(product.image_url, baseUrl),
            specs: ProductModule.parseSpecs(product.specs_json),
            specs_json: product.specs_json,
            cat_id: product.cat_id,
            category: product.category_name,
            stock: product.stock,
            warranty_period: product.warranty_period,
            description: product.description || ''
        }));
    }

    // 2. Lấy tất cả sản phẩm cho Customer
    static async getAllCustomer(baseUrl) {
        const rawProducts = await ProductDAO.getAllCustomer();
        return rawProducts.map(product => ({
            id: product.product_id,
            name: product.product_name,
            brand: product.brand,
            price: product.unit_price,
            image_url: ProductModule.formatImageUrl(product.image_url, baseUrl),
            specs: ProductModule.parseSpecs(product.specs_json),
            category: product.category_name,
            stock: product.stock
        }));
    }

    // 3. Tìm kiếm và lọc sản phẩm cho Customer
    static async searchProducts(query, category, brand, minPrice, maxPrice, baseUrl) {
        const parsedMin = minPrice ? Number(minPrice) : null;
        const parsedMax = maxPrice ? Number(maxPrice) : null;

        const rawProducts = await ProductDAO.searchProducts(query, category, brand, parsedMin, parsedMax);
        return rawProducts.map(product => ({
            id: product.product_id,
            name: product.product_name,
            brand: product.brand,
            price: product.unit_price,
            image_url: ProductModule.formatImageUrl(product.image_url, baseUrl),
            specs: ProductModule.parseSpecs(product.specs_json),
            category: product.category_name,
            stock: product.stock
        }));
    }

    // 4. Lấy chi tiết sản phẩm
    static async getById(id, baseUrl) {
        if (!id) throw new AppError('Mã sản phẩm không hợp lệ', 400);
        
        const product = await ProductDAO.getById(id);
        if (!product) {
            throw new AppError('Không tìm thấy sản phẩm', 404);
        }

        return {
            id: product.product_id,
            name: product.product_name,
            brand: product.brand,
            price: product.unit_price,
            image_url: ProductModule.formatImageUrl(product.image_url, baseUrl),
            specs: ProductModule.parseSpecs(product.specs_json),
            specs_json: product.specs_json,
            cat_id: product.cat_id,
            category: product.category_name,
            stock: product.stock,
            warranty_period: product.warranty_period,
            description: product.description || ''
        };
    }

    // 5. Thêm sản phẩm mới (Admin)
    static async create(name, cat_id, specs_json, price, brand, warranty, imageUrl) {
        if (!name || !cat_id || !price) {
            throw new AppError('Thông tin sản phẩm không đầy đủ (Tên, Danh mục, Giá bán là bắt buộc)', 400);
        }

        await ProductDAO.create(name, cat_id, specs_json, price, brand, warranty, imageUrl);
        return { message: 'Product created' };
    }

    // 6. Cập nhật sản phẩm (Admin)
    static async update(id, name, cat_id, specs_json, price, brand, warranty, imageUrl) {
        if (!id) throw new AppError('Mã sản phẩm không hợp lệ', 400);
        if (!name || !cat_id || !price) {
            throw new AppError('Thông tin sản phẩm không đầy đủ (Tên, Danh mục, Giá bán là bắt buộc)', 400);
        }

        await ProductDAO.update(id, name, cat_id, specs_json, price, brand, warranty, imageUrl);
        return { message: 'Product updated' };
    }

    // 7. Xóa sản phẩm (Admin)
    static async delete(id) {
        if (!id) throw new AppError('Mã sản phẩm không hợp lệ', 400);

        const prod = await ProductDAO.getProductImage(id);
        if (!prod) {
            throw new AppError('Sản phẩm không tồn tại.', 404);
        }

        const imgUrl = prod.image_url;

        // DB constraints check
        const result = await ProductDAO.deleteWithCheck(id);
        if (result.isDeleted === 0) {
            throw new AppError('Không thể xóa sản phẩm đã có giao dịch.', 400);
        }

        // Delete physical file
        if (imgUrl && imgUrl.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, '../public', imgUrl);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (unlinkErr) {
                    console.error('Delete product physical file error:', unlinkErr);
                }
            }
        }

        return { message: 'Product deleted' };
    }
}

module.exports = ProductModule;
