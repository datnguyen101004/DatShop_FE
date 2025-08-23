import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const UserProfile = () => {
    const navigate = useNavigate();
    const { userId } = useParams(); // Get userId from URL params
    const { isAuthenticated, user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    // Get role information with styling
    const getRoleInfo = (role) => {
        switch (role?.toUpperCase()) {
            case 'ADMIN':
                return {
                    text: 'Quản trị viên',
                    icon: '👑',
                    color: 'bg-yellow-100 text-yellow-800'
                };
            case 'USER':
            default:
                return {
                    text: 'Người dùng',
                    icon: '👤',
                    color: 'bg-blue-100 text-blue-800'
                };
        }
    };

    // Fetch user profile from API
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

            if (!token) {
                setError('Vui lòng đăng nhập để xem thông tin người dùng.');
                setLoading(false);
                return;
            }

            // Determine which API endpoint to use
            let apiUrl;
            if (userId) {
                // Viewing another user's profile
                apiUrl = `http://localhost:8080/api/v1/user/profile/${userId}`;
                setIsOwnProfile(user?.userId?.toString() === userId.toString());
            } else {
                // Viewing own profile
                apiUrl = 'http://localhost:8080/api/v1/user/profile';
                setIsOwnProfile(true);
            }

            const response = await axios.get(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.statusCode === 200 && response.data.message === 'SUCCESS') {
                setProfile(response.data.data);
                setError(null);
            } else {
                throw new Error(response.data.message || 'Không thể tải thông tin người dùng');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            if (err.response?.status === 401) {
                setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                setTimeout(() => navigate('/login'), 2000);
            } else if (err.response?.status === 404) {
                setError('Không tìm thấy thông tin người dùng này.');
            } else {
                setError(err.response?.data?.message || 'Không thể tải thông tin người dùng. Vui lòng thử lại.');
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
    }, [userId]); // Re-fetch when userId changes

    // Format date display
    const formatDate = (dateString) => {
        if (!dateString) return 'Không xác định';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Create chat room and navigate to chat page
    const startChat = async () => {
        try {
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            if (!token) {
                setError('Vui lòng đăng nhập để chat');
                return;
            }

            // Send receiverId as Long in request body
            const receiverId = parseInt(userId);
            console.log('Creating chat room with receiverId:', receiverId);

            const response = await axios.post('http://localhost:8080/api/v1/chat/rooms/create', receiverId, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.statusCode === 200) {
                // Successfully created or found chat room
                console.log('Chat room created/found:', response.data);
                const conversationData = response.data.data;
                console.log('Conversation ID:', conversationData.conversationId);

                // Navigate to chat page with conversation ID
                navigate(`/chat/${conversationData.conversationId}`);
            } else {
                throw new Error(response.data?.message || 'Không thể tạo phòng chat');
            }
        } catch (error) {
            console.error('Error creating chat room:', error);
            if (error.response?.status === 401) {
                setError('Phiên đăng nhập đã hết hạn');
            } else if (error.code === 'ERR_NETWORK') {
                setError('Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng.');
            } else {
                setError('Có lỗi xảy ra khi tạo phòng chat');
            }
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-600">Đang tải thông tin người dùng...</p>
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
        <>
            <div className="min-h-screen bg-gray-50 pt-20">
                {/* Breadcrumb */}
                <div className="bg-white border-b">
                    <div className="container mx-auto px-4 py-3">
                        <nav className="flex items-center space-x-2 text-sm text-gray-600">
                            <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
                            <span>→</span>
                            <span className="text-gray-900 font-medium">
                                {isOwnProfile ? 'Thông tin cá nhân' : `Thông tin của ${profile?.email || 'người dùng'}`}
                            </span>
                        </nav>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                👤 {isOwnProfile ? 'Thông tin cá nhân' : `Thông tin của ${profile?.email || 'người dùng'}`}
                            </h1>
                            <p className="text-gray-600">
                                {isOwnProfile ? 'Quản lý thông tin tài khoản của bạn' : 'Xem thông tin người dùng'}
                            </p>
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
                                                <h2 className="text-2xl font-bold text-gray-900">
                                                    {profile?.email || 'Người dùng'}
                                                </h2>
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
                                                    🗓️ {formatDate(profile?.createdAt)}
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <label className="text-sm font-semibold text-gray-600 mb-2 block">Cập nhật lần cuối</label>
                                                <div className="text-lg font-medium text-gray-900">
                                                    🔄 {formatDate(profile?.updatedAt)}
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
                                        {isOwnProfile ? (
                                            <Link
                                                to="/order-history"
                                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                            >
                                                📋 Lịch sử đơn hàng
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={startChat}
                                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                            >
                                                💬 Nhắn tin
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {isOwnProfile ? (
                                    // Quick Actions - Only show for own profile
                                    <>
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
                                    </>
                                ) : (
                                    // User info for other profiles
                                    <>
                                        <div className="bg-white rounded-2xl shadow-lg p-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">ℹ️ Thông tin người dùng</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Tham gia từ:</span>
                                                    <span className="font-semibold text-purple-600">
                                                        {formatDate(profile?.createdAt)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Vai trò:</span>
                                                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${roleInfo.color}`}>
                                                        {roleInfo.text}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Chat Actions */}
                                        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">💬 Liên hệ</h3>
                                            <div className="space-y-3">
                                                <button
                                                    onClick={startChat}
                                                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white p-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
                                                >
                                                    💬 Bắt đầu trò chuyện
                                                </button>
                                                <p className="text-sm text-gray-600 text-center">
                                                    Liên hệ trực tiếp với {profile?.email || 'người dùng này'}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserProfile;
