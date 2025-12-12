import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, DollarSign, Clock, Check, X } from 'lucide-react';
import NavigationMenu from '../components/NavigationMenu';

interface Message {
    id: number;
    from: string;
    item: string;
    message: string;
    timestamp: string;
    unread: boolean;
    type: 'message' | 'offer';
    offerAmount?: number;
    status?: 'pending' | 'accepted' | 'declined';
}

const OffersMessagesPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'offers' | 'messages'>('all');

    // Mock messages - replace with real data from backend
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            from: 'John Doe',
            item: 'Calculus 2 Textbook',
            message: 'Hi! Is this still available? Can I see more photos?',
            timestamp: '10 mins ago',
            unread: true,
            type: 'message'
        },
        {
            id: 2,
            from: 'Jane Smith',
            item: 'Gaming Mouse',
            message: 'I\'d like to offer ₱850 for this. Let me know!',
            timestamp: '1 hour ago',
            unread: true,
            type: 'offer',
            offerAmount: 850,
            status: 'pending'
        },
        {
            id: 3,
            from: 'Mike Johnson',
            item: 'Physics Notes',
            message: 'Can we meet tomorrow at the library?',
            timestamp: '3 hours ago',
            unread: false,
            type: 'message'
        },
        {
            id: 4,
            from: 'Sarah Lee',
            item: 'Calculus 2 Textbook',
            message: 'Would you accept ₱750?',
            timestamp: '1 day ago',
            unread: false,
            type: 'offer',
            offerAmount: 750,
            status: 'declined'
        }
    ]);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }
        try {
            setUser(JSON.parse(userData));
        } catch (error) {
            navigate('/login');
        }
    }, [navigate]);

    const handleAcceptOffer = (id: number) => {
        setMessages(messages.map(msg =>
            msg.id === id ? { ...msg, status: 'accepted' as const, unread: false } : msg
        ));
    };

    const handleDeclineOffer = (id: number) => {
        setMessages(messages.map(msg =>
            msg.id === id ? { ...msg, status: 'declined' as const, unread: false } : msg
        ));
    };

    const filteredMessages = messages.filter(msg => {
        if (activeTab === 'all') return true;
        if (activeTab === 'offers') return msg.type === 'offer';
        if (activeTab === 'messages') return msg.type === 'message';
        return true;
    });

    const unreadCount = messages.filter(m => m.unread).length;
    const pendingOffers = messages.filter(m => m.type === 'offer' && m.status === 'pending').length;

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
            {/* Animated Grid Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950"></div>
                <svg className="absolute inset-0 w-full h-full opacity-20">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            {/* Navigation */}
            <NavigationMenu
                user={user}
                onLogout={() => {
                    localStorage.clear();
                    navigate('/');
                }}
            />

            {/* Main Content */}
            <div className="relative pt-24 pb-12 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2">
                            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Offers & Messages</span>
                        </h1>
                        <p className="text-gray-400">Manage your offers and communicate with buyers</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="p-4 bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <MessageCircle className="w-8 h-8 text-blue-400" />
                                <div>
                                    <p className="text-2xl font-bold">{unreadCount}</p>
                                    <p className="text-sm text-gray-400">Unread Messages</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-900/50 backdrop-blur-xl border border-emerald-500/20 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <DollarSign className="w-8 h-8 text-emerald-400" />
                                <div>
                                    <p className="text-2xl font-bold">{pendingOffers}</p>
                                    <p className="text-sm text-gray-400">Pending Offers</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <Clock className="w-8 h-8 text-purple-400" />
                                <div>
                                    <p className="text-2xl font-bold">{messages.length}</p>
                                    <p className="text-sm text-gray-400">Total Conversations</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6 flex space-x-2">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-6 py-2 rounded-lg transition-all ${activeTab === 'all'
                                ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white'
                                : 'bg-slate-900/50 text-gray-400 hover:bg-slate-800/50'
                                }`}
                        >
                            All ({messages.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('offers')}
                            className={`px-6 py-2 rounded-lg transition-all ${activeTab === 'offers'
                                ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white'
                                : 'bg-slate-900/50 text-gray-400 hover:bg-slate-800/50'
                                }`}
                        >
                            Offers ({messages.filter(m => m.type === 'offer').length})
                        </button>
                        <button
                            onClick={() => setActiveTab('messages')}
                            className={`px-6 py-2 rounded-lg transition-all ${activeTab === 'messages'
                                ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white'
                                : 'bg-slate-900/50 text-gray-400 hover:bg-slate-800/50'
                                }`}
                        >
                            Messages ({messages.filter(m => m.type === 'message').length})
                        </button>
                    </div>

                    {/* Messages List */}
                    <div className="space-y-4">
                        {filteredMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`bg-slate-900/50 backdrop-blur-xl border rounded-2xl p-6 hover:border-blue-500/50 transition-all ${msg.unread ? 'border-blue-500/40' : 'border-blue-500/20'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-semibold">{msg.from}</h3>
                                            {msg.unread && (
                                                <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">New</span>
                                            )}
                                            {msg.type === 'offer' && (
                                                <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-full">
                                                    Offer
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-400 mb-2">Re: {msg.item}</p>
                                        <p className="text-gray-300 mb-3">{msg.message}</p>

                                        {msg.type === 'offer' && msg.offerAmount && (
                                            <div className="flex items-center space-x-4 mb-3">
                                                <span className="text-2xl font-bold text-emerald-400">₱{msg.offerAmount}</span>
                                                {msg.status === 'accepted' && (
                                                    <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-sm rounded-full flex items-center space-x-1">
                                                        <Check className="w-4 h-4" />
                                                        <span>Accepted</span>
                                                    </span>
                                                )}
                                                {msg.status === 'declined' && (
                                                    <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-400 text-sm rounded-full flex items-center space-x-1">
                                                        <X className="w-4 h-4" />
                                                        <span>Declined</span>
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">{msg.timestamp}</span>

                                            {msg.type === 'offer' && msg.status === 'pending' && (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAcceptOffer(msg.id);
                                                        }}
                                                        className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-all text-emerald-400 flex items-center space-x-1"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        <span>Accept</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeclineOffer(msg.id);
                                                        }}
                                                        className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all text-red-400 flex items-center space-x-1"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        <span>Decline</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* No Messages */}
                    {filteredMessages.length === 0 && (
                        <div className="text-center py-16">
                            <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No {activeTab} yet</h3>
                            <p className="text-gray-400">
                                {activeTab === 'offers'
                                    ? 'Offers from buyers will appear here'
                                    : 'Messages from interested buyers will appear here'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OffersMessagesPage;
