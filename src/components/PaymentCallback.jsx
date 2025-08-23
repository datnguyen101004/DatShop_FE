import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PaymentCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isAuthenticated } = useAuth();

    const [status, setStatus] = useState('processing'); // processing, success, error
    const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');
    const [orderInfo, setOrderInfo] = useState(null);
    const [userAuthenticated, setUserAuthenticated] = useState(false);

    // Verify payment with backend
    const verifyPaymentWithBackend = async (searchParams) => {
        try {
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

            // Build query string from search params
            const queryString = searchParams.toString();

            const response = await axios.get(`http://localhost:8080/api/v1/callback/payment-callback?${queryString}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Backend verification response:', response.data);

            if (response.data.statusCode !== 200) {
                throw new Error('Backend verification failed');
            }

            return response.data;
        } catch (error) {
            console.error('Error verifying payment with backend:', error);
            throw error;
        }
    };

    useEffect(() => {
        const handlePaymentCallback = async () => {
            try {
                // Extract VNPay parameters from URL
                const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
                const vnp_TransactionStatus = searchParams.get('vnp_TransactionStatus');
                const vnp_Amount = searchParams.get('vnp_Amount');
                const vnp_OrderInfo = searchParams.get('vnp_OrderInfo');
                const vnp_TxnRef = searchParams.get('vnp_TxnRef');
                const vnp_BankCode = searchParams.get('vnp_BankCode');
                const vnp_PayDate = searchParams.get('vnp_PayDate');

                console.log('VNPay callback parameters:', {
                    vnp_ResponseCode,
                    vnp_TransactionStatus,
                    vnp_Amount,
                    vnp_OrderInfo,
                    vnp_TxnRef,
                    vnp_BankCode,
                    vnp_PayDate
                });

                // Check authentication status
                const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
                const userInfo = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
                const isUserAuthenticated = !!accessToken && !!userInfo.userId;
                setUserAuthenticated(isUserAuthenticated);

                // Verify payment with backend if authenticated
                if (isUserAuthenticated) {
                    try {
                        await verifyPaymentWithBackend(searchParams);
                        console.log('Backend verification successful');
                    } catch (backendError) {
                        console.warn('Backend verification failed, proceeding with client-side processing:', backendError);
                    }
                }

                // Process payment result
                if (vnp_ResponseCode === '00') {
                    // Payment successful
                    setStatus('success');
                    setMessage(isUserAuthenticated ? 'Thanh toán thành công!' : 'Thanh toán thành công! Vui lòng đăng nhập lại để xem chi tiết.');

                    // Format amount (VNPay amount is in VND * 100)
                    const amount = vnp_Amount ? parseInt(vnp_Amount) / 100 : 0;

                    setOrderInfo({
                        orderId: vnp_TxnRef,
                        amount: amount,
                        bankCode: vnp_BankCode,
                        payDate: vnp_PayDate,
                        orderInfo: decodeURIComponent(vnp_OrderInfo || ''),
                        responseCode: vnp_ResponseCode,
                        transactionStatus: vnp_TransactionStatus
                    });

                    // Clear all cart data from localStorage after successful payment
                    try {
                        // Method 1: Clear user-specific cart
                        const userInfo = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
                        if (userInfo.userId) {
                            const cartKey = `cart_${userInfo.userId}`;
                            localStorage.removeItem(cartKey);
                            console.log(`Cleared cart for user ${userInfo.userId}`);
                        }

                        // Method 2: Clear all cart-related keys
                        const localStorageKeys = Object.keys(localStorage);
                        const cartKeys = localStorageKeys.filter(key =>
                            key.startsWith('cart_') || key.includes('cart')
                        );
                        cartKeys.forEach(key => {
                            localStorage.removeItem(key);
                            console.log(`Cleared localStorage cart: ${key}`);
                        });

                        // Method 3: Clear sessionStorage cart keys
                        const sessionStorageKeys = Object.keys(sessionStorage);
                        const sessionCartKeys = sessionStorageKeys.filter(key =>
                            key.startsWith('cart_') || key.includes('cart')
                        );
                        sessionCartKeys.forEach(key => {
                            sessionStorage.removeItem(key);
                            console.log(`Cleared sessionStorage cart: ${key}`);
                        });

                        // Method 4: Clear common cart key patterns
                        const commonCartKeys = ['datshop-cart', 'cart', 'shopping-cart', 'user-cart'];
                        commonCartKeys.forEach(key => {
                            if (localStorage.getItem(key)) {
                                localStorage.removeItem(key);
                                console.log(`Cleared common cart key: ${key}`);
                            }
                            if (sessionStorage.getItem(key)) {
                                sessionStorage.removeItem(key);
                                console.log(`Cleared common session cart key: ${key}`);
                            }
                        });

                        // Dispatch cart update events to refresh UI
                        window.dispatchEvent(new CustomEvent('cartUpdated'));
                        window.dispatchEvent(new StorageEvent('storage', {
                            key: null, // null means clear all
                            storageArea: localStorage
                        }));

                        console.log('All cart data cleared and update events dispatched');
                    } catch (error) {
                        console.error('Error clearing cart data:', error);
                    }

                    // Auto redirect after success
                    setTimeout(() => {
                        if (isUserAuthenticated) {
                            navigate('/', {
                                state: {
                                    paymentSuccess: true,
                                    orderId: vnp_TxnRef,
                                    amount: amount
                                }
                            });
                        } else {
                            navigate('/login', {
                                state: {
                                    message: `Thanh toán thành công cho đơn hàng #${vnp_TxnRef}. Vui lòng đăng nhập để tiếp tục.`,
                                    paymentSuccess: true,
                                    orderId: vnp_TxnRef,
                                    amount: amount
                                }
                            });
                        }
                    }, 3000);

                } else {
                    // Payment failed
                    setStatus('error');

                    // Map VNPay response codes to user-friendly messages
                    const errorMessages = {
                        '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
                        '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
                        '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
                        '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
                        '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
                        '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
                        '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
                        '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
                        '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
                        '75': 'Ngân hàng thanh toán đang bảo trì.',
                        '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.'
                    };

                    setMessage(errorMessages[vnp_ResponseCode] || 'Thanh toán không thành công. Vui lòng thử lại.');

                    // Auto redirect on failure
                    setTimeout(() => {
                        if (isUserAuthenticated) {
                            navigate('/cart');
                        } else {
                            navigate('/login', {
                                state: {
                                    message: `Thanh toán thất bại cho đơn hàng #${vnp_TxnRef}. Vui lòng đăng nhập để thử lại.`
                                }
                            });
                        }
                    }, 5000);
                }
            } catch (error) {
                console.error('Error processing payment callback:', error);
                setStatus('error');
                setMessage('Có lỗi xảy ra khi xử lý kết quả thanh toán.');

                setTimeout(() => {
                    navigate(userAuthenticated ? '/cart' : '/login');
                }, 5000);
            }
        };

        handlePaymentCallback();
    }, [searchParams, navigate, isAuthenticated]);

    // Format price for display
    const formatPrice = (price) => {
        return price.toLocaleString('vi-VN');
    };

    // Format payment date from VNPay format (yyyyMMddHHmmss)
    const formatPaymentDate = (payDate) => {
        if (!payDate || payDate.length !== 14) return payDate;

        const year = payDate.substring(0, 4);
        const month = payDate.substring(4, 6);
        const day = payDate.substring(6, 8);
        const hour = payDate.substring(8, 10);
        const minute = payDate.substring(10, 12);
        const second = payDate.substring(12, 14);

        return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {status === 'processing' && (
                        <>
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6"></div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">⏳ Đang xử lý</h2>
                            <p className="text-gray-600">{message}</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="text-6xl mb-6">✅</div>
                            <h2 className="text-2xl font-bold text-green-600 mb-4">Thanh toán thành công!</h2>
                            <p className="text-gray-600 mb-6">{message}</p>

                            {orderInfo && (
                                <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
                                    <h3 className="font-semibold text-green-800 mb-3">Thông tin giao dịch:</h3>
                                    <div className="space-y-2 text-sm">
                                        {orderInfo.orderId && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Mã đơn hàng:</span>
                                                <span className="font-semibold">#{orderInfo.orderId}</span>
                                            </div>
                                        )}
                                        {orderInfo.amount && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Số tiền:</span>
                                                <span className="font-semibold text-green-600">
                                                    {formatPrice(orderInfo.amount)} VNĐ
                                                </span>
                                            </div>
                                        )}
                                        {orderInfo.bankCode && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Ngân hàng:</span>
                                                <span className="font-semibold">{orderInfo.bankCode}</span>
                                            </div>
                                        )}
                                        {orderInfo.payDate && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Thời gian:</span>
                                                <span className="font-semibold">
                                                    {formatPaymentDate(orderInfo.payDate)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                {userAuthenticated ? (
                                    <>
                                        <button
                                            onClick={() => navigate('/')}
                                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                                        >
                                            🏠 Về trang chủ
                                        </button>
                                        <button
                                            onClick={() => navigate('/order-history')}
                                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                                        >
                                            📋 Xem đơn hàng
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => navigate('/login', {
                                                state: {
                                                    message: `Thanh toán thành công cho đơn hàng #${orderInfo?.orderId}. Vui lòng đăng nhập để xem chi tiết.`
                                                }
                                            })}
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                                        >
                                            🔐 Đăng nhập
                                        </button>
                                        <button
                                            onClick={() => navigate('/products')}
                                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                                        >
                                            🛍️ Tiếp tục mua sắm
                                        </button>
                                    </>
                                )}
                            </div>

                            <p className="text-sm text-gray-500 mt-4">
                                Tự động chuyển về trang chủ sau 3 giây...
                            </p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="text-6xl mb-6">❌</div>
                            <h2 className="text-2xl font-bold text-red-600 mb-4">Thanh toán thất bại</h2>
                            <p className="text-gray-600 mb-6">{message}</p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => navigate('/cart')}
                                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                                >
                                    🛒 Về giỏ hàng
                                </button>
                                <button
                                    onClick={() => navigate('/products')}
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                                >
                                    🛍️ Tiếp tục mua sắm
                                </button>
                            </div>

                            <p className="text-sm text-gray-500 mt-4">
                                Tự động chuyển về giỏ hàng sau 5 giây...
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentCallback;
