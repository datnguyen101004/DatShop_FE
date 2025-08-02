import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Products = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('default');
    const { isAuthenticated, user } = useAuth();

    // Danh sách categories
    const categories = [
        { id: 'all', name: 'Tất cả', count: 24 },
        { id: 'electronics', name: 'Điện tử', count: 8 },
        { id: 'fashion', name: 'Thời trang', count: 6 },
        { id: 'home', name: 'Nhà cửa', count: 5 },
        { id: 'books', name: 'Sách', count: 3 },
        { id: 'sports', name: 'Thể thao', count: 2 },
    ];

    // Danh sách sản phẩm mở rộng
    const allProducts = [
        // Điện tử
        {
            id: 1,
            name: 'iPhone 15 Pro Max',
            price: '29.990.000',
            originalPrice: '32.990.000',
            image: '📱',
            rating: 4.8,
            reviews: 1234,
            discount: 9,
            badge: 'Hot',
            category: 'electronics'
        },
        {
            id: 2,
            name: 'MacBook Air M3',
            price: '28.999.000',
            originalPrice: '31.999.000',
            image: '💻',
            rating: 4.9,
            reviews: 856,
            discount: 9,
            badge: 'New',
            category: 'electronics'
        },
        {
            id: 3,
            name: 'AirPods Pro 2',
            price: '5.999.000',
            originalPrice: '6.999.000',
            image: '🎧',
            rating: 4.7,
            reviews: 2341,
            discount: 14,
            badge: 'Sale',
            category: 'electronics'
        },
        {
            id: 4,
            name: 'iPad Pro 12.9"',
            price: '25.999.000',
            originalPrice: '28.999.000',
            image: '📱',
            rating: 4.6,
            reviews: 987,
            discount: 10,
            badge: 'New',
            category: 'electronics'
        },
        {
            id: 5,
            name: 'Samsung Galaxy S24 Ultra',
            price: '27.990.000',
            originalPrice: '30.990.000',
            image: '📱',
            rating: 4.5,
            reviews: 1456,
            discount: 10,
            badge: 'Hot',
            category: 'electronics'
        },
        {
            id: 6,
            name: 'Apple Watch Series 9',
            price: '8.999.000',
            originalPrice: '9.999.000',
            image: '⌚',
            rating: 4.7,
            reviews: 789,
            discount: 10,
            badge: 'Sale',
            category: 'electronics'
        },
        {
            id: 7,
            name: 'Sony WH-1000XM5',
            price: '7.999.000',
            originalPrice: '8.999.000',
            image: '🎧',
            rating: 4.8,
            reviews: 654,
            discount: 11,
            badge: 'Hot',
            category: 'electronics'
        },
        {
            id: 8,
            name: 'Nintendo Switch OLED',
            price: '8.490.000',
            originalPrice: '9.490.000',
            image: '🎮',
            rating: 4.6,
            reviews: 1123,
            discount: 11,
            badge: 'New',
            category: 'electronics'
        },

        // Thời trang
        {
            id: 9,
            name: 'Áo Polo Nam Classic',
            price: '299.000',
            originalPrice: '399.000',
            image: '👕',
            rating: 4.5,
            reviews: 234,
            discount: 25,
            badge: 'Sale',
            category: 'fashion'
        },
        {
            id: 10,
            name: 'Giày Sneaker Unisex',
            price: '1.299.000',
            originalPrice: '1.599.000',
            image: '👟',
            rating: 4.4,
            reviews: 567,
            discount: 19,
            badge: 'Hot',
            category: 'fashion'
        },
        {
            id: 11,
            name: 'Túi Xách Nữ Cao Cấp',
            price: '899.000',
            originalPrice: '1.199.000',
            image: '👜',
            rating: 4.6,
            reviews: 345,
            discount: 25,
            badge: 'New',
            category: 'fashion'
        },
        {
            id: 12,
            name: 'Đồng Hồ Nam Thời Trang',
            price: '2.499.000',
            originalPrice: '2.999.000',
            image: '⌚',
            rating: 4.7,
            reviews: 198,
            discount: 17,
            badge: 'Hot',
            category: 'fashion'
        },
        {
            id: 13,
            name: 'Áo Khoác Bomber',
            price: '599.000',
            originalPrice: '799.000',
            image: '🧥',
            rating: 4.3,
            reviews: 456,
            discount: 25,
            badge: 'Sale',
            category: 'fashion'
        },
        {
            id: 14,
            name: 'Quần Jeans Slim Fit',
            price: '699.000',
            originalPrice: '899.000',
            image: '👖',
            rating: 4.5,
            reviews: 789,
            discount: 22,
            badge: 'New',
            category: 'fashion'
        },

        // Nhà cửa
        {
            id: 15,
            name: 'Bàn Làm Việc Gỗ Cao Su',
            price: '2.999.000',
            originalPrice: '3.999.000',
            image: '🪑',
            rating: 4.6,
            reviews: 234,
            discount: 25,
            badge: 'New',
            category: 'home'
        },
        {
            id: 16,
            name: 'Ghế Ergonomic Premium',
            price: '4.999.000',
            originalPrice: '5.999.000',
            image: '🪑',
            rating: 4.8,
            reviews: 345,
            discount: 17,
            badge: 'Hot',
            category: 'home'
        },
        {
            id: 17,
            name: 'Đèn LED Thông Minh',
            price: '799.000',
            originalPrice: '999.000',
            image: '💡',
            rating: 4.4,
            reviews: 567,
            discount: 20,
            badge: 'Sale',
            category: 'home'
        },
        {
            id: 18,
            name: 'Máy Lọc Không Khí',
            price: '3.499.000',
            originalPrice: '3.999.000',
            image: '🌬️',
            rating: 4.7,
            reviews: 198,
            discount: 13,
            badge: 'New',
            category: 'home'
        },
        {
            id: 19,
            name: 'Robot Hút Bụi Thông Minh',
            price: '5.999.000',
            originalPrice: '7.999.000',
            image: '🤖',
            rating: 4.5,
            reviews: 234,
            discount: 25,
            badge: 'Hot',
            category: 'home'
        },

        // Sách
        {
            id: 20,
            name: 'Sách Lập Trình Python',
            price: '299.000',
            originalPrice: '399.000',
            image: '📚',
            rating: 4.8,
            reviews: 456,
            discount: 25,
            badge: 'New',
            category: 'books'
        },
        {
            id: 21,
            name: 'Sách Kinh Tế Vĩ Mô',
            price: '199.000',
            originalPrice: '259.000',
            image: '📖',
            rating: 4.6,
            reviews: 234,
            discount: 23,
            badge: 'Sale',
            category: 'books'
        },
        {
            id: 22,
            name: 'Combo Sách Kỹ Năng Sống',
            price: '399.000',
            originalPrice: '599.000',
            image: '📚',
            rating: 4.7,
            reviews: 345,
            discount: 33,
            badge: 'Hot',
            category: 'books'
        },

        // Thể thao
        {
            id: 23,
            name: 'Bóng Đá FIFA World Cup',
            price: '899.000',
            originalPrice: '1.199.000',
            image: '⚽',
            rating: 4.5,
            reviews: 567,
            discount: 25,
            badge: 'New',
            category: 'sports'
        },
        {
            id: 24,
            name: 'Gậy Golf Titanium Pro',
            price: '12.999.000',
            originalPrice: '15.999.000',
            image: '🏌️',
            rating: 4.8,
            reviews: 123,
            discount: 19,
            badge: 'Hot',
            category: 'sports'
        }
    ];

    // Filter products based on selected category
    const filteredProducts = selectedCategory === 'all'
        ? allProducts
        : allProducts.filter(product => product.category === selectedCategory);

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return parseFloat(a.price.replace(/\./g, '')) - parseFloat(b.price.replace(/\./g, ''));
            case 'price-high':
                return parseFloat(b.price.replace(/\./g, '')) - parseFloat(a.price.replace(/\./g, ''));
            case 'rating':
                return b.rating - a.rating;
            case 'name':
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });

    const formatPrice = (price) => {
        if (typeof price === 'string') {
            return parseFloat(price.replace(/\./g, '')).toLocaleString('vi-VN');
        }
        return price.toLocaleString('vi-VN');
    };
    return (
        <div className="min-h-screen bg-gray-50 pt-20">{/* Added pt-20 for navbar space */}
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
                                {categories.map((category) => (
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
                                            {category.id === 'all' ? allProducts.length : category.count}
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
                                    <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300">
                                        {product.image}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {product.name}
                                        </h3>

                                        {/* Rating */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                                                        ⭐
                                                    </span>
                                                ))}
                                            </div>
                                            <span className="text-sm text-gray-600">
                                                {product.rating} ({product.reviews} đánh giá)
                                            </span>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-2xl font-bold text-red-600">
                                                {formatPrice(product.price)}₫
                                            </span>
                                            {product.originalPrice && (
                                                <span className="text-lg text-gray-400 line-through">
                                                    {formatPrice(product.originalPrice)}₫
                                                </span>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        <Link
                                            to={`/product/${product.id}`}
                                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-bold transition-all duration-300 transform group-hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50 inline-block text-center"
                                        >
                                            🛍️ Xem chi tiết
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {sortedProducts.length === 0 && (
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
