import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Home = () => {
    const [email, setEmail] = useState('');
    const location = useLocation();
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

    // Sample data - trong thực tế sẽ lấy từ API
    const categories = [
        { id: 1, name: 'Điện tử', image: '📱', color: 'from-blue-400 to-blue-600', bgColor: 'bg-blue-50' },
        { id: 2, name: 'Thời trang', image: '👕', color: 'from-pink-400 to-pink-600', bgColor: 'bg-pink-50' },
        { id: 3, name: 'Nhà cửa', image: '🏠', color: 'from-green-400 to-green-600', bgColor: 'bg-green-50' },
        { id: 4, name: 'Sách', image: '📚', color: 'from-yellow-400 to-yellow-600', bgColor: 'bg-yellow-50' },
        { id: 5, name: 'Thể thao', image: '⚽', color: 'from-orange-400 to-orange-600', bgColor: 'bg-orange-50' },
        { id: 6, name: 'Làm đẹp', image: '💄', color: 'from-purple-400 to-purple-600', bgColor: 'bg-purple-50' },
    ];

    const featuredProducts = [
        {
            id: 1,
            name: 'iPhone 15 Pro Max',
            price: '29.990.000',
            originalPrice: '32.990.000',
            image: '📱',
            rating: 4.8,
            reviews: 1234,
            discount: 9,
            badge: 'Hot'
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
            badge: 'New'
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
            badge: 'Sale'
        },
        {
            id: 4,
            name: 'Samsung Galaxy S24',
            price: '22.990.000',
            originalPrice: '24.990.000',
            image: '📱',
            rating: 4.6,
            reviews: 987,
            discount: 8,
            badge: 'Popular'
        },
    ];

    const features = [
        {
            icon: '🚚',
            title: 'Giao hàng nhanh',
            description: 'Giao hàng trong 2-4 giờ tại TP.HCM'
        },
        {
            icon: '🔒',
            title: 'Thanh toán an toàn',
            description: 'Bảo mật thông tin 100%'
        },
        {
            icon: '↩️',
            title: 'Đổi trả dễ dàng',
            description: 'Đổi trả trong 30 ngày'
        },
        {
            icon: '🎧',
            title: 'Hỗ trợ 24/7',
            description: 'Tư vấn mọi lúc mọi nơi'
        }
    ];

    const handleSubscribe = (e) => {
        e.preventDefault();
        alert('Cảm ơn bạn đã đăng ký nhận tin!');
        setEmail('');
    };

    // Check for payment success state
    useEffect(() => {
        if (location.state?.paymentSuccess) {
            setShowPaymentSuccess(true);

            // Auto hide success message after 5 seconds
            const timer = setTimeout(() => {
                setShowPaymentSuccess(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [location.state]);

    // Format price
    const formatPrice = (price) => {
        return price.toLocaleString('vi-VN');
    };

    return (
        <div className="min-h-screen">
            {/* Payment Success Notification */}
            {showPaymentSuccess && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
                    <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-xl shadow-lg">
                        <div className="flex items-center">
                            <div className="text-2xl mr-3">✅</div>
                            <div className="flex-1">
                                <h3 className="font-bold">Thanh toán thành công!</h3>
                                {location.state?.orderId && (
                                    <p className="text-sm">Đơn hàng #{location.state.orderId}</p>
                                )}
                                {location.state?.amount && (
                                    <p className="text-sm">Số tiền: {formatPrice(location.state.amount)} VNĐ</p>
                                )}
                            </div>
                            <button
                                onClick={() => setShowPaymentSuccess(false)}
                                className="ml-3 text-green-700 hover:text-green-900"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section - Full Screen */}
            <section className="relative min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden flex items-center pt-20">{/* Added pt-20 for navbar space */}
                {/* Background decorations */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                    <div className="absolute top-60 right-32 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute bottom-40 left-1/4 w-64 h-64 bg-pink-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
                    <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-green-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
                </div>

                <div className="w-full px-4 lg:px-8 py-24 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center min-h max-w mx-auto">
                        <div className="lg:w-1/2 mb-12 lg:mb-0">
                            <div className="mb-8">
                                <span className="inline-block bg-yellow-400/20 text-yellow-300 px-6 py-3 rounded-full text-sm font-medium mb-6 animate-bounce">
                                    🔥 Siêu sale cuối năm
                                </span>
                            </div>
                            <h1 className="text-5xl lg:text-8xl font-bold mb-8 leading-tight">
                                Mua sắm
                                <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent animate-pulse">
                                    Thông minh
                                </span>
                            </h1>
                            <p className="text-xl lg:text-2xl mb-12 opacity-90 leading-relaxed">
                                Khám phá hàng ngàn sản phẩm chất lượng với giá cả tốt nhất.
                                <span className="block mt-3 text-yellow-300 font-semibold">✨ Giao hàng nhanh • 🔄 Đổi trả dễ dàng • 🏆 Uy tín hàng đầu</span>
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6">
                                <Link
                                    to="/products"
                                    className="group bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl hover:shadow-yellow-400/30 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer"
                                >
                                    <span className="flex items-center justify-center gap-3">
                                        🛍️ Mua ngay
                                        <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                </Link>
                                <Link
                                    to="/products"
                                    className="group border-2 border-white/50 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-purple-600 px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer"
                                >
                                    <span className="flex items-center justify-center gap-3">
                                        👀 Xem sản phẩm
                                        <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </span>
                                </Link>
                            </div>
                        </div>
                        <div className="lg:w-1/2 text-center relative">
                            <div className="relative inline-block">
                                <div className="text-9xl lg:text-[16rem] animate-bounce">🛒</div>
                                <div className="absolute -top-8 -right-8 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-full text-lg font-bold animate-pulse shadow-2xl">
                                    Sale!
                                </div>
                                <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-bounce delay-500">
                                    Hot 🔥
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - New */}
            <section className="py-16 bg-white">
                <div className="w-full px-4 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                        {features.map((feature, index) => (
                            <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                                <h3 className="font-bold text-lg mb-2 text-gray-800">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section - Enhanced */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
                <div className="w-full px-4 lg:px-8">
                    <div className="text-center mb-16 max-w-4xl mx-auto">
                        <h2 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Danh mục sản phẩm
                        </h2>
                        <p className="text-xl text-gray-600">Khám phá các danh mục hàng đầu</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-7xl mx-auto">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className={`group ${category.bgColor} p-8 rounded-2xl text-center hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl border border-white/50 relative overflow-hidden`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                                <div className="relative z-10">
                                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{category.image}</div>
                                    <h3 className="font-bold text-gray-800 group-hover:text-gray-900">{category.name}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products Section - Enhanced */}
            <section className="py-20 bg-white">
                <div className="w-full px-4 lg:px-8">
                    <div className="flex flex-col lg:flex-row justify-between items-center mb-16 max-w-7xl mx-auto">
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">Sản phẩm nổi bật</h2>
                            <p className="text-xl text-gray-600">Những sản phẩm được yêu thích nhất</p>
                        </div>
                        <Link
                            to="/products"
                            className="group text-blue-600 hover:text-blue-800 font-bold text-lg mt-4 lg:mt-0 flex items-center gap-2 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-3 py-2 cursor-pointer"
                        >
                            Xem tất cả
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                        {featuredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2"
                            >
                                <div className="relative overflow-hidden">
                                    <div className="h-56 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-300">
                                        {product.image}
                                    </div>
                                    {product.discount > 0 && (
                                        <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                            -{product.discount}%
                                        </div>
                                    )}
                                    {product.badge && (
                                        <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                            {product.badge}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-lg mb-3 text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center mb-4">
                                        <div className="flex text-yellow-400 text-lg">
                                            {'★'.repeat(Math.floor(product.rating))}
                                            {'☆'.repeat(5 - Math.floor(product.rating))}
                                        </div>
                                        <span className="text-gray-500 text-sm ml-2 font-medium">
                                            ({product.reviews.toLocaleString()})
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <span className="text-red-600 font-bold text-xl">
                                                {product.price}₫
                                            </span>
                                            {product.originalPrice && (
                                                <span className="text-gray-400 line-through text-sm ml-2">
                                                    {product.originalPrice}₫
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Link
                                        to={`/product/${product.id}`}
                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white cursor-pointer block text-center"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            🛒 Thêm vào giỏ
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Special Offers Section - Enhanced */}
            <section className="py-20 bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 text-white relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0">
                    <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-20 left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl"></div>
                </div>

                <div className="w-full px-4 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
                        <div>
                            <div className="mb-6">
                                <span className="inline-block bg-yellow-400/20 text-yellow-200 px-4 py-2 rounded-full text-sm font-medium">
                                    ⚡ Flash Sale
                                </span>
                            </div>
                            <h2 className="text-5xl lg:text-6xl font-bold mb-6">Ưu đãi đặc biệt!</h2>
                            <p className="text-xl lg:text-2xl mb-8 opacity-90">
                                Giảm giá lên đến <span className="text-yellow-300 font-bold text-3xl">50%</span> cho tất cả sản phẩm điện tử.
                                <span className="block mt-2">⏰ Chỉ còn 3 ngày!</span>
                            </p>
                            <div className="flex items-center gap-6 mb-8">
                                <div className="bg-white/20 backdrop-blur-sm text-white px-6 py-4 rounded-2xl font-bold text-center min-w-[80px] border border-white/30">
                                    <div className="text-3xl lg:text-4xl">2</div>
                                    <div className="text-sm opacity-80">Ngày</div>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm text-white px-6 py-4 rounded-2xl font-bold text-center min-w-[80px] border border-white/30">
                                    <div className="text-3xl lg:text-4xl">15</div>
                                    <div className="text-sm opacity-80">Giờ</div>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm text-white px-6 py-4 rounded-2xl font-bold text-center min-w-[80px] border border-white/30">
                                    <div className="text-3xl lg:text-4xl">30</div>
                                    <div className="text-sm opacity-80">Phút</div>
                                </div>
                            </div>
                            <Link
                                to="/special-offers"
                                className="group bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-10 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl hover:shadow-yellow-400/40 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer inline-block"
                            >
                                <span className="flex items-center gap-2">
                                    🔥 Mua ngay
                                    <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </Link>
                        </div>
                        <div className="text-center relative">
                            <div className="relative inline-block">
                                <div className="text-9xl lg:text-[12rem] animate-pulse">🎉</div>
                                <div className="absolute -top-8 -right-8 bg-yellow-400 text-black px-4 py-2 rounded-full text-lg font-bold animate-bounce shadow-lg">
                                    50% OFF
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Section - Enhanced */}
            <section className="py-20 bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl"></div>
                </div>

                <div className="w-full px-4 lg:px-8 text-center relative z-10">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-6xl mb-6">📧</div>
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6">Đăng ký nhận tin</h2>
                        <p className="text-xl lg:text-2xl mb-12 opacity-90">
                            Nhận thông báo về các ưu đãi và sản phẩm mới nhất
                            <span className="block mt-2 text-blue-400">🎁 Tặng voucher 100K cho thành viên mới</span>
                        </p>
                        <form onSubmit={handleSubscribe} className="max-w-lg mx-auto">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Nhập email của bạn"
                                    className="flex-1 border-white px-6 py-4 rounded-xl text-white text-lg border-2 focus:border-blue-400 focus:outline-none transition-colors"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer"
                                >
                                    <span className="flex items-center gap-2">
                                        ✉️ Đăng ký
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer - Enhanced */}
            <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-16">
                <div className="w-full px-4 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-7xl mx-auto">
                        <div className="lg:col-span-2">
                            <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                DatShop
                            </h3>
                            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                                Nền tảng mua sắm trực tuyến hàng đầu Việt Nam.
                                Chúng tôi cam kết mang đến trải nghiệm mua sắm tuyệt vời nhất với
                                hàng triệu sản phẩm chất lượng và dịch vụ hoàn hảo.
                            </p>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-2 text-yellow-400">
                                    <span className="text-2xl">⭐</span>
                                    <span className="font-bold">4.8/5</span>
                                </div>
                                <span className="text-gray-400">|</span>
                                <span className="text-gray-300">Hơn 1 triệu khách hàng tin tưởng</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-xl mb-6 text-blue-400">Về chúng tôi</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2">
                                    <span>📋</span> Giới thiệu
                                </a></li>
                                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2">
                                    <span>💼</span> Tuyển dụng
                                </a></li>
                                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2">
                                    <span>📰</span> Tin tức
                                </a></li>
                                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2">
                                    <span>🤝</span> Đối tác
                                </a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-xl mb-6 text-green-400">Hỗ trợ</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-gray-300 hover:text-green-400 transition-colors duration-300 flex items-center gap-2">
                                    <span>📞</span> Liên hệ
                                </a></li>
                                <li><a href="#" className="text-gray-300 hover:text-green-400 transition-colors duration-300 flex items-center gap-2">
                                    <span>❓</span> Hướng dẫn
                                </a></li>
                                <li><a href="#" className="text-gray-300 hover:text-green-400 transition-colors duration-300 flex items-center gap-2">
                                    <span>📄</span> Chính sách
                                </a></li>
                                <li><a href="#" className="text-gray-300 hover:text-green-400 transition-colors duration-300 flex items-center gap-2">
                                    <span>🔒</span> Bảo mật
                                </a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 mt-12 pt-8">
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                            <div className="flex flex-col lg:flex-row items-center gap-6">
                                <p className="text-gray-400">
                                    &copy; 2025 DatShop. Tất cả quyền được bảo lưu.
                                </p>
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-400">Kết nối với chúng tôi:</span>
                                    <div className="flex space-x-4">
                                        <a href="#" className="group text-3xl hover:scale-110 transition-transform duration-300">
                                            <span className="group-hover:text-blue-400">📘</span>
                                        </a>
                                        <a href="#" className="group text-3xl hover:scale-110 transition-transform duration-300">
                                            <span className="group-hover:text-pink-400">📷</span>
                                        </a>
                                        <a href="#" className="group text-3xl hover:scale-110 transition-transform duration-300">
                                            <span className="group-hover:text-blue-300">🐦</span>
                                        </a>
                                        <a href="#" className="group text-3xl hover:scale-110 transition-transform duration-300">
                                            <span className="group-hover:text-red-400">�</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-gray-400">Phương thức thanh toán:</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">💳</span>
                                    <span className="text-2xl">🏦</span>
                                    <span className="text-2xl">📱</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;