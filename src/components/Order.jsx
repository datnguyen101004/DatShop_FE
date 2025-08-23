import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Order = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();

    // State management
    const [cartItems, setCartItems] = useState([]);
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Form state
    const [orderForm, setOrderForm] = useState({
        note: '',
        couponId: null,
        paymentMethod: location.state?.paymentMethod || 'COD',
        requiredNote: 'CHOTHUHANG'
    });

    // Required notes options
    const requiredNoteOptions = [
        { value: 'CHOTHUHANG', label: 'Cho thử hàng' },
        { value: 'CHOXEMHANGKHONGTHU', label: 'Cho xem hàng không thử' },
        { value: 'KHONGCHOXEMHANG', label: 'Không cho xem hàng' }
    ];

    // Payment method options
    const paymentMethods = [
        { value: 'COD', label: 'Thanh toán khi nhận hàng (COD)', icon: '💵' },
        { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng', icon: '🏦' }
    ];

    // Get cart storage key - only for authenticated users
    const getCartStorageKey = () => {
        if (!user?.userId) return null; // Don't create cart_guest key
        return `cart_${user.userId}`;
    };

    // Load cart from localStorage - only for authenticated users
    const loadCartFromLocalStorage = () => {
        try {
            const cartKey = getCartStorageKey();
            if (!cartKey) return []; // Return empty array if user is not authenticated

            const savedCart = localStorage.getItem(cartKey);
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            return [];
        }
    };

    // Fetch cart items and product details
    const fetchCartAndProducts = async () => {
        console.log('🔍 Order: fetchCartAndProducts called'); // Debug log
        try {
            setLoading(true);

            // Load cart from localStorage first
            const localCartData = loadCartFromLocalStorage();
            console.log('📦 Order: Loaded cart data:', localCartData); // Debug log

            if (localCartData.length === 0) {
                setError('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.');
                return;
            }

            setCartItems(localCartData);

            // Fetch product details
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            const productPromises = localCartData.map(async (item) => {
                try {
                    const response = await axios.get(`http://localhost:8080/api/v1/user/product/${item.productId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
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
            console.error('Error fetching cart and products:', error);
            setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };    // Calculate total price
    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const product = products[item.productId];
            if (product && product.price) {
                const price = typeof product.price === 'string'
                    ? parseFloat(product.price.replace(/\./g, ''))
                    : product.price;
                return total + (price * item.quantity);
            }
            return total;
        }, 0);
    };

    // Format price
    const formatPrice = (price) => {
        if (typeof price === 'string') {
            return parseFloat(price.replace(/\./g, '')).toLocaleString('vi-VN');
        }
        return price.toLocaleString('vi-VN');
    };

    // Handle form changes
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setOrderForm(prev => ({
            ...prev,
            [name]: name === 'couponId' ? (value ? parseInt(value) : null) : value
        }));
    };

    // Create order
    const handleCreateOrder = async (e) => {
        e.preventDefault();

        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        if (cartItems.length === 0) {
            setError('Giỏ hàng trống. Không thể tạo đơn hàng.');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

            // Prepare product items for API
            const productItems = cartItems.map(item => ({
                quantity: item.quantity,
                productId: item.productId
            }));

            const requestBody = {
                note: orderForm.note || '',
                couponId: orderForm.couponId,
                paymentMethod: orderForm.paymentMethod,
                productItems: productItems,
                requiredNote: orderForm.requiredNote
            };

            console.log('Creating order with data:', requestBody);

            const response = await axios.post('http://localhost:8080/api/v1/user/order/create', requestBody, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.statusCode === 200 && response.data.message === 'SUCCESS') {
                const orderData = response.data.data;

                // Clear cart after successful order
                localStorage.removeItem(getCartStorageKey());
                window.dispatchEvent(new CustomEvent('cartUpdated'));

                if (orderData.paymentMethod === 'BANK_TRANSFER' && orderData.paymentUrl) {
                    // Redirect to VNPay payment page
                    window.location.href = orderData.paymentUrl;
                } else {
                    // COD payment success
                    navigate('/products');
                }
            } else {
                throw new Error(response.data.message || 'Không thể tạo đơn hàng');
            }

        } catch (error) {
            console.error('Error creating order:', error);
            if (error.response?.status === 401) {
                setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                navigate('/login');
            } else {
                setError(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        fetchCartAndProducts();
    }, []); // Only run once when component mounts

    // Handle navigation state (from OrderHistory)
    useEffect(() => {
        if (location.state?.fromOrderHistory && location.state?.paymentMethod) {
            setOrderForm(prev => ({
                ...prev,
                paymentMethod: location.state.paymentMethod
            }));
        }
    }, [location.state]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Không thể tạo đơn hàng</h2>
                    <p className="text-red-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/cart')}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 mr-4"
                    >
                        Về giỏ hàng
                    </button>
                    <button
                        onClick={() => navigate('/products')}
                        className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                    >
                        Mua sắm
                    </button>
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
                        <button onClick={() => navigate('/')} className="hover:text-blue-600">Trang chủ</button>
                        <span>→</span>
                        <button onClick={() => navigate('/cart')} className="hover:text-blue-600">Giỏ hàng</button>
                        <span>→</span>
                        <span className="text-gray-900 font-medium">Đặt hàng</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">📦 Xác nhận đơn hàng</h1>

                    {/* Notification for payment from order history */}
                    {location.state?.fromOrderHistory && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">💳</div>
                                <div>
                                    <h3 className="font-semibold text-blue-900">Hoàn tất thanh toán đơn hàng</h3>
                                    <p className="text-blue-700 text-sm">
                                        {location.state.orderId && `Đơn hàng #${location.state.orderId} - `}
                                        Phương thức thanh toán đã được thiết lập sẵn. Vui lòng kiểm tra và xác nhận.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleCreateOrder} className="space-y-8">
                        {/* Order Items */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Sản phẩm đặt hàng</h2>
                            <div className="space-y-4">
                                {cartItems.map((item) => {
                                    const product = products[item.productId];
                                    if (!product) return null;

                                    const price = typeof product.price === 'string'
                                        ? parseFloat(product.price.replace(/\./g, ''))
                                        : product.price;

                                    return (
                                        <div key={item.productId} className="flex items-center space-x-4 p-4 border rounded-xl">
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                📦
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                                <p className="text-gray-600">Số lượng: {item.quantity}</p>
                                                <p className="text-purple-600 font-bold">{formatPrice(price)} VNĐ</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg text-gray-900">
                                                    {formatPrice(price * item.quantity)} VNĐ
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center text-xl font-bold text-purple-600">
                                        <span>Tổng tiền:</span>
                                        <span>{formatPrice(calculateTotal())} VNĐ</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Information */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin đơn hàng</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Note */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ghi chú đơn hàng
                                    </label>
                                    <textarea
                                        name="note"
                                        value={orderForm.note}
                                        onChange={handleFormChange}
                                        rows={3}
                                        placeholder="Ví dụ: Không giao buổi chiều, gọi trước khi giao..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Required Note */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Yêu cầu khi giao hàng *
                                    </label>
                                    <select
                                        name="requiredNote"
                                        value={orderForm.requiredNote}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        {requiredNoteOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Coupon ID */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mã giảm giá (tùy chọn)
                                    </label>
                                    <input
                                        type="number"
                                        name="couponId"
                                        value={orderForm.couponId || ''}
                                        onChange={handleFormChange}
                                        placeholder="Nhập ID coupon nếu có"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Phương thức thanh toán</h2>

                            <div className="space-y-4">
                                {paymentMethods.map(method => (
                                    <label
                                        key={method.value}
                                        className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-colors ${orderForm.paymentMethod === method.value
                                            ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                                            : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method.value}
                                            checked={orderForm.paymentMethod === method.value}
                                            onChange={handleFormChange}
                                            className="w-5 h-5 text-purple-600"
                                        />
                                        <span className="text-2xl">{method.icon}</span>
                                        <span className={`font-medium ${orderForm.paymentMethod === method.value
                                            ? 'text-purple-900'
                                            : 'text-gray-900'
                                            }`}>{method.label}</span>
                                        {location.state?.fromOrderHistory && orderForm.paymentMethod === method.value && method.value === 'BANK_TRANSFER' && (
                                            <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                                                Đã chọn sẵn
                                            </span>
                                        )}
                                    </label>
                                ))}
                            </div>

                            {orderForm.paymentMethod === 'BANK_TRANSFER' && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-blue-800 text-sm">
                                        💡 Bạn sẽ được chuyển đến trang thanh toán VNPay để hoàn tất giao dịch.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Submit buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                type="button"
                                onClick={() => navigate('/cart')}
                                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                                disabled={submitting}
                            >
                                ← Quay lại giỏ hàng
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || cartItems.length === 0}
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Đang tạo đơn hàng...
                                    </span>
                                ) : (
                                    `🛒 Đặt hàng (${formatPrice(calculateTotal())} VNĐ)`
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Order;
