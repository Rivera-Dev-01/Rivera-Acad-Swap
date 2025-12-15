import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Gift, Users, Trophy, CheckCircle } from 'lucide-react';
import NavigationMenu from '../components/NavigationMenu';

interface ReferralStats {
    referral_code: string;
    total_referrals: number;
    reputation_score: number;
    referred_users: Array<{
        name: string;
        joined_at: string;
    }>;
}

interface LeaderboardEntry {
    rank: number;
    name: string;
    total_referrals: number;
    reputation_score: number;
}

const InviteFriendPage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

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
            return;
        }
        fetchReferralStats();
        fetchLeaderboard();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const referralUrl = stats?.referral_code
        ? `${window.location.origin}/register?ref=${stats.referral_code}`
        : '';

    const fetchReferralStats = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                console.error('No access token found');
                setLoading(false);
                return;
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/referral/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching referral stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                console.error('No access token found');
                return;
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/referral/leaderboard?limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setLeaderboard(data.leaderboard);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
            <NavigationMenu user={user} onLogout={handleLogout} />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        Invite <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Friends</span>
                    </h1>
                    <p className="text-gray-400">Share your referral link and earn rewards together!</p>
                </div>

                {/* Referral Card */}
                <div className="glass-card rounded-2xl p-6 sm:p-8 mb-8 border border-blue-500/30">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                            <Gift className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Your Referral Code</h2>
                            <p className="text-gray-300 text-sm">Share this code with your friends</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 rounded-xl p-6 mb-6">
                        <div className="text-center mb-4">
                            <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-wider">
                                {stats?.referral_code || 'Loading...'}
                            </div>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-400 mb-2">Your Referral Link:</p>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={referralUrl}
                                    readOnly
                                    className="flex-1 bg-slate-900/50 border border-blue-500/30 rounded-lg px-4 py-2 text-sm text-gray-300"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center space-x-2"
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <div className="text-3xl font-bold text-blue-400">+15</div>
                                <div className="text-sm text-gray-400">Reputation per referral</div>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                                <div className="text-3xl font-bold text-emerald-400">+10</div>
                                <div className="text-sm text-gray-400">For new users</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Your Stats */}
                    <div className="glass-card rounded-2xl p-6 border border-blue-500/20">
                        <div className="flex items-center space-x-3 mb-6">
                            <Users className="w-6 h-6 text-blue-400" />
                            <h3 className="text-xl font-bold">Your Referral Stats</h3>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                                <span className="text-gray-400">Total Referrals</span>
                                <span className="text-2xl font-bold text-blue-400">{stats?.total_referrals || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                                <span className="text-gray-400">Total Reputation</span>
                                <span className="text-2xl font-bold text-emerald-400">{stats?.reputation_score || 0}</span>
                            </div>
                        </div>

                        {stats?.referred_users && stats.referred_users.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-3">Recent Referrals</h4>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {stats.referred_users.map((user, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-sm font-bold">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span className="text-sm">{user.name}</span>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {new Date(user.joined_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Leaderboard */}
                    <div className="glass-card rounded-2xl p-6 border border-blue-500/20">
                        <div className="flex items-center space-x-3 mb-6">
                            <Trophy className="w-6 h-6 text-yellow-400" />
                            <h3 className="text-xl font-bold">Top Referrers</h3>
                        </div>

                        <div className="space-y-2">
                            {leaderboard.length > 0 ? (
                                leaderboard.map((entry) => (
                                    <div
                                        key={entry.rank}
                                        className={`flex items-center justify-between p-4 rounded-lg ${entry.rank === 1
                                            ? 'bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 border border-yellow-500/30'
                                            : entry.rank === 2
                                                ? 'bg-gradient-to-r from-gray-400/20 to-gray-300/20 border border-gray-400/30'
                                                : entry.rank === 3
                                                    ? 'bg-gradient-to-r from-orange-600/20 to-orange-500/20 border border-orange-500/30'
                                                    : 'bg-slate-800/30'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${entry.rank === 1
                                                    ? 'bg-yellow-500 text-yellow-950'
                                                    : entry.rank === 2
                                                        ? 'bg-gray-400 text-gray-950'
                                                        : entry.rank === 3
                                                            ? 'bg-orange-500 text-orange-950'
                                                            : 'bg-slate-700 text-gray-300'
                                                    }`}
                                            >
                                                {entry.rank}
                                            </div>
                                            <div>
                                                <div className="font-semibold">{entry.name}</div>
                                                <div className="text-xs text-gray-400">
                                                    {entry.total_referrals} referrals • {entry.reputation_score} rep
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    No referrals yet. Be the first!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* How it Works */}
                <div className="mt-6 glass-card rounded-2xl p-6 border border-blue-500/20">
                    <h3 className="text-xl font-bold mb-4">How It Works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl font-bold text-blue-400">1</span>
                            </div>
                            <h4 className="font-semibold mb-2">Share Your Link</h4>
                            <p className="text-sm text-gray-400">Copy your unique referral link and share it with friends</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl font-bold text-emerald-400">2</span>
                            </div>
                            <h4 className="font-semibold mb-2">Friend Registers</h4>
                            <p className="text-sm text-gray-400">They sign up using your referral link</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl font-bold text-purple-400">3</span>
                            </div>
                            <h4 className="font-semibold mb-2">Earn Rewards</h4>
                            <p className="text-sm text-gray-400">You get +15 reputation, they get +10 reputation</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InviteFriendPage;
