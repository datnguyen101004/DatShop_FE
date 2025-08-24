import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Shop = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingDelivery, setProcessingDelivery] = useState({});
    const [deliveryNotes, setDeliveryNotes] = useState({});
    const [deliveryInfo, setDeliveryInfo] = useState({});
    const [showDeliveryPopup, setShowDeliveryPopup] = useState(false);
    const [popupDeliveryData, setPopupDeliveryData] = useState(null);
    const [showTrackingPopup, setShowTrackingPopup] = useState(false);
    const [trackingData, setTrackingData] = useState(null);
    const [loadingTracking, setLoadingTracking] = useState(false);
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Check authentication on component mount
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
    }, []);

    // Fetch shop orders
    const fetchShopOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

            const response = await axios.get('http://localhost:8080/api/v1/user/order/shop/all', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.message === 'SUCCESS') {
                setOrders(response.data.data);
            } else {
                setError('Không thể tải danh sách đơn hàng');
            }
        } catch (err) {
            setError(`Lỗi kết nối: ${err.message}`);
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    // Show delivery success popup
    const showDeliverySuccess = (deliveryData) => {
        setPopupDeliveryData(deliveryData);
        setShowDeliveryPopup(true);
    };

    // Create delivery
    const createDelivery = async (orderId) => {
        try {
            setProcessingDelivery(prev => ({ ...prev, [orderId]: true }));
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            const note = deliveryNotes[orderId] || '';

            const response = await axios.post('http://localhost:8080/api/v1/shop/delivery/create', {
                orderId: orderId,
                shopId: 2, // Assuming shopId is 2 based on API response
                userId: user?.userId || 1,
                note: note
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const deliveryData = response.data;

            // Store delivery info with orderId
            setDeliveryInfo(prev => ({
                ...prev,
                [orderId]: deliveryData
            }));

            // Show success popup
            showDeliverySuccess(deliveryData);

            // Refresh orders list
            fetchShopOrders();

            // Clear delivery note
            setDeliveryNotes(prev => ({ ...prev, [orderId]: '' }));

        } catch (err) {
            // Show error popup
            setPopupDeliveryData({ error: true, message: err.message });
            setShowDeliveryPopup(true);
            console.error('Error creating delivery:', err);
        } finally {
            setProcessingDelivery(prev => ({ ...prev, [orderId]: false }));
        }
    };

    // Fetch delivery tracking info
    const fetchTrackingInfo = async (orderId) => {
        try {
            setLoadingTracking(true);
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

            const response = await axios.get(`http://localhost:8080/api/v1/shop/delivery/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setTrackingData(response.data);
            setShowTrackingPopup(true);

        } catch (err) {
            // Show error in tracking popup
            setTrackingData({ error: true, message: err.message });
            setShowTrackingPopup(true);
            console.error('Error fetching tracking info:', err);
        } finally {
            setLoadingTracking(false);
        }
    };

    // Format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'PREPARING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'WAITING_FOR_PAYMENT':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'SHIPPING':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'DELIVERED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'CANCEL':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Get status text
    const getStatusText = (status) => {
        switch (status) {
            case 'PREPARING':
                return 'Đang chuẩn bị';
            case 'WAITING_FOR_PAYMENT':
                return 'Chờ thanh toán';
            case 'SHIPPING':
                return 'Đang vận chuyển';
            case 'DELIVERED':
                return 'Đã giao hàng';
            case 'CANCEL':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    useEffect(() => {
        fetchShopOrders();
    }, []);

    // Don't render if not authenticated
    if (!isAuthenticated()) {
        return null;
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Đang tải danh sách đơn hàng...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
                    <p className="font-medium">❌ {error}</p>
                    <button
                        onClick={fetchShopOrders}
                        className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    // Filter orders by status for different sections
    const preparingOrders = orders.filter(order => order.orderStatus === 'PREPARING');
    const otherOrders = orders.filter(order => order.orderStatus !== 'PREPARING');

    // Delivery Popup Component
    const DeliveryPopup = () => {
        if (!showDeliveryPopup) return null;

        return (
            <div
                className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setShowDeliveryPopup(false)}
            >
                <div
                    className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto transform transition-all duration-300 scale-100"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6">
                        {popupDeliveryData?.error ? (
                            // Error State
                            <>
                                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                                    <span className="text-2xl">❌</span>
                                </div>
                                <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
                                    Lỗi tạo đơn giao hàng
                                </h3>
                                <p className="text-center text-gray-600 mb-6">
                                    {popupDeliveryData.message}
                                </p>
                                <button
                                    onClick={() => setShowDeliveryPopup(false)}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
                                >
                                    Đóng
                                </button>
                            </>
                        ) : (
                            // Success State
                            <>
                                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full mb-4">
                                    <span className="text-2xl">✅</span>
                                </div>
                                <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
                                    Tạo đơn giao hàng thành công!
                                </h3>

                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <h4 className="font-semibold text-gray-800 mb-3">Thông tin đơn giao hàng:</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">ID giao hàng:</span>
                                            <span className="font-medium text-gray-800">#{popupDeliveryData?.id}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Mã đơn:</span>
                                            <span className="font-bold text-blue-600">{popupDeliveryData?.order_code}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Phương thức:</span>
                                            <span className="font-medium text-gray-800">
                                                {popupDeliveryData?.trans_type === 'truck' ? '🚛 Xe tải' : '📦 Vận chuyển'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Phí vận chuyển:</span>
                                            <span className="font-bold text-green-600">
                                                {popupDeliveryData?.total_fee?.toLocaleString('vi-VN')} VNĐ
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Dự kiến giao hàng:</span>
                                            <div className="text-right">
                                                <div className="font-medium text-gray-800">
                                                    {popupDeliveryData?.expected_delivery_time ?
                                                        new Date(popupDeliveryData.expected_delivery_time).toLocaleDateString('vi-VN')
                                                        : 'N/A'
                                                    }
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {popupDeliveryData?.expected_delivery_time ?
                                                        new Date(popupDeliveryData.expected_delivery_time).toLocaleTimeString('vi-VN')
                                                        : ''
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeliveryPopup(false)}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(popupDeliveryData?.order_code || '');
                                            setShowDeliveryPopup(false);
                                        }}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
                                    >
                                        📋 Copy mã đơn
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Tracking Popup Component
    const TrackingPopup = () => {
        if (!showTrackingPopup) return null;

        return (
            <div
                className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setShowTrackingPopup(false)}
            >
                <div
                    className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto transform transition-all duration-300 scale-100"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6">
                        {trackingData?.error ? (
                            // Error State
                            <>
                                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                                    <span className="text-2xl">❌</span>
                                </div>
                                <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
                                    Lỗi lấy thông tin vận chuyển
                                </h3>
                                <p className="text-center text-gray-600 mb-6">
                                    {trackingData.message}
                                </p>
                                <button
                                    onClick={() => setShowTrackingPopup(false)}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
                                >
                                    Đóng
                                </button>
                            </>
                        ) : (
                            // Success State
                            <>
                                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full mb-4">
                                    <span className="text-2xl">🚚</span>
                                </div>
                                <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
                                    Thông tin vận chuyển
                                </h3>

                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">ID giao hàng:</span>
                                            <span className="font-medium text-gray-800">#{trackingData?.id}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Mã đơn:</span>
                                            <span className="font-bold text-blue-600">{trackingData?.order_code}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Trạng thái:</span>
                                            <span className="font-bold text-green-600">{trackingData?.status || 'Đang vận chuyển'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Phương thức:</span>
                                            <span className="font-medium text-gray-800">
                                                {trackingData?.trans_type === 'truck' ? '🚛 Xe tải' : '📦 Vận chuyển'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Phí vận chuyển:</span>
                                            <span className="font-bold text-green-600">
                                                {trackingData?.total_fee?.toLocaleString('vi-VN')} VNĐ
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Dự kiến giao hàng:</span>
                                            <div className="text-right">
                                                <div className="font-medium text-gray-800">
                                                    {trackingData?.expected_delivery_time ?
                                                        new Date(trackingData.expected_delivery_time).toLocaleDateString('vi-VN')
                                                        : 'N/A'
                                                    }
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {trackingData?.expected_delivery_time ?
                                                        new Date(trackingData.expected_delivery_time).toLocaleTimeString('vi-VN')
                                                        : ''
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        {trackingData?.note && (
                                            <div className="flex justify-between items-start">
                                                <span className="text-gray-600">Ghi chú:</span>
                                                <span className="font-medium text-gray-600 text-right">{trackingData.note}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowTrackingPopup(false)}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(trackingData?.order_code || '');
                                            alert('Đã copy mã đơn hàng!');
                                        }}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
                                    >
                                        📋 Copy mã đơn
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Delivery Popup */}
            <DeliveryPopup />

            {/* Tracking Popup */}
            <TrackingPopup />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý đơn hàng Shop</h1>
                <p className="text-gray-600">Quản lý và xử lý các đơn hàng của cửa hàng</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Đang chuẩn bị</h3>
                    <p className="text-3xl font-bold text-yellow-900">{preparingOrders.length}</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-orange-800 mb-2">Chờ thanh toán</h3>
                    <p className="text-3xl font-bold text-orange-900">
                        {orders.filter(o => o.orderStatus === 'WAITING_FOR_PAYMENT').length}
                    </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Đang vận chuyển</h3>
                    <p className="text-3xl font-bold text-blue-900">
                        {orders.filter(o => o.orderStatus === 'SHIPPING').length}
                    </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Đã hủy</h3>
                    <p className="text-3xl font-bold text-red-900">
                        {orders.filter(o => o.orderStatus === 'CANCEL').length}
                    </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Tổng đơn</h3>
                    <p className="text-3xl font-bold text-green-900">{orders.length}</p>
                </div>
            </div>

            {/* Preparing Orders Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-lg mr-3">
                        🚚 Đơn hàng đang chuẩn bị ({preparingOrders.length})
                    </span>
                </h2>

                {preparingOrders.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <p className="text-gray-600 text-lg">Không có đơn hàng nào đang chuẩn bị</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {preparingOrders.map((order) => (
                            <div key={order.orderId} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    {/* Order Header */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                Đơn hàng #{order.orderId}
                                            </h3>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.orderStatus)}`}>
                                                    {getStatusText(order.orderStatus)}
                                                </span>
                                                <span className="text-gray-500">User ID: {order.userId}</span>
                                            </div>
                                        </div>
                                        <div className="text-right mt-4 md:mt-0">
                                            <p className="text-2xl font-bold text-green-600">
                                                {formatPrice(order.totalPrice)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Product Items */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                        <h4 className="font-medium text-gray-800 mb-3">Sản phẩm:</h4>
                                        <div className="space-y-2">
                                            {order.productItems.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center bg-white rounded-md px-3 py-2">
                                                    <span className="text-gray-700">
                                                        Sản phẩm ID: {item.productId}
                                                    </span>
                                                    <span className="font-medium text-gray-800">
                                                        Số lượng: {item.quantity}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Delivery Info - Show if delivery has been created */}
                                    {deliveryInfo[order.orderId] && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                            <div className="flex items-center mb-3">
                                                <span className="text-lg">🚚</span>
                                                <h4 className="font-semibold text-green-800 ml-2">Thông tin giao hàng</h4>
                                                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Đã tạo</span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">ID giao hàng:</span>
                                                    <span className="font-medium text-gray-800">#{deliveryInfo[order.orderId].id}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Mã đơn:</span>
                                                    <span className="font-bold text-blue-600">{deliveryInfo[order.orderId].order_code}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Phương thức:</span>
                                                    <span className="font-medium text-gray-800">
                                                        {deliveryInfo[order.orderId].trans_type === 'truck' ? '🚛 Xe tải' : '📦 Vận chuyển'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Phí vận chuyển:</span>
                                                    <span className="font-bold text-green-600">
                                                        {deliveryInfo[order.orderId].total_fee?.toLocaleString('vi-VN')} VNĐ
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Dự kiến giao:</span>
                                                    <span className="font-medium text-gray-800">
                                                        {new Date(deliveryInfo[order.orderId].expected_delivery_time).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Thời gian:</span>
                                                    <span className="font-medium text-gray-600">
                                                        {new Date(deliveryInfo[order.orderId].expected_delivery_time).toLocaleTimeString('vi-VN')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-green-200 flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(deliveryInfo[order.orderId].order_code);
                                                        // Simple alert for copy confirmation
                                                        alert('Đã copy mã đơn hàng!');
                                                    }}
                                                    className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-md font-medium transition-colors"
                                                >
                                                    📋 Copy mã: {deliveryInfo[order.orderId].order_code}
                                                </button>

                                                <button
                                                    onClick={() => fetchShopOrders()}
                                                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-md font-medium transition-colors"
                                                >
                                                    🔄 Refresh
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Delivery Section - Only show if no delivery created yet */}
                                    {!deliveryInfo[order.orderId] && (
                                        <div className="border-t pt-4">
                                            <h4 className="font-medium text-gray-800 mb-3">Tạo đơn giao hàng:</h4>
                                            <div className="flex flex-col md:flex-row gap-4">
                                                <div className="flex-1">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Ghi chú cho shipper:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ví dụ: Không giao hàng buổi sáng..."
                                                        value={deliveryNotes[order.orderId] || ''}
                                                        onChange={(e) => setDeliveryNotes(prev => ({
                                                            ...prev,
                                                            [order.orderId]: e.target.value
                                                        }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <button
                                                        onClick={() => createDelivery(order.orderId)}
                                                        disabled={processingDelivery[order.orderId]}
                                                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium transition-colors duration-300 mt-6 md:mt-0"
                                                    >
                                                        {processingDelivery[order.orderId] ? (
                                                            <span className="flex items-center gap-2">
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                Đang xử lý...
                                                            </span>
                                                        ) : (
                                                            '🚚 Tạo đơn giao hàng'
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Other Orders Section */}
            {otherOrders.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        📋 Đơn hàng khác ({otherOrders.length})
                    </h2>
                    <div className="space-y-4">
                        {otherOrders.map((order) => (
                            <div key={order.orderId} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            Đơn hàng #{order.orderId}
                                        </h3>
                                        <div className="flex items-center gap-4 mb-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                                                {getStatusText(order.orderStatus)}
                                            </span>
                                            <span className="text-gray-500 text-sm">User ID: {order.userId}</span>
                                            <span className="text-gray-500 text-sm">{formatDate(order.createdAt)}</span>
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            {order.productItems.length} sản phẩm
                                        </p>

                                        {/* Shipping tracking button for SHIPPING/DELIVERED orders */}
                                        {(order.orderStatus === 'SHIPPING' || order.orderStatus === 'DELIVERED') && (
                                            <div className="mt-3">
                                                <button
                                                    onClick={() => fetchTrackingInfo(order.orderId)}
                                                    disabled={loadingTracking}
                                                    className="text-sm bg-green-100 hover:bg-green-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-green-800 px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
                                                >
                                                    {loadingTracking ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                                            <span>Đang tải...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>🚚</span>
                                                            <span>Xem trạng thái vận chuyển</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right mt-2 md:mt-0 ml-4">
                                        <p className="text-lg font-bold text-gray-800">
                                            {formatPrice(order.totalPrice)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Refresh Button */}
            <div className="mt-8 text-center">
                <button
                    onClick={fetchShopOrders}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-300"
                >
                    🔄 Làm mới danh sách
                </button>
            </div>
        </div>
    );
};

export default Shop;
