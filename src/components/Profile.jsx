import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showChatbotPopup, setShowChatbotPopup] = useState(false);
    const [chatbotData, setChatbotData] = useState({
        name: '',
        description: '',
        type: 'PRODUCT'
    });
    const [isUpdating, setIsUpdating] = useState(false);

    // Fetch user profile from API
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

            if (!token) {
                setError('Vui lòng đăng nhập để xem thông tin cá nhân.');
                setLoading(false);
                return;
            }

            const response = await axios.get('http://localhost:8080/api/v1/user/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.statusCode === 200 && response.data.message === 'SUCCESS') {
                setProfile(response.data.data);
                setError(null);
            } else {
                throw new Error(response.data.message || 'Không thể tải thông tin cá nhân');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            if (err.response?.status === 401) {
                setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                // Optionally redirect to login
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(err.response?.data?.message || 'Không thể tải thông tin cá nhân. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        fetchProfile();
    }, []);

    // Format date display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get role display text and color
    const getRoleInfo = (role) => {
        switch (role?.toUpperCase()) {
            case 'ADMIN':
                return { text: 'Quản trị viên', color: 'bg-red-100 text-red-800', icon: '👑' };
            case 'USER':
                return { text: 'Người dùng', color: 'bg-blue-100 text-blue-800', icon: '👤' };
            default:
                return { text: role || 'Không xác định', color: 'bg-gray-100 text-gray-800', icon: '❓' };
        }
    };

    // Update chatbot data
    const updateChatbotData = async () => {
        if (!chatbotData.name.trim() || !chatbotData.description.trim()) {
            setError('Vui lòng điền đầy đủ thông tin.');
            return;
        }

        try {
            setIsUpdating(true);
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

            if (!token) {
                setError('Vui lòng đăng nhập để thực hiện chức năng này.');
                return;
            }

            const requestBody = {
                description: chatbotData.description.trim(),
                type: chatbotData.type,
                name: chatbotData.name.trim()
            };

            await axios.post('http://localhost:8080/api/v1/information/create', requestBody, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Đóng popup và reset form
            setShowChatbotPopup(false);
            setChatbotData({
                name: '',
                description: '',
                type: 'PRODUCT'
            });

            // Hiển thị thông báo thành công
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);

        } catch (err) {
            console.error('Error updating chatbot data:', err);
            setError('Không thể cập nhật dữ liệu chatbot. Vui lòng thử lại.');
        } finally {
            setIsUpdating(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-600">Đang tải thông tin cá nhân...</p>
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
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={fetchProfile}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                        >
                            Thử lại
                        </button>
                        <Link
                            to="/"
                            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                        >
                            Về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const roleInfo = getRoleInfo(profile?.role);

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex items-center space-x-2 text-sm text-gray-600">
                        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
                        <span>→</span>
                        <span className="text-gray-900 font-medium">Thông tin cá nhân</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">👤 Thông tin cá nhân</h1>
                        <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Card */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                {/* Profile Header */}
                                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                            {profile?.email?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'Người dùng'}</h2>
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${roleInfo.color}`}>
                                                {roleInfo.icon} {roleInfo.text}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Details */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <label className="text-sm font-semibold text-gray-600 mb-2 block">ID Người dùng</label>
                                            <div className="text-lg font-medium text-gray-900">#{profile?.id}</div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <label className="text-sm font-semibold text-gray-600 mb-2 block">Email</label>
                                            <div className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                                📧 {profile?.email}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <label className="text-sm font-semibold text-gray-600 mb-2 block">Ngày tạo tài khoản</label>
                                            <div className="text-lg font-medium text-gray-900">
                                                🗓️ {profile?.createdAt ? formatDate(profile.createdAt) : 'Không xác định'}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <label className="text-sm font-semibold text-gray-600 mb-2 block">Cập nhật lần cuối</label>
                                            <div className="text-lg font-medium text-gray-900">
                                                🔄 {profile?.updatedAt ? formatDate(profile.updatedAt) : 'Không xác định'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={fetchProfile}
                                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                    >
                                        🔄 Làm mới
                                    </button>
                                    <button
                                        onClick={() => setShowChatbotPopup(true)}
                                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                    >
                                        🤖 Cập nhật Chatbot
                                    </button>
                                    <Link
                                        to="/order-history"
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                    >
                                        📋 Lịch sử đơn hàng
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 Thao tác nhanh</h3>
                                <div className="space-y-3">
                                    <Link
                                        to="/products"
                                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
                                    >
                                        🛍️ Mua sắm ngay
                                    </Link>
                                    <Link
                                        to="/cart"
                                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white p-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
                                    >
                                        🛒 Xem giỏ hàng
                                    </Link>
                                </div>
                            </div>

                            {/* Account Stats */}
                            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Thống kê tài khoản</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Thời gian hoạt động:</span>
                                        <span className="font-semibold text-purple-600">
                                            {profile?.createdAt ?
                                                Math.ceil((new Date() - new Date(profile.createdAt)) / (1000 * 60 * 60 * 24))
                                                : 0} ngày
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Trạng thái:</span>
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                            🟢 Hoạt động
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chatbot Update Popup */}
            {showChatbotPopup && (
                <div
                    className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowChatbotPopup(false);
                        }
                    }}
                >
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                🤖 Cập nhật dữ liệu Chatbot
                            </h3>
                            <button
                                onClick={() => setShowChatbotPopup(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); updateChatbotData(); }}>
                            {/* Name Field */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên sản phẩm/dịch vụ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={chatbotData.name}
                                    onChange={(e) => setChatbotData({ ...chatbotData, name: e.target.value })}
                                    placeholder="Nhập tên sản phẩm..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Description Field */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mô tả <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={chatbotData.description}
                                    onChange={(e) => setChatbotData({ ...chatbotData, description: e.target.value })}
                                    placeholder="Nhập mô tả chi tiết..."
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                    required
                                />
                            </div>

                            {/* Type Field */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Loại thông tin
                                </label>
                                <select
                                    value={chatbotData.type}
                                    onChange={(e) => setChatbotData({ ...chatbotData, type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="PRODUCT">Sản phẩm</option>
                                    <option value="SERVICE">Dịch vụ</option>
                                    <option value="INFO">Thông tin</option>
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowChatbotPopup(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={isUpdating}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating || !chatbotData.name.trim() || !chatbotData.description.trim()}
                                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isUpdating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Đang cập nhật...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Cập nhật
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Popup */}
            {showSuccessMessage && (
                <div className="fixed top-4 right-4 z-50">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-bounce">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium">Cập nhật dữ liệu chatbot thành công!</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
