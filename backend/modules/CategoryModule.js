const CategoryDAO = require('../dao/CategoryDAO');
const AppError = require('../utils/AppError');

class CategoryModule {
    static async getAll() {
        return await CategoryDAO.getAll();
    }

    static async create(name) {
        if (!name) {
            throw new AppError('Tên danh mục không được để trống', 400);
        }
        await CategoryDAO.create(name);
        return { message: 'Category created' };
    }

    static async update(id, name) {
        if (!id) {
            throw new AppError('Mã danh mục không hợp lệ', 400);
        }
        if (!name) {
            throw new AppError('Tên danh mục không được để trống', 400);
        }
        await CategoryDAO.update(id, name);
        return { message: 'Category updated' };
    }

    static async delete(id) {
        if (!id) {
            throw new AppError('Mã danh mục không hợp lệ', 400);
        }
        try {
            await CategoryDAO.delete(id);
            return { message: 'Category deleted' };
        } catch (err) {
            // DB will throw error if there are dependent products
            if (err.message.includes('REFERENCE constraint') || err.message.includes('ràng buộc')) {
                throw new AppError('Không thể xóa danh mục này vì đang có sản phẩm thuộc danh mục', 400);
            }
            throw err;
        }
    }
}

module.exports = CategoryModule;
