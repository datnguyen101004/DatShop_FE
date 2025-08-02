import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isAuthenticated, user } = useAuth();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Sample product data - trong thực tế sẽ fetch từ API
    const products = [
        {
            id: 1,
            name: 'iPhone 15 Pro Max',
            price: '29.990.000',
            originalPrice: '32.990.000',
            image: '📱',
            rating: 4.8,
            reviews: 1234,
            discount: 9,
            badge: 'Hot',
            description: 'iPhone 15 Pro Max với chip A17 Pro mạnh mẽ, camera chuyên nghiệp và thiết kế titan cao cấp.',
            features: [
                'Chip A17 Pro 3nm tiên tiến nhất',
                'Camera chính 48MP với tele 5x',
                'Màn hình Super Retina XDR 6.7 inch',
                'Thiết kế titan nhẹ và bền',
                'Pin trọn ngày, sạc nhanh MagSafe'
            ],
            specifications: {
                screen: '6.7 inch Super Retina XDR',
                processor: 'Apple A17 Pro',
                storage: '256GB',
                camera: '48MP + 12MP + 12MP',
                battery: '4441mAh',
                os: 'iOS 17'
            },
            images: ['📱', '📷', '🖥️', '🔋']
        },
        {
            id: 2,
            name: 'MacBook Air M3',
            price: '28.999.000',
            originalPrice: '31.999.000',
            image: '💻',
            rating: 4.9,
            reviews: 856,
            discount: 9,
            badge: 'New',
            description: 'MacBook Air M3 siêu mỏng nhẹ với hiệu năng vượt trội và thời lượng pin ấn tượng.',
            features: [
                'Chip M3 8-core CPU, 10-core GPU',
                'Màn hình Liquid Retina 13.6 inch',
                'Thời lượng pin lên đến 18 giờ',
                'Thiết kế siêu mỏng chỉ 11.3mm',
                'Bàn phím Magic Keyboard thoải mái'
            ],
            specifications: {
                screen: '13.6 inch Liquid Retina',
                processor: 'Apple M3',
                storage: '256GB SSD',
                memory: '8GB Unified Memory',
                battery: 'Lên đến 18 giờ',
                weight: '1.24kg'
            },
            images: ['💻', '⌨️', '🖱️', '🔌']
        },
        {
            id: 3,
            name: 'AirPods Pro 2',
            price: '5.999.000',
            originalPrice: '6.999.000',
            image: '🎧',
            rating: 4.7,
            reviews: 2341,
            discount: 14,
            badge: 'Sale',
            description: 'AirPods Pro thế hệ 2 với chống ồn chủ động nâng cấp và âm thanh không gian.',
            features: [
                'Chống ồn chủ động thế hệ mới',
                'Âm thanh không gian cá nhân hóa',
                'Chip H2 cho âm thanh vượt trội',
                'Thời lượng pin lên đến 30 giờ',
                'Chống nước IPX4'
            ],
            specifications: {
                driver: 'Dynamic driver tùy chỉnh',
                chip: 'Apple H2',
                battery: '6h + 24h (hộp sạc)',
                connectivity: 'Bluetooth 5.3',
                features: 'ANC, Spatial Audio',
                weight: '5.3g (mỗi bên)'
            },
            images: ['🎧', '🔊', '🎵', '🔋']
        },
        {
            id: 4,
            name: 'Samsung Galaxy S24',
            price: '22.990.000',
            originalPrice: '24.990.000',
            image: '📱',
            rating: 4.6,
            reviews: 987,
            discount: 8,
            badge: 'Popular',
            description: 'Galaxy S24 với AI tiên tiến, camera tele 3x và hiệu năng flagship mạnh mẽ.',
            features: [
                'Galaxy AI tích hợp sâu',
                'Camera tele 3x chất lượng cao',
                'Snapdragon 8 Gen 3 for Galaxy',
                'Màn hình Dynamic AMOLED 2X',
                'Thiết kế cao cấp với Gorilla Glass'
            ],
            specifications: {
                screen: '6.2 inch Dynamic AMOLED 2X',
                processor: 'Snapdragon 8 Gen 3',
                storage: '256GB',
                camera: '50MP + 12MP + 10MP',
                battery: '4000mAh',
                os: 'Android 14, One UI 6.1'
            },
            images: ['📱', '📸', '🌟', '⚡']
        },

        // Thêm các sản phẩm còn lại để đồng bộ với Products.jsx
        {
            id: 5,
            name: 'Samsung Galaxy S24 Ultra',
            price: '27.990.000',
            originalPrice: '30.990.000',
            image: '📱',
            rating: 4.5,
            reviews: 1456,
            discount: 10,
            badge: 'Hot',
            description: 'Galaxy S24 Ultra với S Pen tích hợp, camera 200MP và AI Galaxy Intelligence. Smartphone Android hàng đầu.',
            features: [
                'S Pen tích hợp thông minh với độ trễ thấp',
                'Camera chính 200MP siêu sắc nét',
                'Snapdragon 8 Gen 3 for Galaxy',
                'Galaxy AI tích hợp sâu vào hệ thống',
                'Màn hình Dynamic AMOLED 2X 6.8 inch'
            ],
            specifications: {
                screen: '6.8 inch Dynamic AMOLED 2X',
                processor: 'Snapdragon 8 Gen 3 for Galaxy',
                storage: '512GB',
                camera: 'Main 200MP + Ultra Wide 12MP + Telephoto 50MP + Telephoto 10MP',
                battery: '5000mAh với sạc nhanh 45W',
                os: 'Android 14, One UI 6.1'
            },
            images: ['📱', '✏️', '📸', '🌟']
        },
        {
            id: 6,
            name: 'Apple Watch Series 9',
            price: '8.999.000',
            originalPrice: '9.999.000',
            image: '⌚',
            rating: 4.7,
            reviews: 789,
            discount: 10,
            badge: 'Sale',
            description: 'Apple Watch Series 9 với chip S9, màn hình sáng hơn và tính năng sức khỏe tiên tiến.',
            features: [
                'Chip S9 hiệu năng cao, xử lý nhanh',
                'Màn hình sáng nhất từ trước đến nay',
                'Tính năng Double Tap hoàn toàn mới',
                'Theo dõi sức khỏe toàn diện 24/7',
                'Kháng nước 50m, bơi lội thoải mái'
            ],
            specifications: {
                display: '45mm Retina LTPO OLED Always-On',
                processor: 'Apple S9 SiP',
                storage: '64GB',
                sensors: 'ECG, Blood Oxygen, Temperature, Crash Detection',
                battery: 'Lên đến 18 giờ sử dụng',
                waterproof: '50m (WR50)'
            },
            images: ['⌚', '❤️', '🏃', '📱']
        },
        {
            id: 7,
            name: 'Sony WH-1000XM5',
            price: '7.999.000',
            originalPrice: '8.999.000',
            image: '🎧',
            rating: 4.8,
            reviews: 654,
            discount: 11,
            badge: 'Hot',
            description: 'Sony WH-1000XM5 với công nghệ chống ồn hàng đầu thế giới và chất lượng âm thanh Hi-Res Audio.',
            features: [
                'Chống ồn chủ động hàng đầu thế giới',
                'Chất lượng âm thanh Hi-Res Audio',
                'Pin 30 giờ sử dụng liên tục',
                'Sạc nhanh 3 phút = 3 giờ nghe nhạc',
                'Thiết kế nhẹ và thoải mái cả ngày'
            ],
            specifications: {
                driver: '30mm carbon fiber composite',
                battery: '30 giờ (ANC bật), 40 giờ (ANC tắt)',
                charging: 'USB-C, sạc nhanh',
                connectivity: 'Bluetooth 5.2, NFC, 3.5mm',
                weight: '250g',
                features: 'LDAC, DSEE Extreme, Speak-to-Chat'
            },
            images: ['🎧', '🎵', '🔋', '📱']
        },
        {
            id: 8,
            name: 'Nintendo Switch OLED',
            price: '8.490.000',
            originalPrice: '9.490.000',
            image: '🎮',
            rating: 4.6,
            reviews: 1123,
            discount: 11,
            badge: 'New',
            description: 'Nintendo Switch OLED với màn hình OLED 7 inch sống động và bộ nhớ trong 64GB.',
            features: [
                'Màn hình OLED 7 inch sống động',
                'Bộ nhớ trong 64GB (gấp đôi bản cũ)',
                'Dock mới với cổng LAN tích hợp',
                'Loa tăng cường chất lượng âm thanh',
                'Chân đế góc rộng cải tiến'
            ],
            specifications: {
                screen: '7 inch OLED multi-touch capacitive',
                storage: '64GB internal + microSD up to 2TB',
                battery: '4.5 - 9 giờ (tùy game)',
                connectivity: 'Wi-Fi 802.11ac, Bluetooth 4.1',
                resolution: '1280 x 720 (portable), 1920 x 1080 (TV)',
                dock: 'HDMI, USB 3.0 x2, USB 2.0, LAN'
            },
            images: ['🎮', '🖥️', '🎯', '⚡']
        },
        {
            id: 9,
            name: 'Áo Polo Nam Classic',
            price: '299.000',
            originalPrice: '399.000',
            image: '👕',
            rating: 4.5,
            reviews: 234,
            discount: 25,
            badge: 'Sale',
            description: 'Áo polo nam classic với chất liệu cotton cao cấp, thiết kế tinh tế và thoải mái.',
            features: [
                'Chất liệu cotton 100% cao cấp từ Ai Cập',
                'Thiết kế classic timeless không lỗi mốt',
                'Form dáng regular fit thoải mái',
                'Màu sắc đa dạng dễ phối đồ',
                'Dễ dàng bảo quản và giặt máy'
            ],
            specifications: {
                material: '100% Premium Cotton',
                fit: 'Regular Fit',
                sizes: 'S, M, L, XL, XXL',
                colors: 'Trắng, Đen, Navy, Xám, Xanh lá',
                care: 'Machine wash 30°C, iron medium',
                origin: 'Made in Vietnam'
            },
            images: ['👕', '🎨', '📏', '✨']
        },
        {
            id: 10,
            name: 'Giày Sneaker Unisex',
            price: '1.299.000',
            originalPrice: '1.599.000',
            image: '👟',
            rating: 4.4,
            reviews: 567,
            discount: 19,
            badge: 'Hot',
            description: 'Giày sneaker unisex thời trang với đế êm ái chống trượt và thiết kế hiện đại.',
            features: [
                'Thiết kế unisex hiện đại trendy',
                'Đế giày êm ái công nghệ memory foam',
                'Chất liệu thoáng khí chống mùi',
                'Dễ dàng phối đồ với mọi outfit',
                'Bền bỉ với thời gian sử dụng lâu dài'
            ],
            specifications: {
                material: 'Synthetic Leather + Breathable Mesh',
                sole: 'Rubber anti-slip với memory foam',
                sizes: '36, 37, 38, 39, 40, 41, 42, 43, 44',
                colors: 'Trắng, Đen, Trắng-Đen, Xám',
                weight: '300g/giày',
                origin: 'Made in Vietnam'
            },
            images: ['👟', '🏃', '✨', '🎨']
        },
        {
            id: 15,
            name: 'Bàn Làm Việc Gỗ Cao Su',
            price: '2.999.000',
            originalPrice: '3.999.000',
            image: '🪑',
            rating: 4.6,
            reviews: 234,
            discount: 25,
            badge: 'New',
            description: 'Bàn làm việc gỗ cao su tự nhiên với thiết kế hiện đại, bền bỉ và thân thiện với môi trường.',
            features: [
                'Gỗ cao su tự nhiên 100% từ rừng trồng',
                'Thiết kế hiện đại, tối giản Scandinavian',
                'Bề mặt chống trầy xước và chống nước',
                'Khung chân thép sơn tĩnh điện chắc chắn',
                'Dễ lắp ráp và vệ sinh hàng ngày'
            ],
            specifications: {
                material: '100% Natural Rubber Wood + Steel Frame',
                dimensions: '120 x 60 x 75 cm (DxRxC)',
                weight: '25kg',
                finish: 'Natural wood finish với clear coat',
                frame: 'Steel powder coated black',
                assembly: 'Required (30-45 phút với hướng dẫn)'
            },
            images: ['🪑', '🌳', '⚙️', '✨']
        },
        {
            id: 20,
            name: 'Sách Lập Trình Python',
            price: '299.000',
            originalPrice: '399.000',
            image: '📚',
            rating: 4.8,
            reviews: 456,
            discount: 25,
            badge: 'New',
            description: 'Sách học lập trình Python từ cơ bản đến nâng cao với các project thực tế.',
            features: [
                'Từ cơ bản đến nâng cao cho mọi level',
                'Hơn 50 project thực tế áp dụng ngay',
                'Code examples chi tiết dễ hiểu',
                'Bài tập có lời giải đầy đủ',
                'Cập nhật Python 3.12 và các thư viện mới nhất'
            ],
            specifications: {
                pages: '450 trang full color',
                language: 'Tiếng Việt',
                publisher: 'NXB Thông tin và Truyền thông',
                edition: 'Lần xuất bản thứ 3, 2024',
                format: 'Paperback 16x24cm',
                isbn: '978-604-80-1234-5'
            },
            images: ['📚', '🐍', '💻', '📝']
        },
        {
            id: 23,
            name: 'Bóng Đá FIFA World Cup',
            price: '899.000',
            originalPrice: '1.199.000',
            image: '⚽',
            rating: 4.5,
            reviews: 567,
            discount: 25,
            badge: 'New',
            description: 'Bóng đá FIFA World Cup chính thức với công nghệ Al Rihla và chất lượng professional.',
            features: [
                'FIFA World Cup Qatar 2022 official ball',
                'Công nghệ Al Rihla aerodynamics tiên tiến',
                'Chất lượng professional tournament grade',
                'Độ bền cao, chống nước và UV',
                'Thiết kế độc quyền chỉ có tại World Cup'
            ],
            specifications: {
                size: 'Size 5 official (68-70cm circumference)',
                material: 'Premium synthetic leather',
                technology: 'Al Rihla aerodynamics',
                certification: 'FIFA Quality Pro certified',
                weight: '410-450g',
                warranty: '6 tháng bảo hành'
            },
            images: ['⚽', '🏆', '🌟', '🎯']
        },
        {
            id: 24,
            name: 'Gậy Golf Titanium Pro',
            price: '12.999.000',
            originalPrice: '15.999.000',
            image: '🏌️',
            rating: 4.8,
            reviews: 123,
            discount: 19,
            badge: 'Hot',
            description: 'Gậy golf driver titanium professional với công nghệ Face Cup và shaft carbon.',
            features: [
                'Head titanium siêu nhẹ',
                'Công nghệ Face Cup',
                'Shaft carbon premium',
                'Loft angle điều chỉnh',
                'Professional tournament grade'
            ],
            specifications: {
                head_material: 'Ti-8Al-4V Titanium',
                shaft: 'Premium Carbon Fiber',
                loft: '9.5° (adjustable 8.5-11.5°)',
                length: '45.5 inches',
                weight: '310g',
                grip: 'Golf Pride Tour Velvet'
            },
            images: ['🏌️', '⛳', '🏆', '✨']
        }
    ];

    useEffect(() => {
        // Simulate API call
        setIsLoading(true);
        setTimeout(() => {
            const foundProduct = products.find(p => p.id === parseInt(id));
            setProduct(foundProduct);
            setIsLoading(false);
        }, 500);
    }, [id]);

    const handleAddToCart = () => {
        if (!isAuthenticated()) {
            navigate('/login', {
                state: { from: { pathname: `/product/${id}` } }
            });
            return;
        }

        if (product) {
            for (let i = 0; i < quantity; i++) {
                addToCart(product);
            }
            alert(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`);
        }
    };

    const handleBuyNow = () => {
        if (!isAuthenticated()) {
            navigate('/login', {
                state: { from: { pathname: `/product/${id}` } }
            });
            return;
        }

        handleAddToCart();
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-spin">⏳</div>
                    <p className="text-xl text-gray-600">Đang tải sản phẩm...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
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
        <div className="min-h-screen bg-gray-50 pt-20">{/* Added pt-20 for navbar space */}
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
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center mb-4">
                                <div className="text-[8rem] mb-4">{product.images[selectedImage]}</div>
                                {product.badge && (
                                    <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                                        {product.badge}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 justify-center">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`w-16 h-16 rounded-lg border-2 transition-all ${selectedImage === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="text-2xl">{img}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

                            {/* Rating */}
                            <div className="flex items-center mb-4">
                                <div className="flex text-yellow-400 text-lg mr-2">
                                    {'★'.repeat(Math.floor(product.rating))}
                                    {'☆'.repeat(5 - Math.floor(product.rating))}
                                </div>
                                <span className="text-gray-600">
                                    {product.rating} ({product.reviews.toLocaleString()} đánh giá)
                                </span>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <span className="text-3xl font-bold text-red-600">{formatPrice(product.price)}₫</span>
                                    {product.originalPrice && (
                                        <>
                                            <span className="text-xl text-gray-400 line-through">{formatPrice(product.originalPrice)}₫</span>
                                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-bold">
                                                -{product.discount}%
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">Mô tả sản phẩm</h3>
                                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                            </div>

                            {/* Features */}
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

                            {/* Quantity Selector */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">Số lượng</h3>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 text-black rounded-lg border border-gray-300 flex items-center justify-center hover:bg-blue-200 transition-colors"
                                    >
                                        −
                                    </button>
                                    <span className="w-16 text-black text-center font-semibold text-lg">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 text-black rounded-lg border border-gray-300 flex items-center justify-center hover:bg-blue-200 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 mb-6">
                                <button
                                    onClick={handleAddToCart}
                                    className={`flex-1 py-3 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/50'`}
                                >
                                    🛒 Thêm vào giỏ
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    className={`flex-1 py-3 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white focus:ring-orange-500/50`}
                                >
                                    ⚡ Mua ngay
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Specifications */}
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
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
