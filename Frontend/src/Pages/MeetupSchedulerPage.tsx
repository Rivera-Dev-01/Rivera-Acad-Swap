import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Plus } from 'lucide-react';
import NavigationMenu from '../components/NavigationMenu';
import CreateMeetupModal from '../components/CreateMeetupModal.tsx';
import MeetupDetailModal from '../components/MeetupDetailModal.tsx';
import ProfileAvatar from '../components/ProfileAvatar';

interface Meetup {
    id: string;
    item_id: string;
    seller_id: string;
    buyer_id: string;
    title: string;
    scheduled_date: string;
    scheduled_time: string;
    location_name: string;
    location_lat: number;
    location_lng: number;
    notes: string;
    status: string;
    cancellation_reason?: string;
    created_at: string;
    seller_first_name: string;
    seller_last_name: string;
    seller_email: string;
    seller_profile_picture?: string;
    buyer_first_name: string;
    buyer_last_name: string;
    buyer_email: string;
    buyer_profile_picture?: string;
    item_title: string;
    item_price: number;
    item_images: string[];
}

const MeetupSchedulerPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [meetups, setMeetups] = useState<Meetup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedMeetup, setSelectedMeetup] = useState<Meetup | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

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

    useEffect(() => {
        if (user) {
            fetchMeetups();
        }
    }, [user]);

    const fetchMeetups = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('sb-access-token') || localStorage.getItem('access_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/meetup/my-meetups`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (result.success && result.data) {
                setMeetups(result.data);
            }
        } catch (error) {
            console.error('Error fetching meetups:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400';
            case 'confirmed':
                return 'bg-blue-500/20 border-blue-500/40 text-blue-400';
            case 'completed':
                return 'bg-green-500/20 border-green-500/40 text-green-400';
            case 'cancelled_by_seller':
            case 'cancelled_by_buyer':
                return 'bg-red-500/20 border-red-500/40 text-red-400';
            default:
                return 'bg-gray-500/20 border-gray-500/40 text-gray-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Pending';
            case 'confirmed':
                return 'Confirmed';
            case 'completed':
                return 'Completed';
            case 'cancelled_by_seller':
                return 'Cancelled by Seller';
            case 'cancelled_by_buyer':
                return 'Cancelled by Buyer';
            default:
                return status;
        }
    };

    const filteredMeetups = meetups.filter(meetup => {
        if (activeTab === 'all') return true;
        if (activeTab === 'pending') return meetup.status === 'pending';
        if (activeTab === 'confirmed') return meetup.status === 'confirmed';
        if (activeTab === 'completed') return meetup.status === 'completed';
        if (activeTab === 'cancelled') return meetup.status.includes('cancelled');
        return true;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    if (!user || isLoading) {
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
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Meetup Scheduler</span>
                            </h1>
                            <p className="text-gray-400">Coordinate safe meetups with buyers and sellers</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center space-x-2"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Schedule Meetup</span>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6 flex items-center space-x-2 overflow-x-auto pb-2">
                        {[
                            { id: 'all', label: 'All', count: meetups.length },
                            { id: 'pending', label: 'Pending', count: meetups.filter(m => m.status === 'pending').length },
                            { id: 'confirmed', label: 'Confirmed', count: meetups.filter(m => m.status === 'confirmed').length },
                            { id: 'completed', label: 'Completed', count: meetups.filter(m => m.status === 'completed').length },
                            { id: 'cancelled', label: 'Cancelled', count: meetups.filter(m => m.status.includes('cancelled')).length }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white'
                                    : 'bg-slate-800/50 text-gray-400 hover:bg-slate-800'
                                    }`}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>

                    {/* Meetups List */}
                    <div className="space-y-4">
                        {filteredMeetups.length === 0 ? (
                            <div className="text-center py-20">
                                <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No meetups found</h3>
                                <p className="text-gray-400 mb-6">
                                    {activeTab === 'all'
                                        ? 'Schedule your first meetup to get started!'
                                        : `No ${activeTab} meetups at the moment.`
                                    }
                                </p>
                                {activeTab === 'all' && (
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:shadow-lg transition-all"
                                    >
                                        Schedule Meetup
                                    </button>
                                )}
                            </div>
                        ) : (
                            filteredMeetups.map(meetup => {
                                const isSeller = meetup.seller_id === user.id;

                                return (
                                    <div
                                        key={meetup.id}
                                        onClick={() => {
                                            setSelectedMeetup(meetup);
                                            setShowDetailModal(true);
                                        }}
                                        className="bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/50 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-xl font-bold">{meetup.title || meetup.item_title}</h3>
                                                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(meetup.status)}`}>
                                                        {getStatusLabel(meetup.status)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-gray-400 text-sm">{isSeller ? 'Buyer' : 'Seller'}:</span>
                                                    <ProfileAvatar
                                                        userId={isSeller ? meetup.buyer_id : meetup.seller_id}
                                                        firstName={isSeller ? meetup.buyer_first_name : meetup.seller_first_name}
                                                        lastName={isSeller ? meetup.buyer_last_name : meetup.seller_last_name}
                                                        profilePicture={isSeller ? meetup.buyer_profile_picture : meetup.seller_profile_picture}
                                                        size="sm"
                                                        showName={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-emerald-400">₱{meetup.item_price}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="flex items-center space-x-2 text-gray-300">
                                                <Calendar className="w-4 h-4 text-blue-400" />
                                                <span className="text-sm">{formatDate(meetup.scheduled_date)}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-gray-300">
                                                <Clock className="w-4 h-4 text-emerald-400" />
                                                <span className="text-sm">{formatTime(meetup.scheduled_time)}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-gray-300">
                                                <MapPin className="w-4 h-4 text-pink-400" />
                                                <span className="text-sm truncate">{meetup.location_name}</span>
                                            </div>
                                        </div>

                                        {meetup.notes && (
                                            <div className="mt-4 pt-4 border-t border-slate-700">
                                                <p className="text-sm text-gray-400">{meetup.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Create Meetup Modal */}
            {showCreateModal && (
                <CreateMeetupModal
                    user={user}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchMeetups();
                    }}
                />
            )}

            {/* Meetup Detail Modal */}
            {showDetailModal && selectedMeetup && (
                <MeetupDetailModal
                    meetup={selectedMeetup}
                    user={user}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedMeetup(null);
                    }}
                    onUpdate={() => {
                        fetchMeetups();
                    }}
                />
            )}
        </div>
    );
};

export default MeetupSchedulerPage;
