const { sql, poolPromise } = require('../config/db');

class ProductDAO {
    // 1. Lấy tất cả sản phẩm phía Admin
    static async getAllAdmin() {
        const pool = await poolPromise;
        const result = await pool.request().execute('vw_GetAllProducts');
        return result.recordset;
    }

    // 2. Lấy tất cả sản phẩm phía Customer
    static async getAllCustomer() {
        const pool = await poolPromise;
        const result = await pool.request().execute('vw_CustomerProducts');
        return result.recordset;
    }

    // 3. Tìm kiếm sản phẩm khách hàng
    static async searchProducts(query, category, brand, minPrice, maxPrice) {
        const pool = await poolPromise;
        const request = pool.request();
        
        request.input('query', sql.NVarChar, query || null);
        request.input('category', sql.NVarChar, category || null);
        request.input('brand', sql.NVarChar, brand || null);
        request.input('minPrice', sql.Decimal(18, 2), minPrice || null);
        request.input('maxPrice', sql.Decimal(18, 2), maxPrice || null);

        const result = await request.execute('sp_SearchProducts');
        return result.recordset;
    }

    // 4. Lấy chi tiết 1 sản phẩm
    static async getById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .execute('sp_GetProductDetails');
        return result.recordset[0];
    }

    // 5. Thêm sản phẩm
    static async create(name, cat_id, specs_json, price, brand, warranty, imageUrl) {
        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('cat', sql.Int, cat_id)
            .input('specs', sql.NVarChar, specs_json)
            .input('price', sql.Decimal(15, 2), price)
            .input('brand', sql.VarChar, brand)
            .input('warranty', sql.Int, warranty)
            .input('img', sql.VarChar, imageUrl)
            .execute('sp_AddProducts');
    }

    // 6. Cập nhật sản phẩm
    static async update(id, name, cat_id, specs_json, price, brand, warranty, imageUrl) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .input('cat', sql.Int, cat_id)
            .input('specs', sql.NVarChar, specs_json)
            .input('price', sql.Decimal(18, 2), price)
            .input('brand', sql.VarChar, brand)
            .input('warranty', sql.Int, warranty)
            .input('img', sql.VarChar, imageUrl)
            .execute('sp_AlterProducts');
    }

    // 7. Lấy ảnh sản phẩm để xóa vật lý
    static async getProductImage(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query("SELECT image_url FROM Product WHERE product_id = @id");
        return result.recordset[0];
    }

    // 8. Xóa sản phẩm với check ràng buộc
    static async deleteWithCheck(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .execute('sp_DeleteProductWithCheck');
        return result.recordset[0];
    }
}

module.exports = ProductDAO;
