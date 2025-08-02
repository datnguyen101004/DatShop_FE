import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithCredentials, defaultAccount } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Simulate loading time
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Attempt login with credentials
            const result = loginWithCredentials(formData.username, formData.password);

            if (result.success) {
                console.log('Login successful:', result.user);
                alert('Đăng nhập thành công!');

                // Redirect to intended page or home
                const from = location.state?.from?.pathname || '/';
                navigate(from, { replace: true });
            } else {
                setError(result.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Đăng nhập thất bại! Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4 pt-20">{/* Added pt-20 for navbar space */}
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
                                <p>Tên đăng nhập: <span className="font-mono bg-blue-100 px-2 py-1 rounded">dat</span></p>
                                <p>Mật khẩu: <span className="font-mono bg-blue-100 px-2 py-1 rounded">dat</span></p>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                                <p className="text-red-700 text-sm">❌ {error}</p>
                            </div>
                        )}

                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                                🔒 Tên đăng nhập
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-800 bg-white"
                                placeholder="Nhập tên đăng nhập"
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
                            <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
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
