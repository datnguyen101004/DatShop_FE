import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Cart Context
const CartContext = createContext();

// Cart Actions
const CART_ACTIONS = {
    ADD_TO_CART: 'ADD_TO_CART',
    REMOVE_FROM_CART: 'REMOVE_FROM_CART',
    UPDATE_QUANTITY: 'UPDATE_QUANTITY',
    CLEAR_CART: 'CLEAR_CART',
    LOAD_CART: 'LOAD_CART'
};

// Cart Reducer
const cartReducer = (state, action) => {
    switch (action.type) {
        case CART_ACTIONS.ADD_TO_CART:
            const existingItem = state.items.find(item => item.id === action.payload.id);

            if (existingItem) {
                return {
                    ...state,
                    items: state.items.map(item =>
                        item.id === action.payload.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    )
                };
            } else {
                return {
                    ...state,
                    items: [...state.items, { ...action.payload, quantity: 1 }]
                };
            }

        case CART_ACTIONS.REMOVE_FROM_CART:
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload.id)
            };

        case CART_ACTIONS.UPDATE_QUANTITY:
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id
                        ? { ...item, quantity: Math.max(1, action.payload.quantity) }
                        : item
                )
            };

        case CART_ACTIONS.CLEAR_CART:
            return {
                ...state,
                items: []
            };

        case CART_ACTIONS.LOAD_CART:
            return {
                ...state,
                items: action.payload
            };

        default:
            return state;
    }
};

// Initial state
const initialState = {
    items: []
};

// Cart Provider
export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('datshop-cart');
        if (savedCart) {
            try {
                const cartData = JSON.parse(savedCart);
                dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData });
            } catch (error) {
                console.error('Error loading cart from localStorage:', error);
            }
        }
    }, []);

    // Save cart to localStorage whenever cart changes
    useEffect(() => {
        localStorage.setItem('datshop-cart', JSON.stringify(state.items));
    }, [state.items]);

    // Cart actions
    const addToCart = (product) => {
        dispatch({ type: CART_ACTIONS.ADD_TO_CART, payload: product });
    };

    const removeFromCart = (productId) => {
        dispatch({ type: CART_ACTIONS.REMOVE_FROM_CART, payload: { id: productId } });
    };

    const updateQuantity = (productId, quantity) => {
        dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { id: productId, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: CART_ACTIONS.CLEAR_CART });
    };

    // Computed values
    const cartItemsCount = state.items.reduce((total, item) => total + item.quantity, 0);

    const cartTotal = state.items.reduce((total, item) => {
        const price = parseFloat(item.price.replace(/\./g, ''));
        return total + (price * item.quantity);
    }, 0);

    const value = {
        items: state.items,
        cartItemsCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook to use cart
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default CartContext;
