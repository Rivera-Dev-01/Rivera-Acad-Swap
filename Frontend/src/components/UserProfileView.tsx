import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, Mail, Phone, MapPin, BookOpen, Calendar, Award, UserPlus, ArrowLeft, Check, Clock, UserX } from 'lucide-react';
import NavigationMenu from './NavigationMenu';
import Toast from './Toast';

const API_URL = 'http://localhost:5000/api';

const UserProfileView = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profileUser, setProfileUser] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [scrollY, setScrollY] = useState(0);
    const [friendshipStatus, setFriendshipStatus] = useState<string>('none');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }
        try {
            setCurrentUser(JSON.parse(userData));
        } catch (error) {
            navigate('/login');
        }

        fetchUserProfile();
        if (userId) {
            fetchFriendshipStatus();
        }

        // Scroll effect
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [userId]);

    const fetchUserProfile = async () => {
        const token = localStorage.getItem('access_token');
        if (!token || !userId) return;

        try {
            const response = await fetch(`${API_URL}/user/profile/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setProfileUser(data.user);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFriendshipStatus = async () => {
        const token = localStorage.getItem('access_token');
        if (!token || !userId) return;

        try {
            const response = await fetch(`${API_URL}/friends/status/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                setFriendshipStatus(data.status);
            }
        } catch (error) {
            console.error('Error fetching friendship status:', error);
        }
    };

    const handleAddFriend = async () => {
        const token = localStorage.getItem('access_token');
        if (!token || !userId) return;

        try {
            const response = await fetch(`${API_URL}/friends/request/send`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ receiver_id: userId })
            });

            const data = await response.json();
            if (data.success) {
                setToast({ message: 'Friend request sent!', type: 'success' });
                setFriendshipStatus('pending_sent');
            } else {
                setToast({ message: data.message || 'Failed to send friend request', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'Failed to send friend request', type: 'error' });
        }
    };

    const getReputationTier = (score: number) => {
        if (score >= 100) return { name: 'Mythic', color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-500/20' };
        if (score >= 75) return { name: 'Legend', color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-500/20' };
        if (score >= 51) return { name: 'Rare', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/20' };
        if (score >= 25) return { name: 'Uncommon', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-500/20' };
        return { name: 'Common', color: 'from-gray-500 to-slate-500', bgColor: 'bg-gray-500/20' };
    };

    if (loading || !profileUser || !currentUser) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const tier = getReputationTier(profileUser.reputation_score || 0);
    const isOwnProfile = currentUser.id === profileUser.id;

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950"></div>
            </div>

            <NavigationMenu
                user={currentUser}
                onLogout={() => {
                    localStorage.clear();
                    navigate('/');
                }}
            />

            <div className="relative pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>

                    {/* Profile Header */}
                    <div
                        className="mb-8 p-8 glass-card rounded-2xl transition-all duration-300"
                        style={{
                            background: `rgba(15, 23, 42, ${Math.min(0.6 + scrollY * 0.001, 0.9)})`,
                            backdropFilter: `blur(${Math.min(20 + scrollY * 0.05, 40)}px)`
                        }}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center space-x-6">
                                {/* Profile Picture */}
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 p-1">
                                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                                            {profileUser.profile_picture ? (
                                                <img src={profileUser.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera className="w-12 h-12 text-gray-500" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Name and Reputation */}
                                <div>
                                    <h1 className="text-3xl font-bold mb-2 flex items-center space-x-2">
                                        <span>{profileUser.first_name} {profileUser.last_name}</span>
                                        {profileUser.profile_completed && (
                                            <div
                                                className="relative group"
                                                title="Verified Profile"
                                            >
                                                {/* Star Badge */}
                                                <svg className="w-6 h-6 drop-shadow-lg flex-shrink-0" viewBox="0 0 24 24" fill="none">
                                                    <defs>
                                                        <linearGradient id="starGradientUserProfile" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
                                                            <stop offset="100%" stopColor="rgba(34, 211, 238, 0.8)" />
                                                        </linearGradient>
                                                    </defs>
                                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                                        fill="url(#starGradientUserProfile)"
                                                        stroke="white"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round" />
                                                    <polyline points="9 12 11 14 15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        )}
                                    </h1>
                                    <div className={`inline-flex items-center space-x-2 px-4 py-2 ${tier.bgColor} border border-${tier.color.split('-')[1]}-500/30 rounded-full`}>
                                        <Award className="w-5 h-5" />
                                        <span className={`font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                                            {tier.name}
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <span className="font-semibold">{profileUser.reputation_score || 0} pts</span>
                                    </div>
                                </div>
                            </div>

                            {/* Friend Action Button (only for other users) */}
                            {!isOwnProfile && (
                                <>
                                    {friendshipStatus === 'none' && (
                                        <button
                                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center space-x-2 font-semibold"
                                            onClick={handleAddFriend}
                                        >
                                            <UserPlus className="w-5 h-5" />
                                            <span>Add Friend</span>
                                        </button>
                                    )}
                                    {friendshipStatus === 'pending_sent' && (
                                        <button
                                            className="px-6 py-3 bg-slate-700 rounded-lg cursor-not-allowed flex items-center space-x-2 font-semibold"
                                            disabled
                                        >
                                            <Clock className="w-5 h-5" />
                                            <span>Request Sent</span>
                                        </button>
                                    )}
                                    {friendshipStatus === 'pending_received' && (
                                        <button
                                            className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg hover:shadow-lg hover:shadow-yellow-500/50 transition-all flex items-center space-x-2 font-semibold"
                                            onClick={() => navigate('/friend-requests')}
                                        >
                                            <Clock className="w-5 h-5" />
                                            <span>Respond to Request</span>
                                        </button>
                                    )}
                                    {friendshipStatus === 'active' && (
                                        <button
                                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center space-x-2 font-semibold cursor-default"
                                        >
                                            <Check className="w-5 h-5" />
                                            <span>Friends</span>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Profile Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Email */}
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-400 mb-1">School Email</p>
                                    <p className="font-medium">{profileUser.email}</p>
                                </div>
                            </div>

                            {/* Phone */}
                            {profileUser.phone_number && (
                                <div className="flex items-start space-x-3">
                                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-400 mb-1">Phone Number</p>
                                        <p className="font-medium">{profileUser.phone_number}</p>
                                    </div>
                                </div>
                            )}

                            {/* Course */}
                            {profileUser.course && (
                                <div className="flex items-start space-x-3">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <BookOpen className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-400 mb-1">Course</p>
                                        <p className="font-medium">{profileUser.course}</p>
                                    </div>
                                </div>
                            )}

                            {/* Year & Block */}
                            {(profileUser.current_year || profileUser.block_section) && (
                                <div className="flex items-start space-x-3">
                                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-5 h-5 text-yellow-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-400 mb-1">Year & Block</p>
                                        <p className="font-medium">
                                            {profileUser.current_year && profileUser.block_section
                                                ? `${profileUser.current_year} - ${profileUser.block_section}`
                                                : profileUser.current_year || profileUser.block_section}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Address */}
                            {profileUser.address && (
                                <div className="flex items-start space-x-3 md:col-span-2">
                                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-red-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-400 mb-1">Address</p>
                                        <p className="font-medium">{profileUser.address}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default UserProfileView;
