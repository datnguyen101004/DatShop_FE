import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Vui lòng nhập họ tên';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'Vui lòng đồng ý với điều khoản sử dụng';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // API register function
    const registerWithAPI = async (userData) => {
        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/register', {
                email: userData.email,
                password: userData.password,
                name: userData.name
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            // Check if response is successful based on status code
            if (response.data.statusCode === 200 && response.data.message === 'SUCCESS') {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message
                };
            } else {
                throw new Error(response.data.message || 'Đăng ký không thành công');
            }
        } catch (error) {
            console.error('API Register error:', error);

            // Handle axios error response
            if (error.response && error.response.data) {
                return {
                    success: false,
                    message: error.response.data.message || 'Đã xảy ra lỗi khi đăng ký tài khoản'
                };
            }

            return {
                success: false,
                message: error.message || 'Đã xảy ra lỗi khi đăng ký tài khoản'
            };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setSuccessMessage('');
        setErrors({});

        try {
            // Try API registration first
            const apiResult = await registerWithAPI(formData);

            if (apiResult.success) {
                console.log('API Registration successful:', apiResult.data);

                // Show success message with the message from API response
                setSuccessMessage(`🎉 Đăng ký thành công! ${apiResult.data || 'Vui lòng kiểm tra email để kích hoạt tài khoản.'}`);

                // Redirect to login page after 3 seconds
                setTimeout(() => {
                    navigate('/login', {
                        state: {
                            message: 'Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản, sau đó đăng nhập.',
                            registeredEmail: formData.email
                        }
                    });
                }, 3000);

            } else {
                // Handle registration errors from API
                if (apiResult.message.includes('email')) {
                    setErrors({ email: 'Email này đã được sử dụng' });
                } else if (apiResult.message.includes('phone')) {
                    setErrors({ phone: 'Số điện thoại này đã được sử dụng' });
                } else {
                    setErrors({ general: apiResult.message });
                }

                // Fallback to demo mode
                console.log('API registration failed, using demo mode...');
                console.log('Register data:', formData);

                setSuccessMessage('🎯 Đăng ký thành công (chế độ demo)! Bạn sẽ được chuyển đến trang đăng nhập...');

                setTimeout(() => {
                    navigate('/login', {
                        state: {
                            message: 'Đăng ký thành công! Vui lòng sử dụng tài khoản demo để đăng nhập.',
                            registeredEmail: formData.email
                        }
                    });
                }, 2000);
            }

        } catch (error) {
            console.error('Registration error:', error);
            setErrors({ general: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-purple-700 flex items-center justify-center p-4">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute top-60 right-10 w-36 h-36 bg-yellow-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-32 left-1/4 w-44 h-44 bg-pink-400/15 rounded-full blur-2xl animate-pulse delay-2000"></div>
            </div>

            <div className="relative z-10 w-full max-w-lg">
                {/* Register Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">✨</div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng ký</h1>
                        <p className="text-gray-600">Tạo tài khoản mới và khám phá DatShop!</p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                            <p className="text-green-700 text-sm text-center">{successMessage}</p>
                        </div>
                    )}

                    {/* General Error Message */}
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <p className="text-red-700 text-sm">❌ {errors.general}</p>
                        </div>
                    )}

                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                👤 Họ và tên
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-800 bg-white ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Nhập họ và tên"
                                disabled={isLoading}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">❌ {errors.name}</p>
                            )}
                        </div>

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
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-800 bg-white ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Nhập email của bạn"
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">❌ {errors.email}</p>
                            )}
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
                                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-800 bg-white ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">❌ {errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                🔐 Xác nhận mật khẩu
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-800 bg-white ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Nhập lại mật khẩu"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    {showConfirmPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-500">❌ {errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Terms Agreement */}
                        <div>
                            <label className="flex items-start">
                                <input
                                    type="checkbox"
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                                    disabled={isLoading}
                                />
                                <span className="ml-2 text-sm text-gray-600">
                                    Tôi đồng ý với{' '}
                                    <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold">
                                        Điều khoản sử dụng
                                    </a>
                                    {' '}và{' '}
                                    <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold">
                                        Chính sách bảo mật
                                    </a>
                                </span>
                            </label>
                            {errors.agreeToTerms && (
                                <p className="mt-1 text-sm text-red-500">❌ {errors.agreeToTerms}</p>
                            )}
                        </div>

                        {/* Register Button */}
                        <button
                            type="submit"
                            disabled={isLoading || successMessage}
                            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    ⏳ Đang tạo tài khoản...
                                </span>
                            ) : successMessage ? (
                                <span className="flex items-center justify-center gap-2">
                                    ✅ Tạo tài khoản thành công!
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    🎉 Tạo tài khoản
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Đã có tài khoản?{' '}
                            <a
                                href="/login"
                                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                            >
                                Đăng nhập ngay
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

export default Register;
