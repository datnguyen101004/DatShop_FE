import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Cart = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch cart items from API
    const fetchCartItems = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

            if (!token) {
                setError('Vui lòng đăng nhập để xem giỏ hàng.');
                setLoading(false);
                return;
            }

            const response = await axios.get('http://localhost:8080/api/v1/user/cart/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.statusCode === 200 && response.data.message === 'SUCCESS') {
                const cartData = response.data.data || [];
                setCartItems(cartData);

                // Fetch product details for each cart item
                await fetchProductDetails(cartData);
                setError(null);
            } else {
                throw new Error(response.data.message || 'Không thể tải giỏ hàng');
            }
        } catch (err) {
            console.error('Error fetching cart:', err);

            if (err.response?.status === 401) {
                setError('Vui lòng đăng nhập để xem giỏ hàng.');
            } else if (err.response?.status === 403) {
                setError('Bạn không có quyền truy cập giỏ hàng này.');
            } else {
                setError(err.response?.data?.message || 'Không thể tải giỏ hàng. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch product details for cart items
    const fetchProductDetails = async (cartData) => {
        try {
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            const productPromises = cartData.map(async (item) => {
                try {
                    const response = await axios.get(`http://localhost:8080/api/v1/user/product/${item.productId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.data.statusCode === 200) {
                        return { [item.productId]: response.data.data };
                    }
                } catch (error) {
                    console.error(`Error fetching product ${item.productId}:`, error);
                    return { [item.productId]: null };
                }
                return null;
            });

            const productResults = await Promise.all(productPromises);
            const productMap = productResults.reduce((acc, result) => {
                if (result) {
                    return { ...acc, ...result };
                }
                return acc;
            }, {});

            setProducts(productMap);
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        fetchCartItems();
    }, [isAuthenticated, navigate]);

    const formatPrice = (price) => {
        if (typeof price === 'string') {
            return parseFloat(price.replace(/\./g, '')).toLocaleString('vi-VN');
        }
        return price.toLocaleString('vi-VN');
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const product = products[item.productId];
            if (product) {
                return total + (product.price * item.quantity);
            }
            return total;
        }, 0);
    };

    const handleQuantityChange = async (cartItemId, productId, newQuantity) => {
        if (newQuantity === 0) {
            await removeFromCart(cartItemId);
        } else {
            await updateQuantity(cartItemId, newQuantity);
        }
    };

    const updateQuantity = async (cartItemId, quantity) => {
        try {
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

            // Update local state immediately for better UX
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.cartItemId === cartItemId
                        ? { ...item, quantity: quantity }
                        : item
                )
            );

            // TODO: Implement actual API call when update cart API is available
            // const response = await axios.put(`http://localhost:8080/api/v1/user/cart/${cartItemId}`, {
            //     quantity: quantity
            // }, {
            //     headers: {
            //         'Authorization': `Bearer ${token}`
            //     }
            // });

        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Có lỗi xảy ra khi cập nhật số lượng.');
            // Revert the optimistic update
            fetchCartItems();
        }
    };

    const removeFromCart = async (cartItemId) => {
        try {
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

            // Update local state immediately for better UX
            setCartItems(prevItems =>
                prevItems.filter(item => item.cartItemId !== cartItemId)
            );

            // TODO: Implement actual API call when remove from cart API is available
            // const response = await axios.delete(`http://localhost:8080/api/v1/user/cart/${cartItemId}`, {
            //     headers: {
            //         'Authorization': `Bearer ${token}`
            //     }
            // });

        } catch (error) {
            console.error('Error removing from cart:', error);
            alert('Có lỗi xảy ra khi xóa sản phẩm.');
            // Revert the optimistic update
            fetchCartItems();
        }
    };

    const clearCart = async () => {
        try {
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

            // Update local state immediately for better UX
            setCartItems([]);

            // TODO: Implement actual API call when clear cart API is available
            // const response = await axios.delete(`http://localhost:8080/api/v1/user/cart/clear`, {
            //     headers: {
            //         'Authorization': `Bearer ${token}`
            //     }
            // });

        } catch (error) {
            console.error('Error clearing cart:', error);
            alert('Có lỗi xảy ra khi xóa giỏ hàng.');
            // Revert the optimistic update
            fetchCartItems();
        }
    };

    const handleCheckout = () => {
        alert('Chức năng thanh toán đang được phát triển!');
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-600">Đang tải giỏ hàng...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Có lỗi xảy ra</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => fetchCartItems()}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
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

    // Empty cart state
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Giỏ hàng trống</h2>
                    <p className="text-gray-600 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
                    <Link
                        to="/products"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                    >
                        Mua sắm ngay 🛍️
                    </Link>
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
                                        Giỏ hàng ({cartItems.reduce((total, item) => total + item.quantity, 0)} sản phẩm)
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
                                {cartItems.map((cartItem) => {
                                    const product = products[cartItem.productId];

                                    if (!product) {
                                        return (
                                            <div key={cartItem.cartItemId} className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                                                    <div className="flex-1">
                                                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                                                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={cartItem.cartItemId} className="p-6">
                                            <div className="flex items-center gap-4">
                                                {/* Product Image */}
                                                <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                                    {product.imageUrl ? (
                                                        <img
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover rounded-lg"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className="text-4xl text-gray-400" style={{ display: product.imageUrl ? 'none' : 'flex' }}>
                                                        📦
                                                    </div>
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                        {product.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-lg font-bold text-red-600">
                                                            {formatPrice(product.price)}₫
                                                        </span>
                                                    </div>
                                                    {product.description && (
                                                        <p className="text-gray-600 text-sm line-clamp-2">
                                                            {product.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleQuantityChange(cartItem.cartItemId, cartItem.productId, cartItem.quantity - 1)}
                                                        className="w-8 h-8 rounded-full text-black border border-gray-300 hover:bg-blue-200 flex items-center justify-center transition-colors"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="text-black w-12 text-center font-semibold">
                                                        {cartItem.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleQuantityChange(cartItem.cartItemId, cartItem.productId, cartItem.quantity + 1)}
                                                        className="w-8 h-8 rounded-full border text-black border-gray-300 flex items-center justify-center hover:bg-blue-200 transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    onClick={() => removeFromCart(cartItem.cartItemId)}
                                                    className="text-red-600 hover:text-red-800 p-2 transition-colors"
                                                    title="Xóa sản phẩm"
                                                >
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Tổng hóa đơn</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Số lượng sản phẩm:</span>
                                    <span className="font-medium text-gray-800">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                                </div>
                                <div className="border-t border-gray-300 pt-4">
                                    <div className="flex justify-between items-center text-xl font-bold text-purple-800">
                                        <span>Tổng cộng:</span>
                                        <span>{formatPrice(calculateTotal())} VNĐ</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                    Thanh toán ngay 🛍️
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
