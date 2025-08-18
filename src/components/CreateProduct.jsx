import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CreateProduct = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

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
        imageUrl: '',
        price: '',
        stock: '',
        category: ''
    });

    const categories = [
        { value: 'phone', label: 'Điện thoại' },
        { value: 'laptop', label: 'Laptop' },
        { value: 'fashion', label: 'Thời trang' },
        { value: 'home', label: 'Nhà cửa' },
        { value: 'books', label: 'Sách' },
        { value: 'sports', label: 'Thể thao' },
        { value: 'electronics', label: 'Điện tử' },
        { value: 'beauty', label: 'Làm đẹp' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Get authentication token
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

            // Prepare JSON data for API
            const productData = {
                name: formData.name,
                description: formData.description,
                imageUrl: formData.imageUrl || '',
                price: parseFloat(formData.price) || 0,
                stockQuantity: parseInt(formData.stock) || 0,
                category: formData.category
            };

            // Make API call with axios
            const response = await axios.post('http://localhost:8080/api/v1/user/product/add', productData, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });

            // Handle response based on API format
            if (response.data.statusCode === 200 && response.data.message === 'SUCCESS') {
                console.log('Product created successfully:', response.data.data);
                alert(`Sản phẩm "${response.data.data.name}" đã được tạo thành công!`);
                navigate('/products');
            } else {
                throw new Error(response.data.message || 'Tạo sản phẩm không thành công');
            }
        } catch (error) {
            console.error('Error creating product:', error);

            // Handle different error types
            if (error.response) {
                if (error.response.status === 401) {
                    alert('Vui lòng đăng nhập để tạo sản phẩm.');
                    navigate('/login');
                } else if (error.response.status === 403) {
                    alert('Bạn không có quyền tạo sản phẩm.');
                } else {
                    alert(`Có lỗi xảy ra: ${error.response.data?.message || error.message}`);
                }
            } else {
                alert(`Có lỗi xảy ra khi tạo sản phẩm: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
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
                                📝 Thông tin sản phẩm
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
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
                                        step="0.01"
                                        required
                                    />
                                </div>

                                {/* Stock Quantity */}
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

                                {/* Image URL */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        URL hình ảnh
                                    </label>
                                    <input
                                        type="url"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Nhập đường link hình ảnh sản phẩm
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mô tả sản phẩm
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Mô tả chi tiết về sản phẩm..."
                                />
                            </div>
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
