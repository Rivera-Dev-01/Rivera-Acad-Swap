import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Check, X, Clock } from 'lucide-react';
import NavigationMenu from '../components/NavigationMenu';
import ProfileAvatar from '../components/ProfileAvatar';
import Toast from '../components/Toast';
import { useRealtimeOffers } from '../hooks/useRealtimeData';
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

const OffersPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
    const [allOffers, setAllOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchAllOffers();
        }
    }, [user]);

    // Real-time offers - instant updates!
    useRealtimeOffers(user?.id || '', (newOffer) => {
        console.log('New offer received:', newOffer);
        fetchAllOffers(); // Refresh to get full offer data
    });

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    const fetchAllOffers = async () => {
        setLoading(true);
        const token = localStorage.getItem('access_token');

        try {
            // Fetch both received and sent offers in parallel
            const [receivedResponse, sentResponse] = await Promise.all([
                fetch(`${API_URL}/offer/received`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_URL}/offer/sent`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const receivedData = await receivedResponse.json();
            const sentData = await sentResponse.json();

            console.log('Received offers:', receivedData);
            console.log('Sent offers:', sentData);

            // Combine and mark offers with type
            const received = (receivedData.offers || []).map((offer: Offer) => ({ ...offer, type: 'received' }));
            const sent = (sentData.offers || []).map((offer: Offer) => ({ ...offer, type: 'sent' }));

            setAllOffers([...received, ...sent]);

            if (!receivedData.success || !sentData.success) {
                setToast({ message: 'Some offers failed to load', type: 'error' });
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
            setToast({ message: 'Failed to load offers', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

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
                fetchAllOffers();
            } else {
                setToast({ message: data.message, type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'Failed to update offer', type: 'error' });
        }
    };

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

    // Filter offers based on active tab
    const receivedOffers = allOffers.filter((o: any) => o.type === 'received');
    const sentOffers = allOffers.filter((o: any) => o.type === 'sent');

    const pendingOffers = receivedOffers.filter(o => o.status === 'pending').length;
    const acceptedOffers = receivedOffers.filter(o => o.status === 'accepted').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
            <NavigationMenu user={user} onLogout={() => { localStorage.clear(); navigate('/'); }} />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className={`glass-card rounded-2xl p-8 mb-8 transition-all duration-300 ${scrolled ? 'bg-opacity-90 backdrop-blur-[40px]' : ''
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
                                <PesoIcon className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold">Offers</h1>
                                <p className="text-gray-400 mt-1">Manage your item offers</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="glass-card-gradient rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">{pendingOffers}</p>
                                    <p className="text-sm text-gray-400">Pending</p>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card-gradient rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                    <Check className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">{acceptedOffers}</p>
                                    <p className="text-sm text-gray-400">Accepted</p>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card-gradient rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                    <Package className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">{sentOffers.length}</p>
                                    <p className="text-sm text-gray-400">Sent</p>
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
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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

export default OffersPage;
