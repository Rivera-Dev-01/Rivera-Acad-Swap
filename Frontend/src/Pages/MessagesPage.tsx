import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';
import NavigationMenu from '../components/NavigationMenu';
import ProfileAvatar from '../components/ProfileAvatar';
import Toast from '../components/Toast';
import { useRealtimeMessages } from '../hooks/useRealtimeData';
import { API_BASE as API_URL } from '../config/constants';

interface Conversation {
    other_user_id: string;
    first_name: string;
    last_name: string;
    profile_picture: string;
    last_message: string;
    last_message_time: string;
    unread_count: number;
}

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    message: string;
    created_at: string;
    sender_first_name: string;
    sender_last_name: string;
    sender_profile_picture: string;
}

const MessagesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<any>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => scrollToBottom(), 100);
        }
    }, [messages.length, scrollToBottom]);

    // Real-time messages - no more polling!
    useRealtimeMessages(user?.id || '', (newMessage) => {
        console.log('New message received:', newMessage);

        // If message is for current conversation, add it
        if (selectedConversation &&
            (newMessage.sender_id === selectedConversation.other_user_id ||
                newMessage.receiver_id === selectedConversation.other_user_id)) {
            setMessages(prev => [...prev, newMessage]);
            scrollToBottom();
        }

        // Refresh conversations list
        fetchConversations();
    });

    // Handle navigation state
    useEffect(() => {
        const state = location.state as any;
        if (state?.openConversation && user) {
            const existingConv = conversations.find(c => c.other_user_id === state.openConversation);

            if (existingConv) {
                handleConversationClick(existingConv);
            } else {
                const newConv: Conversation = {
                    other_user_id: state.openConversation,
                    first_name: state.userName?.split(' ')[0] || 'User',
                    last_name: state.userName?.split(' ').slice(1).join(' ') || '',
                    profile_picture: state.profilePicture || '',
                    last_message: '',
                    last_message_time: new Date().toISOString(),
                    unread_count: 0
                };
                setSelectedConversation(newConv);
                fetchMessages(state.openConversation);
            }

            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, user, conversations]);

    const fetchCurrentUser = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/user/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setUser(data.user);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const fetchConversations = async () => {
        setLoading(true);
        const token = localStorage.getItem('access_token');

        try {
            const response = await fetch(`${API_URL}/offer/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = useCallback(async (otherUserId: string) => {
        const token = localStorage.getItem('access_token');

        try {
            const response = await fetch(`${API_URL}/offer/messages/${otherUserId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }, []);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const messageText = newMessage;
        const token = localStorage.getItem('access_token');

        const tempMessage: Message = {
            id: `temp-${Date.now()}`,
            sender_id: user.id,
            receiver_id: selectedConversation.other_user_id,
            message: messageText,
            created_at: new Date().toISOString(),
            sender_first_name: user.first_name,
            sender_last_name: user.last_name,
            sender_profile_picture: user.profile_picture
        };

        // Optimistic update
        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');

        try {
            const response = await fetch(`${API_URL}/offer/message/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    receiver_id: selectedConversation.other_user_id,
                    message: messageText
                })
            });

            const data = await response.json();
            if (data.success) {
                // Replace temp message with real one (no reload!)
                setMessages(prev => prev.map(m =>
                    m.id === tempMessage.id
                        ? { ...tempMessage, id: data.message_id || tempMessage.id }
                        : m
                ));
                // Update conversations list locally so it doesn't "reload" UX
                setConversations(prev =>
                    prev.map(conv =>
                        conv.other_user_id === selectedConversation.other_user_id
                            ? {
                                ...conv,
                                last_message: messageText,
                                last_message_time: new Date().toISOString(),
                                unread_count: 0
                            }
                            : conv
                    )
                );
            } else {
                // Rollback on error
                setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
                setNewMessage(messageText);
                setToast({ message: 'Failed to send message', type: 'error' });
            }
        } catch (error) {
            // Rollback on error
            setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
            setNewMessage(messageText);
            setToast({ message: 'Failed to send message', type: 'error' });
        }
    };

    const handleConversationClick = useCallback((conversation: Conversation) => {
        setSelectedConversation(conversation);
        fetchMessages(conversation.other_user_id);
    }, [fetchMessages]);

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
            <NavigationMenu user={user} onLogout={() => { localStorage.clear(); navigate('/'); }} />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className={`glass-card rounded-2xl p-8 mb-8 transition-all duration-300 ${scrolled ? 'bg-opacity-90 backdrop-blur-[40px]' : ''
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                                <MessageCircle className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold">Messages</h1>
                                <p className="text-gray-400 mt-1">Chat with other students</p>
                            </div>
                        </div>
                        {totalUnread > 0 && (
                            <div className="glass-card-gradient rounded-xl px-6 py-3">
                                <p className="text-3xl font-bold">{totalUnread}</p>
                                <p className="text-sm text-gray-400">Unread</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages Interface */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Conversations List */}
                        <div className={`glass-card rounded-2xl p-6 transition-all duration-300 ${scrolled ? 'bg-opacity-90 backdrop-blur-[40px]' : ''
                            }`}>
                            <h3 className="text-xl font-bold mb-4">Conversations</h3>
                            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                {conversations.length > 0 ? conversations.map((conv) => (
                                    <div
                                        key={conv.other_user_id}
                                        onClick={() => handleConversationClick(conv)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all ${selectedConversation?.other_user_id === conv.other_user_id
                                            ? 'bg-blue-500/20 border border-blue-500/40'
                                            : 'hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <ProfileAvatar
                                                userId={conv.other_user_id}
                                                firstName={conv.first_name}
                                                lastName={conv.last_name}
                                                profilePicture={conv.profile_picture}
                                                size="md"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold truncate">
                                                    {conv.first_name} {conv.last_name}
                                                </p>
                                                <p className="text-sm text-gray-400 truncate">{conv.last_message}</p>
                                            </div>
                                            {conv.unread_count > 0 && (
                                                <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                                                    {conv.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-12 text-gray-400">
                                        <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No conversations yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className={`lg:col-span-2 glass-card rounded-2xl p-6 transition-all duration-300 ${scrolled ? 'bg-opacity-90 backdrop-blur-[40px]' : ''
                            }`}>
                            {selectedConversation ? (
                                <>
                                    <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-700">
                                        <button onClick={() => setSelectedConversation(null)} className="lg:hidden">
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <ProfileAvatar
                                            userId={selectedConversation.other_user_id}
                                            firstName={selectedConversation.first_name}
                                            lastName={selectedConversation.last_name}
                                            profilePicture={selectedConversation.profile_picture}
                                            size="md"
                                        />
                                        <div>
                                            <p className="font-bold text-lg">
                                                {selectedConversation.first_name} {selectedConversation.last_name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="h-96 overflow-y-auto mb-4 space-y-3 px-2 scroll-smooth">
                                        {messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                                            >
                                                <div
                                                    className={`max-w-xs px-4 py-3 rounded-2xl transition-all duration-200 ${msg.sender_id === user.id
                                                        ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white'
                                                        : 'glass-card'
                                                        }`}
                                                >
                                                    <p className="break-words">{msg.message}</p>
                                                    <p className="text-xs opacity-70 mt-1">{formatTime(msg.created_at)}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="Type a message..."
                                            className="flex-1 px-4 py-3 glass-input rounded-xl"
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
                                    <MessageCircle className="w-20 h-20 mb-4 opacity-50" />
                                    <p className="text-lg">Select a conversation to start messaging</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default MessagesPage;
