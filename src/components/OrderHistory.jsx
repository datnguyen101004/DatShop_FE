import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const OrderHistory = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    // State management
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Status mapping for display
    const statusMap = {
        'WAITING_FOR_PAYMENT': { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
        'PREPARING': { label: 'Đang chuẩn bị', color: 'bg-blue-100 text-blue-800', icon: '📦' },
        'SHIPPING': { label: 'Đang giao hàng', color: 'bg-purple-100 text-purple-800', icon: '🚚' },
        'DELIVERED': { label: 'Đã giao hàng', color: 'bg-green-100 text-green-800', icon: '✅' },
        'CANCELLED': { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: '❌' }
    };

    // Payment method mapping
    const paymentMethodMap = {
        'COD': { label: 'Thanh toán khi nhận hàng', icon: '💵' },
        'BANK_TRANSFER': { label: 'Chuyển khoản ngân hàng', icon: '🏦' }
    };

    // Required note mapping
    const requiredNoteMap = {
        'CHOTHUHANG': 'Cho thử hàng',
        'CHOXEMHANGKHONGTHU': 'Cho xem hàng không thử',
        'KHONGCHOXEMHANG': 'Không cho xem hàng'
    };

    // Fetch all orders
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            if (!token) {
                setError('Vui lòng đăng nhập để xem lịch sử đơn hàng.');
                return;
            }

            const response = await axios.get('http://localhost:8080/api/v1/user/order/all', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.statusCode === 200 && response.data.message === 'SUCCESS') {
                setOrders(response.data.data || []);
            } else {
                setError('Không thể tải danh sách đơn hàng.');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            if (error.response?.status === 401) {
                setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                navigate('/login');
            } else {
                setError('Có lỗi xảy ra khi tải danh sách đơn hàng. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Format price
    const formatPrice = (price) => {
        return price.toLocaleString('vi-VN');
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        fetchOrders();
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải lịch sử đơn hàng...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Có lỗi xảy ra</h2>
                    <p className="text-red-600 mb-6">{error}</p>
                    <button
                        onClick={fetchOrders}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 mr-4"
                    >
                        Thử lại
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
                        <span className="text-gray-900 font-medium">Lịch sử đơn hàng</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">📋 Lịch sử đơn hàng</h1>
                        <button
                            onClick={() => navigate('/products')}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                        >
                            🛍️ Tiếp tục mua sắm
                        </button>
                    </div>

                    {orders.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">📦</div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Chưa có đơn hàng nào</h2>
                            <p className="text-gray-600 mb-8">Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!</p>
                            <button
                                onClick={() => navigate('/products')}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                            >
                                🛍️ Bắt đầu mua sắm
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => {
                                const status = statusMap[order.orderStatus] || { label: order.orderStatus, color: 'bg-gray-100 text-gray-800', icon: '❓' };
                                const paymentMethod = paymentMethodMap[order.paymentMethod] || { label: order.paymentMethod, icon: '💳' };

                                return (
                                    <div key={order.orderId} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                                        {/* Order Header */}
                                        <div className="flex flex-wrap justify-between items-start mb-4 border-b pb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                    📦 Đơn hàng #{order.orderId}
                                                </h3>
                                                <p className="text-gray-600">
                                                    Đặt lúc: {formatDate(order.createdAt)}
                                                </p>
                                                {order.updatedAt !== order.createdAt && (
                                                    <p className="text-gray-600">
                                                        Cập nhật: {formatDate(order.updatedAt)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                                                    {status.icon} {status.label}
                                                </span>
                                                <p className="text-2xl font-bold text-purple-600 mt-2">
                                                    {formatPrice(order.totalPrice)} VNĐ
                                                </p>
                                            </div>
                                        </div>

                                        {/* Order Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                            {/* Payment Method */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h4 className="font-semibold text-gray-700 mb-2">Phương thức thanh toán</h4>
                                                <p className="flex items-center gap-2">
                                                    {paymentMethod.icon} {paymentMethod.label}
                                                </p>
                                            </div>

                                            {/* Required Note */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h4 className="font-semibold text-gray-700 mb-2">Yêu cầu giao hàng</h4>
                                                <p>{requiredNoteMap[order.requiredNote] || order.requiredNote}</p>
                                            </div>

                                            {/* Product Count */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h4 className="font-semibold text-gray-700 mb-2">Số sản phẩm</h4>
                                                <p className="text-lg font-bold text-purple-600">
                                                    {order.productItems?.length || 0} sản phẩm
                                                </p>
                                            </div>
                                        </div>

                                        {/* Note */}
                                        {order.note && (
                                            <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                                                <h4 className="font-semibold text-gray-700 mb-2">📝 Ghi chú</h4>
                                                <p className="text-gray-600">{order.note}</p>
                                            </div>
                                        )}

                                        {/* Product Items */}
                                        {order.productItems && order.productItems.length > 0 && (
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h4 className="font-semibold text-gray-700 mb-3">🛍️ Sản phẩm đã đặt</h4>
                                                <div className="space-y-2">
                                                    {order.productItems.map((item, index) => (
                                                        <div key={index} className="flex justify-between items-center py-2 px-3 bg-white rounded">
                                                            <span className="text-gray-700">
                                                                Sản phẩm ID: {item.productId}
                                                            </span>
                                                            <span className="font-semibold text-purple-600">
                                                                Số lượng: {item.quantity}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-4 mt-6 pt-4 border-t">
                                            {order.orderStatus === 'WAITING_FOR_PAYMENT' && (
                                                <button
                                                    onClick={() => navigate('/order', {
                                                        state: {
                                                            paymentMethod: 'BANK_TRANSFER',
                                                            fromOrderHistory: true,
                                                            orderId: order.orderId
                                                        }
                                                    })}
                                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                                                >
                                                    💳 Thanh toán ngay
                                                </button>
                                            )}
                                            <button
                                                onClick={() => navigate('/products')}
                                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                                            >
                                                🛍️ Đặt hàng lại
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderHistory;
