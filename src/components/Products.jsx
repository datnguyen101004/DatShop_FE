import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Products = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('default');
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated, user } = useAuth();

    // Danh sách categories - sẽ được cập nhật dựa trên data từ API
    const getUniqueCategories = (products) => {
        const uniqueCats = [...new Set(products.map(p => p.category).filter(Boolean))];
        return [
            { id: 'all', name: 'Tất cả', count: products.length },
            ...uniqueCats.map(cat => ({
                id: cat,
                name: cat.charAt(0).toUpperCase() + cat.slice(1), // Capitalize first letter
                count: products.filter(p => p.category === cat).length
            }))
        ];
    };

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);

                // Get token from localStorage or sessionStorage
                const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

                const response = await axios.get('http://localhost:8080/api/v1/user/product/all', {
                    headers: {
                        ...(token && { 'Authorization': `Bearer ${token}` })
                    }
                });

                // Handle response based on API format
                if (response.data.statusCode === 200 && response.data.message === 'SUCCESS') {
                    setAllProducts(response.data.data || []);
                    setError(null);
                } else {
                    throw new Error(response.data.message || 'Không thể tải danh sách sản phẩm');
                }
            } catch (err) {
                console.error('Error fetching products:', err);

                // Handle different types of errors
                if (err.response) {
                    if (err.response.status === 401) {
                        setError('Vui lòng đăng nhập để xem sản phẩm.');
                    } else if (err.response.status === 403) {
                        setError('Bạn không có quyền truy cập danh sách sản phẩm.');
                    } else {
                        setError(err.response.data?.message || 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
                    }
                } else {
                    setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Update category counts based on fetched products
    const availableCategories = getUniqueCategories(allProducts);

    // Filter products based on selected category
    const filteredProducts = selectedCategory === 'all'
        ? allProducts
        : allProducts.filter(product => product.category === selectedCategory);

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return parseFloat(a.price?.toString().replace(/\./g, '') || '0') - parseFloat(b.price?.toString().replace(/\./g, '') || '0');
            case 'price-high':
                return parseFloat(b.price?.toString().replace(/\./g, '') || '0') - parseFloat(a.price?.toString().replace(/\./g, '') || '0');
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            case 'name':
                return (a.name || '').localeCompare(b.name || '');
            default:
                return 0;
        }
    });

    const formatPrice = (price) => {
        if (!price) return '0';
        if (typeof price === 'string') {
            return parseFloat(price.replace(/\./g, '')).toLocaleString('vi-VN');
        }
        return price.toLocaleString('vi-VN');
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                            <p className="text-xl text-gray-600">Đang tải sản phẩm...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">❌</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Có lỗi xảy ra</h3>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 mr-4"
                        >
                            Thử lại
                        </button>
                        {error.includes('đăng nhập') && (
                            <Link
                                to="/login"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                            >
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex items-center space-x-2 text-sm text-gray-600">
                        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
                        <span>→</span>
                        <span className="text-gray-900 font-medium">Sản phẩm</span>
                    </nav>
                </div>
            </div>

            {/* Products Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                        <div className="text-center sm:text-left">
                            <h1 className="text-4xl font-bold text-gray-800 mb-4">Tất cả sản phẩm</h1>
                            <p className="text-xl text-gray-600">Khám phá bộ sưu tập đa dạng của chúng tôi</p>
                        </div>
                        {isAuthenticated() && (
                            <div className="mt-4 sm:mt-0">
                                <Link
                                    to="/create-product"
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                                >
                                    ✨ Thêm sản phẩm mới
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filters and Sort */}
                <div className="flex flex-col lg:flex-row gap-6 mb-8">
                    {/* Categories Filter */}
                    <div className="lg:w-1/4">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Danh mục</h3>
                            <div className="space-y-2">
                                {availableCategories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex justify-between items-center ${selectedCategory === category.id
                                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        <span className="font-medium">{category.name}</span>
                                        <span className={`text-sm px-2 py-1 rounded-full ${selectedCategory === category.id
                                            ? 'bg-white/20 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {category.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="lg:w-3/4">
                        {/* Sort Options */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white rounded-xl shadow-lg p-4">
                            <div className="text-gray-700 mb-4 sm:mb-0">
                                <span className="font-semibold">{sortedProducts.length}</span> sản phẩm được tìm thấy
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-gray-700 font-medium">Sắp xếp:</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-white border text-black border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="default">Mặc định</option>
                                    <option value="name">Tên A-Z</option>
                                    <option value="price-low">Giá thấp → cao</option>
                                    <option value="price-high">Giá cao → thấp</option>
                                    <option value="rating">Đánh giá cao nhất</option>
                                </select>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2 relative"
                                >
                                    {/* Badge */}
                                    {product.badge && (
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${product.badge === 'Hot' ? 'bg-red-500' :
                                                product.badge === 'New' ? 'bg-green-500' :
                                                    'bg-orange-500'
                                                }`}>
                                                {product.badge}
                                            </span>
                                        </div>
                                    )}

                                    {/* Discount Badge */}
                                    {product.discount && (
                                        <div className="absolute top-4 right-4 z-10">
                                            <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                                                -{product.discount}%
                                            </span>
                                        </div>
                                    )}

                                    {/* Product Image */}
                                    <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div className="w-full h-full flex items-center justify-center text-6xl" style={{ display: product.imageUrl ? 'none' : 'flex' }}>
                                            📦
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {product.name || 'Tên sản phẩm'}
                                        </h3>

                                        {/* Category & Stock */}
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                                {product.category || 'Khác'}
                                            </span>
                                            <span className={`text-sm px-2 py-1 rounded-full ${product.stockQuantity > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {product.stockQuantity > 0 ? `Còn ${product.stockQuantity}` : 'Hết hàng'}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        {product.description && (
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {product.description}
                                            </p>
                                        )}

                                        {/* Price */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-2xl font-bold text-red-600">
                                                {formatPrice(product.price)}₫
                                            </span>
                                        </div>

                                        {/* Action Button */}
                                        <Link
                                            to={`/product/${product.id}`}
                                            className={`w-full py-3 rounded-xl font-bold transition-all duration-300 transform group-hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50 inline-block text-center ${product.stockQuantity > 0
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            {product.stockQuantity > 0 ? '🛍️ Xem chi tiết' : '❌ Hết hàng'}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {sortedProducts.length === 0 && !loading && (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm</h3>
                                <p className="text-gray-600 mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                                <button
                                    onClick={() => {
                                        setSelectedCategory('all');
                                        setSortBy('default');
                                    }}
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                                >
                                    Xem tất cả sản phẩm
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 lg:p-12 text-white text-center mt-16">
                    <h3 className="text-3xl font-bold mb-4">🎯 Không bỏ lỡ ưu đãi!</h3>
                    <p className="text-xl mb-8">Đăng ký nhận thông tin về sản phẩm mới và khuyến mãi đặc biệt</p>
                    <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Nhập email của bạn..."
                            className="flex-1 px-6 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-white/50"
                        />
                        <button className="bg-white text-purple-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                            Đăng ký
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
