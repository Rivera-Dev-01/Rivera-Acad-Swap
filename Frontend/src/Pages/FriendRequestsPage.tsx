import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Check, X, Users } from 'lucide-react';
import NavigationMenu from '../components/NavigationMenu';
import ProfileAvatar from '../components/ProfileAvatar';
import Toast from '../components/Toast';
import { useRealtimeFriendRequests } from '../hooks/useRealtimeData';
import { useOptimisticUpdate } from '../hooks/useOptimisticUpdate';
import { API_BASE as API_URL } from '../config/constants';

interface FriendRequest {
    id: string;
    sender_id: string;
    receiver_id: string;
    status: string;
    created_at: string;
    sender_first_name: string;
    sender_last_name: string;
    sender_profile_picture?: string;
    sender_course?: string;
}

const FriendRequestsPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Optimistic updates for instant UI feedback
    const {
        data: requests,
        setData: setRequests,
        deleteOptimistic
    } = useOptimisticUpdate<FriendRequest>([], {
        onSuccess: () => setToast({ message: 'Request updated!', type: 'success' }),
        onError: () => setToast({ message: 'Failed to update request', type: 'error' })
    });

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
            fetchFriendRequests();
        }
    }, [user]);

    // Real-time friend requests - instant updates!
    useRealtimeFriendRequests(user?.id || '', (newRequest) => {
        console.log('New friend request received:', newRequest);
        if (newRequest.status === 'pending') {
            fetchFriendRequests(); // Refresh to get full user data
        }
    });

    const fetchFriendRequests = async () => {
        const token = localStorage.getItem('access_token');

        try {
            const response = await fetch(`${API_URL}/friends/requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setRequests(data.requests || []);
            }
        } catch (error) {
            console.error('Error fetching friend requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (requestId: string, action: 'accept' | 'reject') => {
        const token = localStorage.getItem('access_token');

        // Optimistic update - remove from UI immediately
        await deleteOptimistic(requestId, async () => {
            const response = await fetch(`${API_URL}/friends/request/${requestId}/${action}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            return await response.json();
        });
    };

    if (!user || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
            <NavigationMenu user={user} onLogout={() => { localStorage.clear(); navigate('/'); }} />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="glass-card rounded-2xl p-8 mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                            <UserPlus className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">Friend Requests</h1>
                            <p className="text-gray-400 mt-1">Manage your friend requests</p>
                        </div>
                    </div>
                </div>

                {/* Friend Requests List */}
                <div className="space-y-4">
                    {requests.length === 0 ? (
                        <div className="glass-card rounded-2xl p-16 text-center">
                            <Users className="w-20 h-20 mx-auto mb-4 text-gray-600" />
                            <h3 className="text-2xl font-bold mb-2">No friend requests</h3>
                            <p className="text-gray-400 text-lg">
                                You don't have any pending friend requests
                            </p>
                        </div>
                    ) : (
                        requests.map((request) => (
                            <div
                                key={request.id}
                                className="glass-card glass-card-hover rounded-2xl p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <ProfileAvatar
                                            userId={request.sender_id}
                                            firstName={request.sender_first_name}
                                            lastName={request.sender_last_name}
                                            profilePicture={request.sender_profile_picture}
                                            size="lg"
                                        />
                                        <div>
                                            <h3 className="text-xl font-bold">
                                                {request.sender_first_name} {request.sender_last_name}
                                            </h3>
                                            {request.sender_course && (
                                                <p className="text-gray-400">{request.sender_course}</p>
                                            )}
                                            <p className="text-sm text-gray-500 mt-1">
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleRequest(request.id, 'accept')}
                                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center gap-2"
                                        >
                                            <Check className="w-5 h-5" />
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleRequest(request.id, 'reject')}
                                            className="px-6 py-3 bg-red-500/20 border border-red-500/40 rounded-xl hover:bg-red-500/30 transition-all text-red-400 flex items-center gap-2"
                                        >
                                            <X className="w-5 h-5" />
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default FriendRequestsPage;
