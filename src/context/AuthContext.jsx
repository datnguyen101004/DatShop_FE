import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Tài khoản mặc định
    const defaultAccounts = [
        {
            username: 'dat',
            password: 'dat',
            email: 'dat@datshop.com',
            name: 'Dat Admin',
            role: 'admin'
        },
        {
            username: 'user',
            password: 'user',
            email: 'user@datshop.com',
            name: 'User Demo',
            role: 'user'
        }
    ];

    useEffect(() => {
        // Clean up any conflicting keys first
        const conflictingIsAuth = localStorage.getItem('isAuthenticated');
        if (conflictingIsAuth !== null) {
            console.log('Removing conflicting localStorage.isAuthenticated:', conflictingIsAuth);
            localStorage.removeItem('isAuthenticated');
        }
        const sessionConflictingIsAuth = sessionStorage.getItem('isAuthenticated');
        if (sessionConflictingIsAuth !== null) {
            console.log('Removing conflicting sessionStorage.isAuthenticated:', sessionConflictingIsAuth);
            sessionStorage.removeItem('isAuthenticated');
        }

        // Remove cart_guest key if it exists
        const guestCartKey = 'cart_guest';
        if (localStorage.getItem(guestCartKey)) {
            console.log('Removing cart_guest key from localStorage on app start');
            localStorage.removeItem(guestCartKey);
        }

        // Kiểm tra localStorage và sessionStorage khi component mount
        const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                console.log('Restoring user from storage:', parsedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing saved user:', error);
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const loginWithCredentials = (username, password) => {
        // Kiểm tra tài khoản mặc định
        const account = defaultAccounts.find(acc =>
            (acc.username === username && acc.password === password) ||
            (acc.email === username && acc.password === password)
        );

        if (account) {
            const userData = {
                id: account.username === 'dat' ? 1 : 2,
                username: account.username,
                email: account.email,
                name: account.name,
                role: account.role,
                loginTime: new Date().toISOString()
            };
            login(userData);
            return { success: true, user: userData };
        }

        // Có thể mở rộng để kiểm tra với database/API khác
        return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng!' };
    };

    const logout = () => {
        setUser(null);

        // Method 1: Clear specific keys (recommended for production)
        // Get all keys from localStorage and sessionStorage
        const localKeys = Object.keys(localStorage);
        const sessionKeys = Object.keys(sessionStorage);

        // Define keys to keep (if any) - empty array means clear all
        const keysToKeep = [];

        // Clear localStorage except keys to keep
        localKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });

        // Clear sessionStorage except keys to keep  
        sessionKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                sessionStorage.removeItem(key);
            }
        });

        // Alternative Method 2: Clear everything (simpler but more aggressive)
        // localStorage.clear();
        // sessionStorage.clear();

        // Dispatch event to notify other components about logout
        window.dispatchEvent(new CustomEvent('userLoggedOut'));

        console.log('All user-related localStorage and sessionStorage data cleared on logout');
    };

    const isAuthenticated = () => {
        // Check if user exists in state
        if (user !== null) {
            return true;
        }

        // If user state is null, check localStorage/sessionStorage for tokens and user data
        const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

        if (accessToken && savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                // If we have both token and user data, but state is null, restore the state
                if (parsedUser && parsedUser.userId) {
                    setUser(parsedUser); // Restore user state
                    return true;
                }
            } catch (error) {
                console.error('Error parsing saved user in isAuthenticated:', error);
                // Clean up corrupted data
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');
                localStorage.removeItem('accessToken');
                sessionStorage.removeItem('accessToken');
            }
        }

        return false;
    };

    const value = {
        user,
        login,
        loginWithCredentials,
        logout,
        isAuthenticated,
        isLoading,
        defaultAccounts
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
