import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Cart = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pendingUpdates, setPendingUpdates] = useState({}); // Track pending quantity updates
    const debounceRef = useRef({});

    // Get localStorage key for user's cart - only for authenticated users
    const getCartStorageKey = () => {
        if (!user?.userId) return null; // Don't create cart_guest key
        return `cart_${user.userId}`;
    };

    // Save cart to localStorage - only for authenticated users
    const saveCartToLocalStorage = useCallback((items, shouldDispatchEvent = true) => {
        try {
            const cartKey = getCartStorageKey();
            if (!cartKey) return; // Don't save if user is not authenticated

            localStorage.setItem(cartKey, JSON.stringify(items));
            // Only dispatch custom event if explicitly requested (avoid infinite loops)
            if (shouldDispatchEvent) {
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            }
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }, [user]);

    // Load cart from localStorage - only for authenticated users
    const loadCartFromLocalStorage = useCallback(() => {
        try {
            const cartKey = getCartStorageKey();
            if (!cartKey) return []; // Return empty array if user is not authenticated

            const savedCart = localStorage.getItem(cartKey);
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            return [];
        }
    }, [user]);

    // Clean up cart_guest key if it exists
    useEffect(() => {
        const guestCartKey = 'cart_guest';
        if (localStorage.getItem(guestCartKey)) {
            console.log('Removing cart_guest key from localStorage');
            localStorage.removeItem(guestCartKey);
        }
    }, []); // Run only once on component mount

    // Merge server cart with local cart
    const mergeCartData = useCallback((serverItems, localItems) => {
        const merged = [...serverItems];

        // Add or update quantities from local storage
        localItems.forEach(localItem => {
            const serverItemIndex = merged.findIndex(item => item.productId === localItem.productId);
            if (serverItemIndex >= 0) {
                // Update quantity if local is different
                if (merged[serverItemIndex].quantity !== localItem.quantity) {
                    merged[serverItemIndex].quantity = localItem.quantity;
                }
            } else {
                // Add new item from local storage
                merged.push(localItem);
            }
        });

        return merged;
    }, []);

    // Fetch cart items from API
    const fetchCartItems = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

            if (!token) {
                setError('Vui lòng đăng nhập để xem giỏ hàng.');
                setLoading(false);
                return;
            }

            const response = await axios.get('http://localhost:8080/api/v1/user/cart/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.statusCode === 200 && response.data.message === 'SUCCESS') {
                const serverCartData = response.data.data || [];
                const localCartData = loadCartFromLocalStorage();

                // Merge server and local data
                const mergedCartData = mergeCartData(serverCartData, localCartData);

                setCartItems(mergedCartData);

                // Update localStorage with merged data (without dispatching event to avoid loop)
                saveCartToLocalStorage(mergedCartData, false);

                // Fetch product details for each cart item
                await fetchProductDetails(mergedCartData);
                setError(null);
            } else {
                throw new Error(response.data.message || 'Không thể tải giỏ hàng');
            }
        } catch (err) {
            console.error('Error fetching cart:', err);

            if (err.response?.status === 401) {
                setError('Vui lòng đăng nhập để xem giỏ hàng.');
            } else if (err.response?.status === 403) {
                setError('Bạn không có quyền truy cập giỏ hàng này.');
            } else {
                // Load from localStorage if API fails
                const localCartData = loadCartFromLocalStorage();
                if (localCartData.length > 0) {
                    setCartItems(localCartData);
                    await fetchProductDetails(localCartData);
                    setError('Đang hiển thị giỏ hàng offline. Một số thay đổi có thể chưa được đồng bộ.');
                } else {
                    setError(err.response?.data?.message || 'Không thể tải giỏ hàng. Vui lòng thử lại.');
                }
            }
        } finally {
            setLoading(false);
        }
    }, []); // Remove unnecessary dependencies to prevent infinite re-renders    // Fetch product details for cart items
    const fetchProductDetails = async (cartData) => {
        try {
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            const productPromises = cartData.map(async (item) => {
                try {
                    const response = await axios.get(`http://localhost:8080/api/v1/user/product/${item.productId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.data.statusCode === 200) {
                        return { [item.productId]: response.data.data };
                    }
                } catch (error) {
                    console.error(`Error fetching product ${item.productId}:`, error);
                    return { [item.productId]: null };
                }
                return null;
            });

            const productResults = await Promise.all(productPromises);
            const productMap = productResults.reduce((acc, result) => {
                if (result) {
                    return { ...acc, ...result };
                }
                return acc;
            }, {});

            setProducts(productMap);
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        // Initial fetch
        fetchCartItems();
    }, []); // Removed fetchCartItems from dependencies

    // Separate useEffect for event listener to avoid re-running fetchCartItems
    useEffect(() => {
        // Add event listener for cart updates - only update from localStorage to avoid API calls
        const handleCartUpdate = () => {
            console.log('Cart update event received, reloading from localStorage...');
            const localCartData = loadCartFromLocalStorage();
            if (localCartData.length > 0) {
                setCartItems(localCartData);
                fetchProductDetails(localCartData);
            } else {
                setCartItems([]);
                setProducts({});
            }
        };

        // Add event listener for user logout
        const handleUserLogout = () => {
            console.log('User logged out, clearing cart data...');
            setCartItems([]);
            setProducts({});
            setError(null);
        };

        window.addEventListener('cartUpdated', handleCartUpdate);
        window.addEventListener('userLoggedOut', handleUserLogout);

        // Cleanup function to clear event listeners
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
            window.removeEventListener('userLoggedOut', handleUserLogout);
        };
    }, []); // Empty dependency array to avoid re-registering events

    const formatPrice = (price) => {
        if (typeof price === 'string') {
            return parseFloat(price.replace(/\./g, '')).toLocaleString('vi-VN');
        }
        return price.toLocaleString('vi-VN');
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const product = products[item.productId];
            if (product) {
                return total + (product.price * item.quantity);
            }
            return total;
        }, 0);
    };

    // Debounced API update function - updates all items at once
    const debouncedUpdateAPI = useCallback(() => {
        // Clear existing timeout
        if (debounceRef.current.updateAll) {
            clearTimeout(debounceRef.current.updateAll);
        }

        // Set new timeout for batch update
        debounceRef.current.updateAll = setTimeout(async () => {
            try {
                const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

                if (!token || cartItems.length === 0) return;

                // Prepare items array for batch update
                const items = cartItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }));

                const response = await axios.put('http://localhost:8080/api/v1/user/cart/update', {
                    items: items
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.data.statusCode === 200 && response.data.message === 'SUCCESS') {
                    console.log('Successfully updated all cart items');
                    // Clear all pending updates
                    setPendingUpdates({});
                } else {
                    throw new Error(response.data.message || 'Failed to update quantities');
                }
            } catch (error) {
                console.error('Error updating cart quantities via API:', error);
                // You might want to show a toast notification here
                // For now, we'll leave the local state as is
            }
        }, 1000); // 1 second delay
    }, [cartItems]);

    const handleQuantityChange = async (cartItemId, productId, newQuantity) => {
        if (newQuantity === 0) {
            await removeFromCart(cartItemId);
        } else {
            await updateQuantity(cartItemId, newQuantity);
        }
    };

    const updateQuantity = async (cartItemId, quantity) => {
        try {
            // Update local state immediately for better UX
            const updatedItems = cartItems.map(item =>
                item.cartItemId === cartItemId
                    ? { ...item, quantity: quantity }
                    : item
            );

            setCartItems(updatedItems);

            // Save to localStorage immediately
            saveCartToLocalStorage(updatedItems);

            // Mark as pending update
            setPendingUpdates(prev => ({
                ...prev,
                [cartItemId]: { quantity, timestamp: Date.now() }
            }));

            // Trigger debounced API call for batch update
            debouncedUpdateAPI();

        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const removeFromCart = async (cartItemId) => {
        try {
            // Find the cart item to get productId
            const cartItem = cartItems.find(item => item.cartItemId === cartItemId);
            if (!cartItem) {
                console.error('Cart item not found');
                return;
            }

            // Update local state immediately for better UX
            const updatedItems = cartItems.filter(item => item.cartItemId !== cartItemId);
            setCartItems(updatedItems);

            // Save to localStorage immediately
            saveCartToLocalStorage(updatedItems);

            // Clear any pending debounced updates
            if (debounceRef.current.updateAll) {
                clearTimeout(debounceRef.current.updateAll);
            }

            // Call API to remove from server
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

            if (token) {
                try {
                    const response = await axios.delete(`http://localhost:8080/api/v1/user/cart/${cartItem.productId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.data.statusCode === 200 && response.data.message === 'SUCCESS') {
                        console.log(`Successfully removed product ${cartItem.productId} from cart`);
                    } else {
                        console.warn('Unexpected response for cart removal:', response.data);
                    }
                } catch (apiError) {
                    console.error('Error removing from cart via API:', apiError);
                    // We keep the local change even if API fails
                }
            }

        } catch (error) {
            console.error('Error removing from cart:', error);
            // Revert the optimistic update
            fetchCartItems();
        }
    };

    const clearCart = async () => {
        try {
            // Update local state immediately
            setCartItems([]);

            // Clear localStorage
            saveCartToLocalStorage([]);

            // Clear all pending debounced updates
            if (debounceRef.current.updateAll) {
                clearTimeout(debounceRef.current.updateAll);
            }
            debounceRef.current = {};
            setPendingUpdates({});

            // Call API to clear cart on server
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

            if (token) {
                try {
                    const response = await axios.delete(`http://localhost:8080/api/v1/user/cart/clear`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.data.statusCode === 200 && response.data.message === 'SUCCESS') {
                        console.log('Successfully cleared cart');
                    }
                } catch (apiError) {
                    console.error('Error clearing cart via API:', apiError);
                    // We keep the local change even if API fails
                }
            }

        } catch (error) {
            console.error('Error clearing cart:', error);
            // Revert the optimistic update
            fetchCartItems();
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            return;
        }
        navigate('/order');
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-600">Đang tải giỏ hàng...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Có lỗi xảy ra</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => fetchCartItems()}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                        >
                            Thử lại
                        </button>
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

    // Empty cart state
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Giỏ hàng trống</h2>
                    <p className="text-gray-600 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
                    <Link
                        to="/products"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                    >
                        Mua sắm ngay 🛍️
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
                        <span className="text-gray-900 font-medium">Giỏ hàng</span>
                    </nav>
                </div>
            </div>

            {/* Cart Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-2xl shadow-lg">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Giỏ hàng ({cartItems.length} sản phẩm)
                                    </h2>
                                    <button
                                        onClick={clearCart}
                                        className="text-red-600 hover:text-red-800 font-medium transition-colors"
                                    >
                                        🗑️ Xóa tất cả
                                    </button>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {cartItems.map((cartItem) => {
                                    const product = products[cartItem.productId];

                                    if (!product) {
                                        return (
                                            <div key={cartItem.cartItemId} className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                                                    <div className="flex-1">
                                                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                                                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={cartItem.cartItemId} className="p-6">
                                            <div className="flex items-center gap-4">
                                                {/* Product Image */}
                                                <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                                    {product.imageUrl ? (
                                                        <img
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover rounded-lg"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className="text-4xl text-gray-400" style={{ display: product.imageUrl ? 'none' : 'flex' }}>
                                                        📦
                                                    </div>
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                        {product.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-lg font-bold text-red-600">
                                                            {formatPrice(product.price)}₫
                                                        </span>
                                                    </div>
                                                    {product.description && (
                                                        <p className="text-gray-600 text-sm line-clamp-2">
                                                            {product.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleQuantityChange(cartItem.cartItemId, cartItem.productId, cartItem.quantity - 1)}
                                                        className="w-8 h-8 rounded-full text-black border border-gray-300 hover:bg-blue-200 flex items-center justify-center transition-colors"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="text-black w-12 text-center font-semibold">
                                                        {cartItem.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleQuantityChange(cartItem.cartItemId, cartItem.productId, cartItem.quantity + 1)}
                                                        className="w-8 h-8 rounded-full border text-black border-gray-300 flex items-center justify-center hover:bg-blue-200 transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    onClick={() => removeFromCart(cartItem.cartItemId)}
                                                    className="text-red-600 hover:text-red-800 p-2 transition-colors"
                                                    title="Xóa sản phẩm"
                                                >
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Tổng hóa đơn</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Số lượng sản phẩm:</span>
                                    <span className="font-medium text-gray-800">{cartItems.length}</span>
                                </div>
                                <div className="border-t border-gray-300 pt-4">
                                    <div className="flex justify-between items-center text-xl font-bold text-purple-800">
                                        <span>Tổng cộng:</span>
                                        <span>{formatPrice(calculateTotal())} VNĐ</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                    Thanh toán ngay 🛍️
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
