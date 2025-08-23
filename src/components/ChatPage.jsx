import React, { useEffect, useState, useRef } from "react";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const ChatPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [chatRooms, setChatRooms] = useState([]); // Danh sách chat rooms
    const [roomError, setRoomError] = useState(""); // Lỗi chat rooms
    const [chatError, setChatError] = useState(""); // Lỗi chat
    const [selectedRoom, setSelectedRoom] = useState(null); // Room đã chọn
    const [messages, setMessages] = useState([]); // Tin nhắn
    const [newMessage, setNewMessage] = useState(""); // Tin nhắn mới
    const [conversationId, setConversationId] = useState(""); // conversationId cho chat
    const [loadingMessages, setLoadingMessages] = useState(false); // Loading state cho tin nhắn

    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    // Kết nối WebSocket
    const [stompClient, setStompClient] = useState(null);

    // Ref để scroll xuống tin nhắn cuối
    const messagesEndRef = useRef(null);

    // Function để scroll xuống cuối
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Auto-scroll khi có tin nhắn mới
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
    }, [isAuthenticated, navigate]);

    // Fetch danh sách chat rooms
    useEffect(() => {
        const fetchChatRooms = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/v1/chat/rooms/all", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.data.statusCode === 200) {
                    setChatRooms(response.data.data);
                } else {
                    setRoomError(response.data.message || "Lỗi khi tải danh sách chat rooms.");
                }
            } catch (err) {
                setRoomError("Lỗi mạng hoặc server không khả dụng.");
                console.error("Error fetching chat rooms:", err);
            }
        };

        if (token) {
            fetchChatRooms();
        }
    }, [token]);

    // Get other user ID from room
    const getOtherUserId = (room) => {
        const currentUserId = user?.userId;
        return room.user1Id === currentUserId ? room.user2Id : room.user1Id;
    };

    // Fetch tin nhắn chi tiết cho conversation
    const fetchMessagesForRoom = async (conversationId) => {
        setLoadingMessages(true);
        try {
            const response = await axios.get(`http://localhost:8080/api/v1/chat/rooms/${conversationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.statusCode === 200 && response.data.data) {
                const roomData = response.data.data;
                // Lọc và sắp xếp tin nhắn theo thời gian
                const validMessages = (roomData.listMessages || [])
                    .filter(msg => {
                        return msg &&
                            typeof msg === 'object' &&
                            msg.hasOwnProperty('senderId') &&
                            msg.hasOwnProperty('message') &&
                            msg.message !== 'SUCCESS' &&
                            typeof msg.message === 'string' &&
                            msg.message.trim() !== '';
                    })
                    .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt)); // Sắp xếp theo thời gian

                setMessages(validMessages);
                // Scroll xuống cuối sau khi load messages
                setTimeout(() => scrollToBottom(), 100);
            }
        } catch (err) {
            console.error("Error fetching messages:", err);
            setChatError("Lỗi khi tải tin nhắn");
        } finally {
            setLoadingMessages(false);
        }
    };

    // Xử lý khi click vào chat room
    const handleRoomClick = async (room) => {
        setSelectedRoom(room);
        setConversationId(room.conversationId);
        setChatError(""); // Clear any previous errors

        // Load tin nhắn chi tiết từ API thay vì dùng data có sẵn
        await fetchMessagesForRoom(room.conversationId);
    };

    // Kết nối WebSocket khi conversationId thay đổi
    useEffect(() => {
        if (!conversationId) return; // Không kết nối nếu chưa có conversationId

        const socket = new SockJS("http://localhost:8080/ws");
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            onConnect: () => {
                console.log("WebSocket kết nối thành công!");
                setStompClient(client); // Set client sau khi kết nối thành công
                // Đăng ký nhận tin nhắn cho conversationId
                client.subscribe(`/topic/${conversationId}`, (message) => {
                    const receivedData = JSON.parse(message.body);
                    console.log("Received message:", receivedData);

                    // Kiểm tra xem có phải là tin nhắn thực sự không
                    const isValidMessage = receivedData &&
                        typeof receivedData === 'object' &&
                        receivedData.hasOwnProperty('senderId') &&
                        receivedData.hasOwnProperty('message') &&
                        receivedData.message !== 'SUCCESS' &&
                        typeof receivedData.message === 'string' &&
                        receivedData.message.trim() !== '';

                    if (isValidMessage) {
                        // Chỉ add tin nhắn từ người khác (optimistic update đã xử lý tin nhắn của mình)
                        if (receivedData.senderId !== user?.userId) {
                            setMessages((prevMessages) => [...prevMessages, receivedData]);
                        }
                    }
                });
            },
            onStompError: (frame) => {
                console.error("Lỗi WebSocket:", frame);
                setChatError("Lỗi kết nối WebSocket");
                setStompClient(null); // Reset client khi có lỗi
            },
            debug: (str) => console.log("STOMP:", str),
            reconnectDelay: 5000,
        });

        client.activate();

        // Dọn dẹp WebSocket khi component bị unmount hoặc conversationId thay đổi
        return () => {
            if (client) {
                client.deactivate();
            }
            setStompClient(null); // Reset client khi cleanup
        };
    }, [conversationId, token]);

    // Gửi tin nhắn qua WebSocket
    const handleSendMessage = () => {
        if (!newMessage.trim()) return; // Kiểm tra nếu tin nhắn trống
        if (!stompClient || !stompClient.connected) return; // Kiểm tra kết nối WebSocket

        const messageText = newMessage;
        const messagePayload = {
            receiverId: getOtherUserId(selectedRoom),
            message: messageText,
        };

        // Optimistic update - thêm tin nhắn ngay lập tức vào UI
        const optimisticMessage = {
            senderId: user?.userId,
            message: messageText,
            timestamp: new Date().toISOString(),
            conversationId: conversationId
        };

        setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
        setNewMessage(""); // Xóa input ngay sau khi gửi

        // Gửi tin nhắn qua WebSocket
        stompClient.publish({
            destination: `/app/chat/${conversationId}`,
            body: JSON.stringify(messagePayload),
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">

                        {/* Chat Rooms Sidebar */}
                        <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    💬 Tin nhắn
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {chatRooms.length} cuộc trò chuyện
                                </p>
                            </div>

                            <div className="overflow-y-auto h-full">
                                {roomError ? (
                                    <div className="p-4 text-center">
                                        <p className="text-red-600 mb-4">{roomError}</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {chatRooms.length > 0 ? (
                                            chatRooms.map((room) => {
                                                const otherUserId = getOtherUserId(room);
                                                const isSelected = selectedRoom?.conversationId === room.conversationId;

                                                return (
                                                    <div
                                                        key={room.conversationId}
                                                        className={`p-4 cursor-pointer transition-all duration-200 ${isSelected
                                                            ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-r-4 border-purple-500'
                                                            : 'hover:bg-gray-50'
                                                            }`}
                                                        onClick={() => handleRoomClick(room)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${isSelected
                                                                ? 'bg-gradient-to-br from-purple-600 to-blue-600'
                                                                : 'bg-gradient-to-br from-purple-500 to-blue-500'
                                                                }`}>
                                                                {otherUserId.toString().slice(-1)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className={`font-semibold truncate ${isSelected ? 'text-purple-700' : 'text-gray-800'
                                                                    }`}>
                                                                    User #{otherUserId}
                                                                </div>
                                                                <div className="text-xs text-gray-500 truncate">
                                                                    {room.conversationId}
                                                                </div>
                                                                <div className="text-sm text-gray-600 truncate mt-1">
                                                                    {room.listMessages && room.listMessages.length > 0
                                                                        ? room.listMessages[room.listMessages.length - 1].content || 'Tin nhắn mới'
                                                                        : 'Chưa có tin nhắn nào'
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className="text-5xl mb-4">💬</div>
                                                <p className="text-gray-500 font-medium">
                                                    Chưa có cuộc trò chuyện nào
                                                </p>
                                                <p className="text-gray-400 text-sm mt-2">
                                                    Hãy bắt đầu trò chuyện từ profile của người khác!
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chat Section */}
                        <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg overflow-hidden">
                            {selectedRoom ? (
                                <div className="h-full flex flex-col">
                                    {/* Chat Header */}
                                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {getOtherUserId(selectedRoom).toString().slice(-1)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    Chat với User #{getOtherUserId(selectedRoom)}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {selectedRoom.conversationId}
                                                </p>
                                            </div>
                                            <div className="ml-auto">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${stompClient?.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {stompClient?.connected ? '🟢 Đã kết nối' : '🔴 Chưa kết nối'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
                                        {chatError ? (
                                            <div className="text-center py-8">
                                                <p className="text-red-600">{chatError}</p>
                                            </div>
                                        ) : loadingMessages ? (
                                            <div className="text-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                                                <p className="text-gray-500">Đang tải tin nhắn...</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {messages.length > 0 ? (
                                                    messages.map((msg, index) => {
                                                        // Debug log để kiểm tra structure của message
                                                        console.log("Message structure:", msg);

                                                        return (
                                                            <div
                                                                key={index}
                                                                className={`flex ${msg.senderId === user?.userId ? 'justify-end' : 'justify-start'}`}
                                                            >
                                                                <div className="flex items-end gap-2 max-w-xs lg:max-w-md">
                                                                    {msg.senderId !== user?.userId && (
                                                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                                            {msg.senderId?.toString().slice(-1) || '?'}
                                                                        </div>
                                                                    )}
                                                                    <div
                                                                        className={`px-4 py-2 rounded-lg ${msg.senderId === user?.userId
                                                                            ? 'bg-purple-600 text-white rounded-br-sm'
                                                                            : 'bg-white text-gray-800 shadow rounded-bl-sm'
                                                                            }`}
                                                                    >
                                                                        <p className="text-sm">{msg.message || msg.content}</p>
                                                                        {(msg.sentAt || msg.timestamp) && (
                                                                            <p className="text-xs opacity-70 mt-1">
                                                                                {new Date(msg.sentAt || msg.timestamp).toLocaleTimeString('vi-VN', {
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit',
                                                                                    second: '2-digit'
                                                                                })}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    {msg.senderId === user?.userId && (
                                                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                                            {user?.userId?.toString().slice(-1) || 'Me'}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <div className="text-6xl mb-4">💭</div>
                                                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                                            Bắt đầu cuộc trò chuyện
                                                        </h3>
                                                        <p className="text-gray-500">
                                                            Gửi tin nhắn đầu tiên để bắt đầu trò chuyện
                                                        </p>
                                                    </div>
                                                )}
                                                {/* Div để scroll xuống cuối */}
                                                <div ref={messagesEndRef} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-6 border-t border-gray-200 bg-white">
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder="Gõ tin nhắn..."
                                                disabled={!stompClient?.connected}
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={!stompClient?.connected || !newMessage.trim()}
                                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                            >
                                                Gửi
                                            </button>
                                        </div>
                                        {!stompClient?.connected && (
                                            <p className="text-red-500 text-sm mt-2">
                                                ⚠️ Chưa kết nối WebSocket. Đang thử kết nối lại...
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-8xl mb-6">💬</div>
                                        <h2 className="text-2xl font-bold text-gray-700 mb-4">
                                            Chọn một cuộc trò chuyện
                                        </h2>
                                        <p className="text-gray-500 text-lg">
                                            Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
