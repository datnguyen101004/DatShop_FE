import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ isVisible = true }) => {
    const navigate = useNavigate();
    const { items } = useCart();
    const { isAuthenticated, logout, user } = useAuth();

    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-lg transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'
            }`}>
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <Link
                        to="/"
                        className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors duration-300"
                    >
                        DatShop
                    </Link>
                    <div className="flex items-center gap-4">
                        {isAuthenticated() ? (
                            <>
                                <Link
                                    to="/products"
                                    className="group px-4 py-2 rounded-lg font-semibold transition-all duration-300 border transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 hover:border-gray-400 focus:ring-purple-500"
                                >
                                    <span className="flex items-center gap-2">
                                        🛍️ Sản phẩm
                                    </span>
                                </Link>
                                <Link
                                    to="/cart"
                                    className="group px-4 py-2 rounded-lg font-semibold transition-all duration-300 border transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 relative bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 hover:border-gray-400 focus:ring-purple-500"
                                >
                                    <span className="flex items-center gap-2">
                                        🛒 Giỏ hàng
                                        {totalItems > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                {totalItems}
                                            </span>
                                        )}
                                    </span>
                                </Link>
                                <Link
                                    to="/create-product"
                                    className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-green-400/30 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-transparent"
                                >
                                    <span className="flex items-center gap-2">
                                        ➕ Thêm SP
                                    </span>
                                </Link>
                                <span className="px-4 py-2 text-gray-600">
                                    Xin chào, {user?.name || 'User'}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="group px-6 py-2 rounded-lg font-semibold transition-all duration-300 border transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-red-100 hover:bg-red-200 text-red-700 border-red-300 hover:border-red-400 focus:ring-red-500"
                                >
                                    <span className="flex items-center gap-2">
                                        🔒 Đăng xuất
                                    </span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/products"
                                    className="group px-4 py-2 rounded-lg font-semibold transition-all duration-300 border transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 hover:border-gray-400 focus:ring-purple-500"
                                >
                                    <span className="flex items-center gap-2">
                                        🛍️ Sản phẩm
                                    </span>
                                </Link>
                                <Link
                                    to="/login"
                                    className="group px-6 py-2 rounded-lg font-semibold transition-all duration-300 border transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 hover:border-gray-400 focus:ring-purple-500"
                                >
                                    <span className="flex items-center gap-2">
                                        👤 Đăng nhập
                                    </span>
                                </Link>
                                <Link
                                    to="/register"
                                    className="group bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-yellow-400/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-transparent"
                                >
                                    <span className="flex items-center gap-2">
                                        ✨ Đăng ký
                                    </span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;