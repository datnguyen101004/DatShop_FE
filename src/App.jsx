import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Products from './components/Products';
import ProductDetail from './components/ProductDetail';
import CreateProduct from './components/CreateProduct';
import Cart from './components/Cart';
import Order from './components/Order';
import OrderHistory from './components/OrderHistory';
import PaymentCallback from './components/PaymentCallback';
import Profile from './components/Profile';
import UserProfile from './components/UserProfile';
import ChatPage from './components/ChatPage';
import Chatbot from './components/Chatbot';
import SearchImage from './components/SearchImage';
import Shop from './components/Shop';

import './App.css'

function App() {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Hiện navbar khi ở đầu trang
      if (currentScrollY <= 100) {
        setIsNavbarVisible(true);
      }
      // Ẩn navbar khi cuộn xuống, hiện khi cuộn lên
      else if (currentScrollY > lastScrollY) {
        // Cuộn xuống - ẩn navbar
        setIsNavbarVisible(false);
      } else {
        // Cuộn lên - hiện navbar
        setIsNavbarVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar isVisible={isNavbarVisible} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<Products />} />
            <Route path="/special-offers" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/create-product" element={<CreateProduct />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order" element={<Order />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="/chat/:conversationId?" element={<ChatPage />} />
            <Route path="/search-image" element={<SearchImage />} />
            <Route path="/shop" element={<Shop />} />
          </Routes>

          {/* Chatbot Popup */}
          <Chatbot />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
