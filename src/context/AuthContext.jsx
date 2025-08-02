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
    const defaultAccount = {
        username: 'dat',
        password: 'dat',
        email: 'dat@datshop.com',
        name: 'Dat Admin',
        role: 'admin'
    };

    useEffect(() => {
        // Kiểm tra localStorage khi component mount
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error('Error parsing saved user:', error);
                localStorage.removeItem('user');
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
        if (username === defaultAccount.username && password === defaultAccount.password) {
            const userData = {
                id: 1,
                username: defaultAccount.username,
                email: defaultAccount.email,
                name: defaultAccount.name,
                role: defaultAccount.role,
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
        localStorage.removeItem('user');
    };

    const isAuthenticated = () => {
        return user !== null;
    };

    const value = {
        user,
        login,
        loginWithCredentials,
        logout,
        isAuthenticated,
        isLoading,
        defaultAccount
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
