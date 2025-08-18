import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                setIsLoading(true);

                // Get token from localStorage or sessionStorage
                const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

                const response = await axios.get(`http://localhost:8080/api/v1/user/product/${id}`, {
                    headers: {
                        ...(token && { 'Authorization': `Bearer ${token}` })
                    }
                });

                // Handle response based on API format
                if (response.data.statusCode === 200 && response.data.message === 'SUCCESS') {
                    setProduct(response.data.data);
                    setError(null);
                } else {
                    throw new Error(response.data.message || 'Không thể tải thông tin sản phẩm');
                }
            } catch (err) {
                console.error('Error fetching product details:', err);

                // Handle different types of errors
                if (err.response) {
                    if (err.response.status === 401) {
                        setError('Vui lòng đăng nhập để xem chi tiết sản phẩm.');
                    } else if (err.response.status === 403) {
                        setError('Bạn không có quyền truy cập sản phẩm này.');
                    } else if (err.response.status === 404) {
                        setError('Không tìm thấy sản phẩm này.');
                    } else {
                        setError(err.response.data?.message || 'Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
                    }
                } else {
                    setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchProductDetail();
        }
    }, [id]);

    const handleAddToCart = async () => {
        if (!isAuthenticated()) {
            navigate('/login', {
                state: { from: { pathname: `/product/${id}` } }
            });
            return;
        }

        if (product) {
            try {
                const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

                const requestBody = {
                    productId: parseInt(product.id),
                    quantity: quantity
                };

                const response = await axios.post('http://localhost:8080/api/v1/user/cart/add', requestBody, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.data.statusCode === 200 && response.data.message === 'SUCCESS') {
                    alert(`Đã thêm ${quantity} ${product.name} vào giỏ hàng thành công!`);
                } else {
                    throw new Error(response.data.message || 'Không thể thêm sản phẩm vào giỏ hàng');
                }
            } catch (error) {
                console.error('Error adding to cart:', error);
                if (error.response?.status === 401) {
                    alert('Vui lòng đăng nhập lại để thêm sản phẩm vào giỏ hàng.');
                    navigate('/login');
                } else {
                    alert(error.response?.data?.message || 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!');
                }
            }
        }
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated()) {
            navigate('/login', {
                state: { from: { pathname: `/product/${id}` } }
            });
            return;
        }

        await handleAddToCart();
        navigate('/cart');
    };

    const formatPrice = (price) => {
        if (typeof price === 'string') {
            return parseFloat(price.replace(/\./g, '')).toLocaleString('vi-VN');
        }
        return price.toLocaleString('vi-VN');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-600">Đang tải sản phẩm...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Có lỗi xảy ra</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                        >
                            Thử lại
                        </button>
                        <Link
                            to="/products"
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                        >
                            Về trang sản phẩm
                        </Link>
                        {error.includes('đăng nhập') && (
                            <Link
                                to="/login"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                            >
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😔</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy sản phẩm</h2>
                    <Link
                        to="/products"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                        Quay lại danh sách sản phẩm
                    </Link>
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
                        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
                        <span>→</span>
                        <Link to="/products" className="hover:text-blue-600">Sản phẩm</Link>
                        <span>→</span>
                        <span className="text-gray-900 font-medium">{product.name}</span>
                    </nav>
                </div>
            </div>

            {/* Product Detail */}
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                        {/* Product Images */}
                        <div>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center mb-4 h-96 flex items-center justify-center overflow-hidden">
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="max-w-full max-h-full object-contain rounded-lg"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div
                                    className="text-[8rem] flex items-center justify-center"
                                    style={{ display: product.imageUrl ? 'none' : 'flex' }}
                                >
                                    📦
                                </div>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

                            {/* Category & Stock Info */}
                            <div className="flex items-center gap-4 mb-4">
                                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                                    📂 {product.category || 'Chưa phân loại'}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${product.stockQuantity > 0
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-red-100 text-red-600'
                                    }`}>
                                    {product.stockQuantity > 0
                                        ? `📦 Còn lại ${product.stockQuantity} sản phẩm`
                                        : '❌ Hết hàng'}
                                </span>
                            </div>

                            {/* Author Info */}
                            {product.authorId && (
                                <div className="mb-4">
                                    <span className="text-gray-600">
                                        👤 Được bán bởi: <span className="font-semibold">User #{product.authorId}</span>
                                    </span>
                                </div>
                            )}

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <span className="text-4xl font-bold text-red-600">{formatPrice(product.price)}₫</span>
                                </div>
                            </div>

                            {/* Description */}
                            {product.description && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-2">Mô tả sản phẩm</h3>
                                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                                </div>
                            )}

                            {/* Features */}
                            {product.features && product.features.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-3">Tính năng nổi bật</h3>
                                    <ul className="space-y-2">
                                        {product.features.map((feature, index) => (
                                            <li key={index} className="flex items-center gap-2 text-gray-700">
                                                <span className="text-green-500">✓</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Quantity Selector */}
                            {product.stockQuantity > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-3">Số lượng</h3>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 text-black rounded-lg border border-gray-300 flex items-center justify-center hover:bg-blue-200 transition-colors"
                                            disabled={quantity <= 1}
                                        >
                                            −
                                        </button>
                                        <span className="w-16 text-black text-center font-semibold text-lg">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                                            className="w-10 h-10 text-black rounded-lg border border-gray-300 flex items-center justify-center hover:bg-blue-200 transition-colors"
                                            disabled={quantity >= product.stockQuantity}
                                        >
                                            +
                                        </button>
                                        <span className="text-sm text-gray-500 ml-2">
                                            (Tối đa {product.stockQuantity})
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-4 mb-6">
                                {product.stockQuantity > 0 ? (
                                    <>
                                        <button
                                            onClick={handleAddToCart}
                                            className="flex-1 py-3 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/50"
                                        >
                                            🛒 Thêm vào giỏ
                                        </button>
                                        <button
                                            onClick={handleBuyNow}
                                            className="flex-1 py-3 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white focus:ring-orange-500/50"
                                        >
                                            ⚡ Mua ngay
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex-1 py-3 px-6 rounded-xl font-bold text-lg bg-gray-300 text-gray-500 text-center">
                                        ❌ Sản phẩm đã hết hàng
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Specifications */}
                    {product.specifications && Object.keys(product.specifications).length > 0 && (
                        <div className="border-t p-8">
                            <h3 className="text-2xl font-bold mb-6">Thông số kỹ thuật</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(product.specifications).map(([key, value]) => (
                                    <div key={key} className="flex justify-between p-4 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-gray-700 capitalize">{key}:</span>
                                        <span className="text-gray-900">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
