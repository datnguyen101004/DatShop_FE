import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CreateProduct = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login', {
                state: { from: { pathname: '/create-product' } }
            });
        }
    }, [isAuthenticated, navigate]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        shortDescription: '',
        price: '',
        originalPrice: '',
        category: '',
        brand: '',
        stock: '',
        images: [],
        specifications: {
            warranty: '',
            origin: '',
            material: '',
            size: '',
            weight: '',
            color: ''
        },
        features: [],
        tags: ''
    });

    const [newFeature, setNewFeature] = useState('');

    const categories = [
        { value: 'electronics', label: 'Điện tử' },
        { value: 'fashion', label: 'Thời trang' },
        { value: 'home', label: 'Nhà cửa' },
        { value: 'books', label: 'Sách' },
        { value: 'sports', label: 'Thể thao' },
        { value: 'beauty', label: 'Làm đẹp' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('spec_')) {
            const specName = name.replace('spec_', '');
            setFormData(prev => ({
                ...prev,
                specifications: {
                    ...prev.specifications,
                    [specName]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        // Create preview for first image
        if (files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(files[0]);
        }

        setFormData(prev => ({
            ...prev,
            images: files
        }));
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, newFeature.trim()]
            }));
            setNewFeature('');
        }
    };

    const removeFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Simulate API call - trong thực tế sẽ gửi dữ liệu lên server
            const productData = {
                ...formData,
                id: Date.now(), // Temporary ID generation
                createdAt: new Date().toISOString(),
                rating: 0,
                reviews: 0,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            };

            // Log the product data (trong thực tế sẽ gửi POST request)
            console.log('Creating product:', productData);

            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 2000));

            alert('Sản phẩm đã được tạo thành công!');
            navigate('/products');
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Có lỗi xảy ra khi tạo sản phẩm. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">{/* Added pt-20 for navbar space */}

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        ✨ Thêm sản phẩm mới
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Tạo sản phẩm mới cho cửa hàng của bạn
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Information */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                                📝 Thông tin cơ bản
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Product Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tên sản phẩm *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Nhập tên sản phẩm"
                                        required
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Danh mục *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        required
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map(category => (
                                            <option key={category.value} value={category.value}>
                                                {category.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Brand */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Thương hiệu
                                    </label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Nhập thương hiệu"
                                    />
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Giá bán *
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="0"
                                        min="0"
                                        required
                                    />
                                </div>

                                {/* Original Price */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Giá gốc
                                    </label>
                                    <input
                                        type="number"
                                        name="originalPrice"
                                        value={formData.originalPrice}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>

                                {/* Stock */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Số lượng tồn kho *
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="0"
                                        min="0"
                                        required
                                    />
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tags (phân cách bằng dấu phẩy)
                                    </label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="hot, sale, new..."
                                    />
                                </div>
                            </div>

                            {/* Short Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mô tả ngắn
                                </label>
                                <textarea
                                    name="shortDescription"
                                    value={formData.shortDescription}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Mô tả ngắn gọn về sản phẩm"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mô tả chi tiết
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Mô tả chi tiết về sản phẩm"
                                />
                            </div>
                        </div>

                        {/* Images */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                                🖼️ Hình ảnh sản phẩm
                            </h2>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Upload hình ảnh
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                {imagePreview && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Specifications */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                                ⚙️ Thông số kỹ thuật
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Bảo hành
                                    </label>
                                    <input
                                        type="text"
                                        name="spec_warranty"
                                        value={formData.specifications.warranty}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="12 tháng"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Xuất xứ
                                    </label>
                                    <input
                                        type="text"
                                        name="spec_origin"
                                        value={formData.specifications.origin}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Việt Nam"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Chất liệu
                                    </label>
                                    <input
                                        type="text"
                                        name="spec_material"
                                        value={formData.specifications.material}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Nhôm, Thép..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Kích thước
                                    </label>
                                    <input
                                        type="text"
                                        name="spec_size"
                                        value={formData.specifications.size}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="100 x 50 x 20 cm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Cân nặng
                                    </label>
                                    <input
                                        type="text"
                                        name="spec_weight"
                                        value={formData.specifications.weight}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="1.5 kg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Màu sắc
                                    </label>
                                    <input
                                        type="text"
                                        name="spec_color"
                                        value={formData.specifications.color}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Đen, Trắng, Xanh..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                                ✨ Tính năng nổi bật
                            </h2>

                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Nhập tính năng mới"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                />
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                                >
                                    Thêm
                                </button>
                            </div>

                            {formData.features.length > 0 && (
                                <div className="space-y-2">
                                    {formData.features.map((feature, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                            <span className="text-gray-700">• {feature}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(index)}
                                                className="text-red-500 hover:text-red-700 font-bold"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        ⏳ Đang tạo sản phẩm...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        ✨ Tạo sản phẩm
                                    </span>
                                )}
                            </button>

                            <Link
                                to="/products"
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 text-center"
                            >
                                Hủy bỏ
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateProduct;