import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import Modal from '../../../components/common/Modal/Modal';
import AlertModal from '../../../components/common/Modal/AlertModal';
import { apiService } from '../../../services/apiService';
import { Package, FolderTree, Plus, Edit, Trash2, Image as ImageIcon, Search } from 'lucide-react';
import styles from './ProductManagementPage.module.css';
import { clsx } from 'clsx';

const ProductManagementPage = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filterCategory, setFilterCategory] = useState('');
    const [filterBrand, setFilterBrand] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // UI States
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'info', title: '', message: '' });
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
    const [showProductModal, setShowProductModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);

    // Form States
    const [productForm, setProductForm] = useState({
        product_name: '', cat_id: '', unit_price: '', brand: '', warranty_period: '', specs_json: '{}'
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [catName, setCatName] = useState('');

    const loadData = useCallback(async () => {
        try {
            const [prodData, catData] = await Promise.all([
                apiService.getProducts(),
                apiService.getCategories()
            ]);
            setProducts(prodData);
            setCategories(catData);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Product Handlers
    const handleAddProduct = () => {
        setEditingProduct(null);
        setProductForm({ product_name: '', cat_id: categories[0]?.cat_id || '', unit_price: '', brand: '', warranty_period: '', specs_json: '{}' });
        setSpecData([{ section: '', fields: [{ key: '', value: '' }] }]);
        setSelectedFile(null);
        setShowProductModal(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setProductForm({
            product_name: product.name,
            cat_id: product.cat_id,
            unit_price: product.price,
            brand: product.brand,
            warranty_period: product.warranty_period,
            specs_json: product.specs_json || '{}'
        });
        setSpecData(parseSpecs(product.specs_json));
        setSelectedFile(null);
        setShowProductModal(true);
    };

    const saveProduct = async (e) => {
        e.preventDefault();
        
        // Process specs
        const finalSpecs = {};
        specData.forEach(s => {
            const fieldsObj = {};
            s.fields.forEach(f => {
                if (f.key.trim()) fieldsObj[f.key.trim()] = f.value;
            });

            if (Object.keys(fieldsObj).length > 0) {
                if (s.section.trim()) {
                    finalSpecs[s.section.trim()] = fieldsObj;
                } else {
                    Object.assign(finalSpecs, fieldsObj);
                }
            }
        });

        const formData = new FormData();
        Object.keys(productForm).forEach(key => {
            if (key === 'specs_json') {
                formData.append(key, JSON.stringify(finalSpecs));
            } else {
                formData.append(key, productForm[key]);
            }
        });
        if (selectedFile) formData.append('image', selectedFile);

        try {
            if (editingProduct) {
                await apiService.updateProduct(editingProduct.id, formData);
            } else {
                await apiService.addProduct(formData);
            }
            setShowProductModal(false);
            loadData();
            setAlertConfig({ isOpen: true, type: 'success', title: 'Thành công', message: 'Lưu sản phẩm thành công!' });
        } catch (error) {
            setAlertConfig({ isOpen: true, type: 'error', title: 'Lỗi', message: error.message });
        }
    };

    const deleteProduct = (id) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Xóa sản phẩm',
            message: 'Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.',
            onConfirm: async () => {
                setConfirmConfig({ ...confirmConfig, isOpen: false });
                try {
                    await apiService.deleteProduct(id);
                    loadData();
                    setAlertConfig({ isOpen: true, type: 'success', title: 'Thành công', message: 'Xóa sản phẩm thành công!' });
                } catch (error) {
                    setAlertConfig({ isOpen: true, type: 'error', title: 'Lỗi', message: error.message });
                }
            }
        });
    };

    // Category Handlers
    const handleAddCategory = () => {
        setEditingCategory(null);
        setCatName('');
        setShowCategoryModal(true);
    };

    const saveCategory = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await apiService.updateCategory(editingCategory.cat_id, catName);
            } else {
                await apiService.addCategory(catName);
            }
            setShowCategoryModal(false);
            loadData();
            setAlertConfig({ isOpen: true, type: 'success', title: 'Thành công', message: 'Lưu danh mục thành công!' });
        } catch (error) {
            setAlertConfig({ isOpen: true, type: 'error', title: 'Lỗi', message: error.message });
        }
    };

    const deleteCategory = (id) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Xóa danh mục',
            message: 'Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.',
            onConfirm: async () => {
                setConfirmConfig({ ...confirmConfig, isOpen: false });
                try {
                    await apiService.deleteCategory(id);
                    loadData();
                    setAlertConfig({ isOpen: true, type: 'success', title: 'Thành công', message: 'Xóa danh mục thành công!' });
                } catch (error) {
                    setAlertConfig({ isOpen: true, type: 'error', title: 'Lỗi', message: error.message });
                }
            }
        });
    };

    // Unique brands for filter
    const brands = [...new Set(products.map(p => p.brand))].filter(Boolean).sort();

    // Filtering Logic
    const filteredProducts = products.filter(p => {
        const matchesSearch = (p.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                             (p.brand || '').toLowerCase().includes((searchTerm || '').toLowerCase());
        const matchesCategory = filterCategory === '' || p.cat_id?.toString() === filterCategory;
        const matchesBrand = filterBrand === '' || p.brand === filterBrand;
        return matchesSearch && matchesCategory && matchesBrand;
    });

    const filteredCategories = categories.filter(cat => 
        (cat.cat_name || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    );

    // Spec Handling
    const [specData, setSpecData] = useState([{ section: '', fields: [{ key: '', value: '' }] }]);

    const parseSpecs = (json) => {
        try {
            const obj = JSON.parse(json || '{}');
            const sections = [];
            const mainFields = [];

            Object.entries(obj).forEach(([key, value]) => {
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    sections.push({
                        section: key,
                        fields: Object.entries(value).map(([k, v]) => ({ key: k, value: String(v) }))
                    });
                } else {
                    mainFields.push({ key, value: String(value) });
                }
            });

            const result = [];
            if (mainFields.length > 0 || sections.length === 0) {
                result.push({ section: '', fields: mainFields.length > 0 ? mainFields : [{ key: '', value: '' }] });
            }
            return result.concat(sections);
        } catch {
            return [{ section: '', fields: [{ key: '', value: '' }] }];
        }
    };

    const handleAddSpecSection = () => {
        setSpecData([...specData, { section: '', fields: [{ key: '', value: '' }] }]);
    };

    const handleRemoveSpecSection = (index) => {
        const newData = [...specData];
        newData.splice(index, 1);
        setSpecData(newData);
    };

    const handleAddSpecField = (sectionIndex) => {
        const newData = [...specData];
        newData[sectionIndex].fields.push({ key: '', value: '' });
        setSpecData(newData);
    };

    const handleRemoveSpecField = (sectionIndex, fieldIndex) => {
        const newData = [...specData];
        newData[sectionIndex].fields.splice(fieldIndex, 1);
        setSpecData(newData);
    };

    const handleSpecChange = (sectionIndex, fieldIndex, field, value) => {
        const newData = [...specData];
        if (fieldIndex === null) {
            newData[sectionIndex].section = value;
        } else {
            newData[sectionIndex].fields[fieldIndex][field] = value;
        }
        setSpecData(newData);
    };

    return (
        <AdminLayout>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.tabs}>
                        <button 
                            className={clsx(styles.tabBtn, activeTab === 'products' && styles.activeTab)}
                            onClick={() => setActiveTab('products')}
                        >
                            <Package size={18} /> <span>Sản phẩm</span>
                        </button>
                        <button 
                            className={clsx(styles.tabBtn, activeTab === 'categories' && styles.activeTab)}
                            onClick={() => setActiveTab('categories')}
                        >
                            <FolderTree size={18} /> <span>Loại sản phẩm</span>
                        </button>
                    </div>
                    <button className={styles.btnPrimary} onClick={activeTab === 'products' ? handleAddProduct : handleAddCategory}>
                        <Plus size={16} /> {activeTab === 'products' ? 'Thêm sản phẩm' : 'Thêm loại SP'}
                    </button>
                </header>

                {activeTab === 'products' ? (
                    <section className={styles.tableSection}>
                        <div className={styles.tableToolbar}>
                            <h3 className={styles.sectionTitle}>Danh sách sản phẩm</h3>
                            <div className={styles.filterGroup}>
                                <div className={styles.searchBox}>
                                    <Search size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Tìm kiếm sản phẩm..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select 
                                    className={styles.filterSelect}
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                >
                                    <option value="">Tất cả danh mục</option>
                                    {categories.map(cat => (
                                        <option key={cat.cat_id} value={cat.cat_id}>{cat.cat_name}</option>
                                    ))}
                                </select>
                                <select 
                                    className={styles.filterSelect}
                                    value={filterBrand}
                                    onChange={(e) => setFilterBrand(e.target.value)}
                                >
                                    <option value="">Tất cả thương hiệu</option>
                                    {brands.map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Hình ảnh</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Danh mục</th>
                                    <th>Đơn giá</th>
                                    <th>Số lượng</th>
                                    <th>Thương hiệu</th>
                                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <div className={styles.imgBox}>
                                                {p.image_url ? (
                                                    <img src={p.image_url} alt={p.name} />
                                                ) : (
                                                    <ImageIcon size={20} className={styles.placeholderIcon} />
                                                )}
                                            </div>
                                        </td>
                                        <td><span className={styles.textBold}>{p.name}</span></td>
                                        <td><span className={styles.categoryBadge}>{p.category}</span></td>
                                        <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</td>
                                        <td>
                                            <span className={clsx(
                                                styles.stockValue,
                                                p.stock > 10 ? styles.stockGood : 
                                                p.stock > 0 ? styles.stockLow : styles.stockEmpty
                                            )}>
                                                {p.stock || 0}
                                            </span>
                                        </td>
                                        <td>{p.brand}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button className={styles.editBtn} onClick={() => handleEditProduct(p)}><Edit size={14} /></button>
                                                <button className={styles.deleteBtn} onClick={() => deleteProduct(p.id)}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                ) : (
                    <section className={styles.tableSection}>
                        <div className={styles.tableToolbar}>
                            <h3 className={styles.sectionTitle}>Danh mục sản phẩm</h3>
                            <div className={styles.searchBox}>
                                <Search size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm danh mục..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: '150px' }}>Mã loại</th>
                                    <th>Tên danh mục</th>
                                    <th style={{ textAlign: 'right', width: '120px' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCategories.map(cat => (
                                    <tr key={cat.cat_id}>
                                        <td>{cat.cat_id}</td>
                                        <td><span className={styles.textBold}>{cat.cat_name}</span></td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button className={styles.editBtn} onClick={() => { setEditingCategory(cat); setCatName(cat.cat_name); setShowCategoryModal(true); }}><Edit size={14} /></button>
                                                <button className={styles.deleteBtn} onClick={() => deleteCategory(cat.cat_id)}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {/* Product Modal */}
                <Modal 
                    isOpen={showProductModal} 
                    onClose={() => setShowProductModal(false)} 
                    title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
                >
                    <form onSubmit={saveProduct} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Tên sản phẩm</label>
                            <input type="text" value={productForm.product_name} onChange={e => setProductForm({...productForm, product_name: e.target.value})} required />
                        </div>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Danh mục</label>
                                <select value={productForm.cat_id} onChange={e => setProductForm({...productForm, cat_id: e.target.value})} required>
                                    {categories.map(cat => <option key={cat.cat_id} value={cat.cat_id}>{cat.cat_name}</option>)}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Thương hiệu</label>
                                <input type="text" value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value})} required />
                            </div>
                        </div>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Đơn giá (VNĐ)</label>
                                <input type="number" value={productForm.unit_price} onChange={e => setProductForm({...productForm, unit_price: e.target.value})} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Bảo hành (tháng)</label>
                                <input type="number" value={productForm.warranty_period} onChange={e => setProductForm({...productForm, warranty_period: e.target.value})} required />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Hình ảnh</label>
                            <input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files[0])} />
                            {editingProduct && !selectedFile && <p className={styles.note}>* Để trống nếu muốn giữ ảnh cũ</p>}
                        </div>
                        <div className={styles.specEditor}>
                            <label className={styles.specMainLabel}>Thông số kỹ thuật</label>
                            {specData.map((section, sIdx) => (
                                <div key={sIdx} className={styles.specSection}>
                                    <div className={styles.sectionHeader}>
                                        <input 
                                            type="text" 
                                            placeholder="Tên nhóm (ví dụ: Màn hình, CPU...)" 
                                            className={styles.sectionInput}
                                            value={section.section}
                                            onChange={(e) => handleSpecChange(sIdx, null, 'section', e.target.value)}
                                        />
                                        <button type="button" className={styles.removeSectionBtn} onClick={() => handleRemoveSpecSection(sIdx)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className={styles.fieldsList}>
                                        {section.fields.map((field, fIdx) => (
                                            <div key={fIdx} className={styles.fieldRow}>
                                                <input 
                                                    type="text" 
                                                    placeholder="Tên thông số" 
                                                    value={field.key}
                                                    onChange={(e) => handleSpecChange(sIdx, fIdx, 'key', e.target.value)}
                                                    required
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Giá trị" 
                                                    value={field.value}
                                                    onChange={(e) => handleSpecChange(sIdx, fIdx, 'value', e.target.value)}
                                                />
                                                <button type="button" className={styles.removeFieldBtn} onClick={() => handleRemoveSpecField(sIdx, fIdx)}>
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <button type="button" className={styles.addFieldBtn} onClick={() => handleAddSpecField(sIdx)}>
                                            <Plus size={12} /> Thêm thông số
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" className={styles.addSectionBtn} onClick={handleAddSpecSection}>
                                <Plus size={14} /> Thêm nhóm thông số
                            </button>
                        </div>
                        <button type="submit" className={styles.submitBtn}>{editingProduct ? 'Cập nhật' : 'Tạo mới'}</button>
                    </form>
                </Modal>

                {/* Category Modal */}
                <Modal 
                    isOpen={showCategoryModal} 
                    onClose={() => setShowCategoryModal(false)} 
                    title={editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
                >
                    <form onSubmit={saveCategory} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Tên danh mục</label>
                            <input type="text" value={catName} onChange={e => setCatName(e.target.value)} required />
                        </div>
                        <button type="submit" className={styles.submitBtn}>{editingCategory ? 'Cập nhật' : 'Tạo mới'}</button>
                    </form>
                </Modal>

                <AlertModal 
                    isOpen={alertConfig.isOpen}
                    onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                    type={alertConfig.type}
                    title={alertConfig.title}
                    message={alertConfig.message}
                />
                <AlertModal 
                    isOpen={confirmConfig.isOpen}
                    onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
                    type="warning"
                    title={confirmConfig.title}
                    message={confirmConfig.message}
                    onConfirm={confirmConfig.onConfirm}
                />
            </div>
        </AdminLayout>
    );
};

export default ProductManagementPage;
