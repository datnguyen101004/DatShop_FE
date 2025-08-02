import React, { useState } from 'react';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        agreeToTerms: false,
        receiveEmails: true
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

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

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Vui lòng nhập họ tên';
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

        if (!formData.phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
        } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Số điện thoại không hợp lệ';
        }

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'Vui lòng đồng ý với điều khoản sử dụng';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            console.log('Register data:', formData);
            alert('Đăng ký thành công! Chào mừng bạn đến với DatShop!');
            setIsLoading(false);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-purple-700 flex items-center justify-center p-4 pt-20">{/* Added pt-20 for navbar space */}
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

                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Full Name Field */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                                👤 Họ và tên
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-800 bg-white ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Nhập họ và tên"
                            />
                            {errors.fullName && (
                                <p className="mt-1 text-sm text-red-500">❌ {errors.fullName}</p>
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
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">❌ {errors.email}</p>
                            )}
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                📱 Số điện thoại
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-800 bg-white ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Nhập số điện thoại"
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-500">❌ {errors.phone}</p>
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
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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

                        {/* Email Notifications */}
                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="receiveEmails"
                                    checked={formData.receiveEmails}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="ml-2 text-sm text-gray-600">
                                    Nhận thông báo khuyến mãi qua email
                                </span>
                            </label>
                        </div>

                        {/* Register Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    ⏳ Đang tạo tài khoản...
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
                            <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
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
