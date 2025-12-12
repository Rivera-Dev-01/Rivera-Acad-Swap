import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, Gift, Users, TrendingUp, Share2 } from 'lucide-react';
import NavigationMenu from '../components/NavigationMenu';

interface Referral {
    id: number;
    name: string;
    joinedDate: string;
    pointsEarned: number;
    status: 'active' | 'pending';
}

const InviteFriendPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [referralLink, setReferralLink] = useState('');

    // Mock referrals - replace with real data from backend
    const [referrals] = useState<Referral[]>([
        {
            id: 1,
            name: 'Alice Johnson',
            joinedDate: '2024-12-01',
            pointsEarned: 50,
            status: 'active'
        },
        {
            id: 2,
            name: 'Bob Smith',
            joinedDate: '2024-12-05',
            pointsEarned: 50,
            status: 'active'
        },
        {
            id: 3,
            name: 'Charlie Brown',
            joinedDate: '2024-12-08',
            pointsEarned: 0,
            status: 'pending'
        }
    ]);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }
        try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);

            // Generate unique referral link based on user ID
            const baseUrl = window.location.origin;
            const referralCode = btoa(parsedUser.id).substring(0, 8).toUpperCase();
            setReferralLink(`${baseUrl}/register?ref=${referralCode}`);
        } catch (error) {
            navigate('/login');
        }
    }, [navigate]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join Acad Swap!',
                    text: 'Join me on Acad Swap - the best campus marketplace for students!',
                    url: referralLink
                });
            } catch (error) {
                console.log('Share cancelled');
            }
        } else {
            handleCopyLink();
        }
    };

    const totalPoints = referrals.reduce((sum, ref) => sum + ref.pointsEarned, 0);
    const activeReferrals = referrals.filter(r => r.status === 'active').length;

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
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold mb-2">
                            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Invite Friends</span>
                        </h1>
                        <p className="text-gray-400">Share Acad Swap and earn rewards!</p>
                    </div>

                    {/* Reward Banner */}
                    <div className="mb-8 p-8 bg-gradient-to-r from-blue-600/20 to-emerald-600/20 border border-blue-500/30 rounded-2xl text-center">
                        <Gift className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-2">Earn 50 Points Per Friend!</h2>
                        <p className="text-gray-300 mb-4">
                            Invite your friends to join Acad Swap and get 50 points when they sign up using your link.
                        </p>
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                            <span>💰 Points can be redeemed for premium features</span>
                            <span>•</span>
                            <span>🎁 Special rewards at milestones</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="p-6 bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <Users className="w-8 h-8 text-blue-400" />
                                <div>
                                    <p className="text-3xl font-bold">{activeReferrals}</p>
                                    <p className="text-sm text-gray-400">Friends Joined</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-900/50 backdrop-blur-xl border border-emerald-500/20 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <TrendingUp className="w-8 h-8 text-emerald-400" />
                                <div>
                                    <p className="text-3xl font-bold">{totalPoints}</p>
                                    <p className="text-sm text-gray-400">Points Earned</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-900/50 backdrop-blur-xl border border-yellow-500/20 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <Gift className="w-8 h-8 text-yellow-400" />
                                <div>
                                    <p className="text-3xl font-bold">{referrals.filter(r => r.status === 'pending').length}</p>
                                    <p className="text-sm text-gray-400">Pending</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Referral Link */}
                    <div className="mb-8 p-6 bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-2xl">
                        <h3 className="text-xl font-bold mb-4">Your Referral Link</h3>
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 px-4 py-3 bg-slate-800/50 border border-blue-500/20 rounded-lg text-gray-300 break-all">
                                {referralLink}
                            </div>
                            <button
                                onClick={handleCopyLink}
                                className={`px-6 py-3 rounded-lg transition-all flex items-center justify-center space-x-2 ${copied
                                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                                    : 'bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30'
                                    }`}
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-5 h-5" />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-5 h-5" />
                                        <span>Copy</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleShare}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center space-x-2"
                            >
                                <Share2 className="w-5 h-5" />
                                <span>Share</span>
                            </button>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="mb-8 p-6 bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-2xl">
                        <h3 className="text-xl font-bold mb-4">How It Works</h3>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-4">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                                    1
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Share Your Link</h4>
                                    <p className="text-sm text-gray-400">Copy your unique referral link and share it with friends</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                                    2
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Friend Signs Up</h4>
                                    <p className="text-sm text-gray-400">Your friend registers using your referral link</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                                    3
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Earn Rewards</h4>
                                    <p className="text-sm text-gray-400">Get 50 points instantly when they complete registration!</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Referral History */}
                    <div className="p-6 bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-2xl">
                        <h3 className="text-xl font-bold mb-4">Your Referrals</h3>
                        {referrals.length > 0 ? (
                            <div className="space-y-3">
                                {referrals.map((referral) => (
                                    <div
                                        key={referral.id}
                                        className="p-4 bg-slate-800/50 rounded-lg flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="font-semibold">{referral.name}</p>
                                            <p className="text-sm text-gray-400">
                                                Joined {new Date(referral.joinedDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {referral.status === 'active' ? (
                                                <>
                                                    <p className="text-emerald-400 font-bold">+{referral.pointsEarned} pts</p>
                                                    <p className="text-xs text-gray-400">Earned</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-yellow-400 font-bold">Pending</p>
                                                    <p className="text-xs text-gray-400">Completing signup</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No referrals yet. Start inviting friends!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InviteFriendPage;
