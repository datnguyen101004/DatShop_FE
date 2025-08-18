import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithCredentials, login, defaultAccount } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    // API login function
    const loginWithAPI = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/login', {
                email: email,
                password: password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            // Check if response is successful based on status code
            if (response.data.statusCode === 200 && response.data.message === 'SUCCESS') {
                return {
                    success: true,
                    data: response.data.data // The actual user data with tokens
                };
            } else {
                throw new Error(response.data.message || 'Đăng nhập không thành công');
            }
        } catch (error) {
            console.error('API Login error:', error);

            // Handle axios error response
            if (error.response && error.response.data) {
                return {
                    success: false,
                    message: error.response.data.message || 'Đã xảy ra lỗi khi đăng nhập'
                };
            }

            return {
                success: false,
                message: error.message || 'Đã xảy ra lỗi khi đăng nhập'
            };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Try API login first
            const apiResult = await loginWithAPI(formData.email, formData.password);

            if (apiResult.success) {
                console.log('API Login successful:', apiResult.data);

                const userData = apiResult.data;

                // Store tokens and user info
                if (formData.rememberMe) {
                    // Store in localStorage for persistent login
                    localStorage.setItem('accessToken', userData.accessToken);
                    localStorage.setItem('refreshToken', userData.refreshToken);
                    localStorage.setItem('user', JSON.stringify({
                        userId: userData.userId,
                        email: userData.email,
                        name: userData.name,
                        role: userData.role,
                        active: userData.active,
                        avatarUrl: userData.avatarUrl,
                        token: userData.accessToken
                    }));
                } else {
                    // Store in sessionStorage for session-only
                    sessionStorage.setItem('accessToken', userData.accessToken);
                    sessionStorage.setItem('refreshToken', userData.refreshToken);
                    sessionStorage.setItem('user', JSON.stringify({
                        userId: userData.userId,
                        email: userData.email,
                        name: userData.name,
                        role: userData.role,
                        active: userData.active,
                        avatarUrl: userData.avatarUrl,
                        token: userData.accessToken
                    }));
                }

                // Update auth context with user data
                login({
                    userId: userData.userId,
                    email: userData.email,
                    name: userData.name,
                    role: userData.role,
                    active: userData.active,
                    avatarUrl: userData.avatarUrl,
                    token: userData.accessToken,
                    loginTime: new Date().toISOString()
                });

                alert(`Đăng nhập thành công! Chào mừng ${userData.name}!`);

                // Redirect to intended page or home
                const from = location.state?.from?.pathname || '/';
                navigate(from, { replace: true });
            } else {
                // If API login fails, try fallback to local authentication
                console.log('API login failed, trying local authentication...');

                const result = loginWithCredentials(formData.email, formData.password);

                if (result.success) {
                    console.log('Local Login successful:', result.user);
                    alert('Đăng nhập thành công (chế độ demo)!');

                    const from = location.state?.from?.pathname || '/';
                    navigate(from, { replace: true });
                } else {
                    setError(apiResult.message || result.message || 'Email hoặc mật khẩu không đúng');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute top-40 right-20 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-pink-400/15 rounded-full blur-2xl animate-pulse delay-2000"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Login Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">🔐</div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng nhập</h1>
                        <p className="text-gray-600">Chào mừng bạn trở lại DatShop!</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Default Account Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <div className="text-sm text-blue-800">
                                <p className="font-semibold mb-1">🎯 Tài khoản demo:</p>
                                <p>Email: <span className="font-mono bg-blue-100 px-2 py-1 rounded">dat@gmail.com</span></p>
                                <p>Mật khẩu: <span className="font-mono bg-blue-100 px-2 py-1 rounded">dat</span></p>
                                <p className="text-xs mt-1 text-blue-600">💡 Hệ thống sẽ tự động thử API trước, sau đó fallback về demo</p>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                                <p className="text-red-700 text-sm">❌ {error}</p>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                📧 Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-800 bg-white"
                                placeholder="Nhập địa chỉ email"
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                🔒 Mật khẩu
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-800 bg-white"
                                    placeholder="Nhập mật khẩu"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                            </label>
                            <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                                Quên mật khẩu?
                            </a>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    ⏳ Đang đăng nhập...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    🚀 Đăng nhập
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-4 text-gray-500 text-sm">hoặc</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Social Login */}
                    <div className="space-y-3">
                        <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
                            <span className="flex items-center justify-center gap-2">
                                🌐 Đăng nhập với Google
                            </span>
                        </button>
                        <button className="w-full bg-blue-800 hover:bg-blue-900 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
                            <span className="flex items-center justify-center gap-2">
                                📘 Đăng nhập với Facebook
                            </span>
                        </button>
                    </div>

                    {/* Sign Up Link */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Chưa có tài khoản?{' '}
                            <a href="/register" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                                Đăng ký ngay
                            </a>
                        </p>
                    </div>

                    {/* Back to Home */}
                    <div className="mt-4 text-center">
                        <a href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
                            ← Về trang chủ
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
