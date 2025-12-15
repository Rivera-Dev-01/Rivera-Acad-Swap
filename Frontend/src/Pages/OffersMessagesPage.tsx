import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Clock, Check, X, Send, ArrowLeft, Package } from 'lucide-react';
import NavigationMenu from '../components/NavigationMenu';
import ProfileAvatar from '../components/ProfileAvatar';
import Toast from '../components/Toast';
import { API_BASE as API_URL } from '../config/constants';

// Custom Peso Icon Component
const PesoIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M5 6h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H5V6z" />
        <line x1="5" y1="6" x2="5" y2="20" />
        <line x1="3" y1="10" x2="11" y2="10" />
        <line x1="3" y1="14" x2="11" y2="14" />
    </svg>
);

interface Offer {
    id: string;
    item_id: string;
    buyer_id: string;
    seller_id: string;
    offer_amount: number;
    message: string;
    status: string;
    counter_amount?: number;
    counter_message?: string;
    created_at: string;
    item_title: string;
    item_price: number;
    item_image: string;
    buyer_first_name?: string;
    buyer_last_name?: string;
    buyer_profile_picture?: string;
    seller_first_name?: string;
    seller_last_name?: string;
    seller_profile_picture?: string;
}

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

const OffersMessagesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'messages'>('received');
    const [receivedOffers, setReceivedOffers] = useState<Offer[]>([]);
    const [sentOffers, setSentOffers] = useState<Offer[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-scroll to bottom of messages
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Fetch user once on mount
    useEffect(() => {
        fetchCurrentUser();
    }, []);

    // Fetch data when user is loaded or tab changes
    useEffect(() => {
        if (!user) return;

        if (activeTab === 'received') {
            fetchReceivedOffers();
        } else if (activeTab === 'sent') {
            fetchSentOffers();
        } else if (activeTab === 'messages') {
            fetchConversations();
        }
    }, [user, activeTab]);

    // Handle scroll
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-scroll when messages change
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => scrollToBottom(), 100);
        }
    }, [messages.length]);

    // Polling ONLY for active conversation messages (reduced frequency)
    useEffect(() => {
        if (!selectedConversation) return;

        // Poll every 5 seconds (less aggressive)
        const messageInterval = setInterval(() => {
            fetchMessages(selectedConversation.other_user_id);
        }, 5000);

        return () => clearInterval(messageInterval);
    }, [selectedConversation?.other_user_id]);

    // Handle navigation state to open specific conversation
    useEffect(() => {
        const state = location.state as any;
        if (state?.openConversation && user) {
            // Switch to messages tab
            setActiveTab('messages');

            // Check if conversation already exists
            const existingConv = conversations.find(c => c.other_user_id === state.openConversation);

            if (existingConv) {
                // Open existing conversation
                handleConversationClick(existingConv);
            } else {
                // Create new conversation object
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

            // Clear the navigation state
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

    const fetchReceivedOffers = async () => {
        setLoading(true);
        const token = localStorage.getItem('access_token');

        try {
            const response = await fetch(`${API_URL}/offer/received`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setReceivedOffers(data.offers);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSentOffers = async () => {
        setLoading(true);
        const token = localStorage.getItem('access_token');

        try {
            const response = await fetch(`${API_URL}/offer/sent`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setSentOffers(data.offers);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
        } finally {
            setLoading(false);
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

    const handleOfferAction = async (offerId: string, status: string) => {
        const token = localStorage.getItem('access_token');

        try {
            const response = await fetch(`${API_URL}/offer/${offerId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            const data = await response.json();
            if (data.success) {
                setToast({ message: `Offer ${status}!`, type: 'success' });
                fetchReceivedOffers();
            } else {
                setToast({ message: data.message, type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'Failed to update offer', type: 'error' });
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const messageText = newMessage;
        const token = localStorage.getItem('access_token');

        // Optimistic update - add message immediately to UI
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
                // Refresh to get the real message with proper ID
                fetchMessages(selectedConversation.other_user_id);
            } else {
                // Remove temp message on error
                setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
                setNewMessage(messageText);
                setToast({ message: 'Failed to send message', type: 'error' });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Remove temp message on error
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

    const pendingOffers = receivedOffers.filter(o => o.status === 'pending').length;
    const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
            <NavigationMenu user={user} onLogout={() => { localStorage.clear(); navigate('/'); }} />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className={`glass-card rounded-2xl p-8 mb-8 transition-all duration-300 ${scrolled ? 'bg-opacity-90 backdrop-blur-[40px]' : ''
                    }`}>
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                            <MessageCircle className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">Offers & Messages</h1>
                            <p className="text-gray-400 mt-1">Manage your offers and communicate with others</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="glass-card-gradient rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                    <PesoIcon className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">{pendingOffers}</p>
                                    <p className="text-sm text-gray-400">Pending Offers</p>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card-gradient rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                    <MessageCircle className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">{totalUnread}</p>
                                    <p className="text-sm text-gray-400">Unread Messages</p>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card-gradient rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">{conversations.length}</p>
                                    <p className="text-sm text-gray-400">Conversations</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex flex-wrap gap-3">
                    <button
                        onClick={() => setActiveTab('received')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'received'
                            ? 'bg-gradient-to-r from-blue-600 to-emerald-600 shadow-lg shadow-blue-500/50'
                            : 'glass-card hover:bg-slate-800/50'
                            }`}
                    >
                        Received Offers ({receivedOffers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'sent'
                            ? 'bg-gradient-to-r from-blue-600 to-emerald-600 shadow-lg shadow-blue-500/50'
                            : 'glass-card hover:bg-slate-800/50'
                            }`}
                    >
                        Sent Offers ({sentOffers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'messages'
                            ? 'bg-gradient-to-r from-blue-600 to-emerald-600 shadow-lg shadow-blue-500/50'
                            : 'glass-card hover:bg-slate-800/50'
                            }`}
                    >
                        Messages ({conversations.length})
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : activeTab === 'messages' ? (
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
                ) : (
                    <div className="space-y-4">
                        {(activeTab === 'received' ? receivedOffers : sentOffers).map((offer) => (
                            <div
                                key={offer.id}
                                className={`glass-card glass-card-hover rounded-2xl p-6 transition-all duration-300 ${scrolled ? 'bg-opacity-90 backdrop-blur-[40px]' : ''
                                    }`}
                            >
                                <div className="flex flex-col md:flex-row md:items-start gap-6">
                                    {offer.item_image && (
                                        <img
                                            src={offer.item_image}
                                            alt={offer.item_title}
                                            className="w-full md:w-32 h-32 object-cover rounded-xl"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <h3 className="text-xl font-bold">{offer.item_title}</h3>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${offer.status === 'pending' ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-400' :
                                                offer.status === 'accepted' ? 'bg-green-500/20 border border-green-500/40 text-green-400' :
                                                    'bg-red-500/20 border border-red-500/40 text-red-400'
                                                }`}>
                                                {offer.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="mb-3">
                                            <ProfileAvatar
                                                userId={activeTab === 'received' ? offer.buyer_id : offer.seller_id}
                                                firstName={activeTab === 'received' ? offer.buyer_first_name! : offer.seller_first_name!}
                                                lastName={activeTab === 'received' ? offer.buyer_last_name! : offer.seller_last_name!}
                                                profilePicture={activeTab === 'received' ? offer.buyer_profile_picture : offer.seller_profile_picture}
                                                size="sm"
                                                showName
                                            />
                                        </div>
                                        {offer.message && (
                                            <p className="text-gray-300 mb-4 italic">"{offer.message}"</p>
                                        )}
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-3xl font-bold text-emerald-400">₱{offer.offer_amount.toLocaleString()}</span>
                                                <span className="text-gray-400">Listed: ₱{offer.item_price.toLocaleString()}</span>
                                            </div>
                                            {activeTab === 'received' && offer.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleOfferAction(offer.id, 'accepted')}
                                                        className="px-5 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl hover:bg-emerald-500/30 transition-all text-emerald-400 font-semibold flex items-center gap-2"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleOfferAction(offer.id, 'rejected')}
                                                        className="px-5 py-2 bg-red-500/20 border border-red-500/40 rounded-xl hover:bg-red-500/30 transition-all text-red-400 font-semibold flex items-center gap-2"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Decline
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-3">{formatTime(offer.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {(activeTab === 'received' ? receivedOffers : sentOffers).length === 0 && (
                            <div className="glass-card rounded-2xl p-16 text-center">
                                <Package className="w-20 h-20 mx-auto mb-4 text-gray-600" />
                                <h3 className="text-2xl font-bold mb-2">No offers yet</h3>
                                <p className="text-gray-400 text-lg">
                                    {activeTab === 'received'
                                        ? 'Offers from buyers will appear here'
                                        : 'Your offers to sellers will appear here'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default OffersMessagesPage;
