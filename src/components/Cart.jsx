import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const { items, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();

    const formatPrice = (price) => {
        if (typeof price === 'string') {
            return parseFloat(price.replace(/\./g, '')).toLocaleString('vi-VN');
        }
        return price.toLocaleString('vi-VN');
    };

    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity === 0) {
            removeFromCart(productId);
        } else {
            updateQuantity(productId, newQuantity);
        }
    };

    const handleCheckout = () => {
        alert('Chức năng thanh toán đang được phát triển!');
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">{/* Added pt-20 for navbar space */}
                {/* Empty Cart */}
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="bg-white rounded-2xl shadow-lg p-12">
                            <div className="text-8xl mb-6">🛒</div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">Giỏ hàng trống</h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    🏠 Về trang chủ
                                </Link>
                                <Link
                                    to="/products"
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    🛍️ Mua sắm ngay
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">{/* Added pt-20 for navbar space */}
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex items-center space-x-2 text-sm text-gray-600">
                        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
                        <span>→</span>
                        <span className="text-gray-900 font-medium">Giỏ hàng</span>
                    </nav>
                </div>
            </div>

            {/* Cart Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-2xl shadow-lg">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Giỏ hàng ({items.reduce((total, item) => total + item.quantity, 0)} sản phẩm)
                                    </h2>
                                    <button
                                        onClick={clearCart}
                                        className="text-red-600 hover:text-red-800 font-medium transition-colors"
                                    >
                                        🗑️ Xóa tất cả
                                    </button>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {items.map((item) => (
                                    <div key={`${item.id}-${Math.random()}`} className="p-6">
                                        <div className="flex items-center gap-4">
                                            {/* Product Image */}
                                            <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center text-3xl">
                                                {item.image}
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                    {item.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-lg font-bold text-red-600">
                                                        {formatPrice(item.price)}₫
                                                    </span>
                                                    {item.originalPrice && (
                                                        <span className="text-sm text-gray-400 line-through">
                                                            {formatPrice(item.originalPrice)}₫
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 rounded-full text-black border border-gray-300 hover:bg-blue-200 flex items-center justify-center transition-colors"
                                                >
                                                    −
                                                </button>
                                                <span className="w-12 text-center font-semibold">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-full border text-black border-gray-300 flex items-center justify-center hover:bg-blue-200 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-600 hover:text-red-800 p-2 transition-colors"
                                                title="Xóa sản phẩm"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính:</span>
                                    <span>{formatPrice(cartTotal)}₫</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Phí vận chuyển:</span>
                                    <span className="text-green-600 font-medium">Miễn phí</span>
                                </div>
                                <div className="border-t pt-4">
                                    <div className="flex justify-between text-lg font-bold text-gray-900">
                                        <span>Tổng cộng:</span>
                                        <span className="text-red-600">{formatPrice(cartTotal)}₫</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-500/50 mb-4"
                            >
                                🚀 Thanh toán
                            </button>

                            <Link
                                to="/"
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-center transition-colors block"
                            >
                                ← Tiếp tục mua sắm
                            </Link>

                            {/* Security Info */}
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2 text-blue-700 mb-2">
                                    <span>🔒</span>
                                    <span className="font-semibold">Thanh toán an toàn</span>
                                </div>
                                <p className="text-sm text-blue-600">
                                    Thông tin thanh toán của bạn được bảo mật với công nghệ mã hóa SSL 256-bit
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
