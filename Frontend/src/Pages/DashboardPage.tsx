import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// 1. Import React Query Hook
import { useQuery } from '@tanstack/react-query';
import { Package, TrendingUp, Users, Star, Activity, Plus, Store, MessageSquare, Calendar, List, CheckCircle } from 'lucide-react';
import NavigationMenu from '../components/NavigationMenu';

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

// Custom hook for smooth counting animation with fluid easing
const useCountUp = (end: number, duration: number = 1000, shouldAnimate: boolean = true) => {
    const [count, setCount] = useState(0);
    const startTimeRef = useRef<number | null>(null);
    const animationFrameRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (!shouldAnimate) {
            setCount(end);
            return;
        }

        // Reset for new animation
        setCount(0);
        startTimeRef.current = null;

        const animate = (currentTime: number) => {
            if (!startTimeRef.current) startTimeRef.current = currentTime;
            const elapsed = currentTime - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);

            // Ultra-smooth easing function (easeOutExpo)
            // Creates a very fluid, natural deceleration
            const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            // For small numbers, use linear interpolation for smoother increments
            const currentValue = end <= 10
                ? progress * end
                : easeOutExpo * end;

            setCount(Math.round(currentValue));

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                setCount(end); // Ensure we end at exact value
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [end, duration, shouldAnimate]);

    return count;
};

// 2. Define Types
interface DashboardStats {
    success: boolean;
    user?: any;
    stats: {
        active_listings: number;
        total_sales: number;
        total_earnings: number;
        engagement_rate: number;
    };
}

// 3. Define the Fetcher Function (Outside the component)
const fetchDashboardStats = async (): Promise<DashboardStats> => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error("No access token");

    const response = await fetch('http://localhost:5000/api/user/dashboard', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
};

const DashboardPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [scrollY, setScrollY] = useState(0);
    const [profileCompletion, setProfileCompletion] = useState(0);

    // 4. Handle User Auth (Check LocalStorage immediately)
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }
        try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
        } catch (error) {
            navigate('/login');
        }

        // Restore scroll position on page load
        const savedScrollY = sessionStorage.getItem('dashboardScrollY');
        if (savedScrollY) {
            window.scrollTo(0, parseInt(savedScrollY));
            setScrollY(parseInt(savedScrollY));
        }

        // Scroll effect
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrollY(currentScrollY);
            // Save scroll position
            sessionStorage.setItem('dashboardScrollY', currentScrollY.toString());
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [navigate]);

    // Fetch profile completion percentage
    useEffect(() => {
        const fetchProfileCompletion = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            try {
                const response = await fetch('http://localhost:5000/api/user/profile/completion', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success && data.tasks) {
                    const tasks = data.tasks;
                    const completedCount = Object.values(tasks).filter(Boolean).length;
                    const totalTasks = Object.keys(tasks).length;
                    const percentage = Math.round((completedCount / totalTasks) * 100);
                    setProfileCompletion(percentage);
                }
            } catch (error) {
                console.error('Error fetching profile completion:', error);
            }
        };

        if (user) {
            fetchProfileCompletion();
        }
    }, [user]);

    // 5. Implement TanStack Query (Replaces manual fetch & loading state)
    const {
        data: apiData,
        isLoading: isQueryLoading,
        error: queryError,
        isError
    } = useQuery({
        queryKey: ['dashboardStats', user?.id], // Include user ID to prevent cache collision
        queryFn: fetchDashboardStats,
        staleTime: 0,     // Always refetch on mount to ensure fresh data
        gcTime: 0,        // Don't cache data to prevent showing wrong user's data (renamed from cacheTime in v5)
        retry: 1,
        enabled: !!user // Only run query when user is loaded
    });

    // Log for debugging
    if (isError) {
        console.error('Dashboard query error:', queryError);
    }
    if (apiData) {
        console.log('Dashboard data received:', apiData);
    }

    // 6. Merge API Data with Default Data
    // We calculate this on every render. If apiData is loaded, it overrides defaults.
    const stats = {
        // These exist in your Python Backend, so we read them dynamically
        currentlySelling: apiData?.stats?.active_listings ?? 0,
        soldItems: apiData?.stats?.total_sales ?? 0,
        totalEarnings: apiData?.stats?.total_earnings ?? 0,
        engagementRate: apiData?.stats?.engagement_rate ?? 0,

        // Reputation score from user data
        reputationScore: apiData?.user?.reputation_score ?? 0,

        // This does NOT exist in your Backend yet.
        friendsCount: 0
    };

    // Animated counts for smooth number transitions with fluid easing
    // Longer durations = smoother, more fluid animations
    const animatedCurrentlySelling = useCountUp(stats.currentlySelling, 2000, !!apiData);
    const animatedSoldItems = useCountUp(stats.soldItems, 2200, !!apiData);
    const animatedTotalEarnings = useCountUp(stats.totalEarnings, 2400, !!apiData);
    const animatedReputationScore = useCountUp(stats.reputationScore, 2600, !!apiData);
    const animatedEngagementRate = useCountUp(stats.engagementRate, 2800, !!apiData);



    // 7. Handle Logout
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const getReputationStyle = (score: number) => {
        if (score >= 100) {
            return {
                label: 'MYTHIC',
                textClass: 'text-yellow-400 font-bold animate-pulse',
                borderClass: 'border-yellow-400',
                glowClass: 'shadow-lg shadow-yellow-400/50',
                bgClass: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20'
            };
        } else if (score >= 75) {
            return {
                label: 'LEGEND',
                textClass: 'text-purple-400 font-bold animate-pulse',
                borderClass: 'border-purple-400',
                glowClass: 'shadow-lg shadow-purple-400/50',
                bgClass: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20'
            };
        } else if (score >= 51) {
            return {
                label: 'RARE',
                textClass: 'text-cyan-400 font-bold',
                borderClass: 'border-cyan-400',
                glowClass: 'shadow-lg shadow-cyan-400/30',
                bgClass: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20'
            };
        } else if (score >= 25) {
            return {
                label: 'UNCOMMON',
                textClass: 'text-green-400 font-semibold',
                borderClass: 'border-green-400',
                glowClass: '',
                bgClass: 'bg-green-500/10'
            };
        } else {
            return {
                label: 'COMMON',
                textClass: 'text-gray-400',
                borderClass: 'border-gray-400',
                glowClass: '',
                bgClass: 'bg-gray-500/10'
            };
        }
    };

    const repStyle = getReputationStyle(stats.reputationScore);

    // 8. Loading Logic
    // Show loading spinner ONLY if User isn't loaded OR (Query is loading AND we have no cache)
    if (!user || (isQueryLoading && !apiData)) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Show error if query failed
    if (isError) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="text-center max-w-md p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 mb-2">Failed to load dashboard data</p>
                    <p className="text-sm text-gray-400">{queryError?.message || 'Unknown error'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
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
            <NavigationMenu user={user} onLogout={handleLogout} />

            {/* Main Content */}
            <div className="relative pt-24 pb-12 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2">
                            Welcome back, <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">{user.first_name}!</span>
                        </h1>
                        <p className="text-gray-400">Here's what's happening with your marketplace</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {/* Currently Selling */}
                        <div
                            className="p-6 glass-card glass-card-hover rounded-2xl transition-all"
                            style={{
                                background: `rgba(15, 23, 42, ${Math.min(0.6 + scrollY * 0.001, 0.9)})`,
                                backdropFilter: `blur(${Math.min(20 + scrollY * 0.05, 40)}px)`
                            }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                                    <Package className="w-6 h-6" />
                                </div>
                                <span className="text-2xl font-bold">{animatedCurrentlySelling}</span>
                            </div>
                            <h3 className="text-gray-400 text-sm">Currently Selling</h3>
                        </div>

                        {/* Sold Items */}
                        <div
                            className="p-6 glass-card glass-card-hover rounded-2xl transition-all"
                            style={{
                                background: `rgba(15, 23, 42, ${Math.min(0.6 + scrollY * 0.001, 0.9)})`,
                                backdropFilter: `blur(${Math.min(20 + scrollY * 0.05, 40)}px)`
                            }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <span className="text-2xl font-bold">{animatedSoldItems}</span>
                            </div>
                            <h3 className="text-gray-400 text-sm">Sold Items</h3>
                        </div>

                        {/* Total Earnings */}
                        <div
                            className="p-6 glass-card glass-card-hover rounded-2xl transition-all"
                            style={{
                                background: `rgba(15, 23, 42, ${Math.min(0.6 + scrollY * 0.001, 0.9)})`,
                                backdropFilter: `blur(${Math.min(20 + scrollY * 0.05, 40)}px)`
                            }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center">
                                    <PesoIcon className="w-6 h-6" />
                                </div>
                                <span className="text-2xl font-bold">₱{animatedTotalEarnings.toLocaleString()}</span>
                            </div>
                            <h3 className="text-gray-400 text-sm">Total Earnings</h3>
                        </div>

                        {/* Reputation Score */}
                        <div className={`p-6 backdrop-blur-xl border ${repStyle.borderClass} rounded-2xl ${repStyle.glowClass} ${repStyle.bgClass} transition-all`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-700 rounded-xl flex items-center justify-center ${repStyle.glowClass}`}>
                                    <Star className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <span className={`text-3xl font-bold ${repStyle.textClass}`}>{animatedReputationScore}</span>
                                    <p className={`text-xs ${repStyle.textClass} mt-1`}>{repStyle.label}</p>
                                </div>
                            </div>
                            <h3 className="text-gray-400 text-sm">Reputation Score</h3>
                        </div>

                        {/* Engagement Rate */}
                        <div
                            className="p-6 glass-card glass-card-hover rounded-2xl transition-all"
                            style={{
                                background: `rgba(15, 23, 42, ${Math.min(0.6 + scrollY * 0.001, 0.9)})`,
                                backdropFilter: `blur(${Math.min(20 + scrollY * 0.05, 40)}px)`
                            }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <span className="text-2xl font-bold">{animatedEngagementRate}%</span>
                            </div>
                            <h3 className="text-gray-400 text-sm">Engagement Rate</h3>
                        </div>

                        {/* Friends */}
                        <div
                            className="p-6 glass-card glass-card-hover rounded-2xl transition-all"
                            style={{
                                background: `rgba(15, 23, 42, ${Math.min(0.6 + scrollY * 0.001, 0.9)})`,
                                backdropFilter: `blur(${Math.min(20 + scrollY * 0.05, 40)}px)`
                            }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6" />
                                </div>
                                <span className="text-2xl font-bold">{stats.friendsCount}</span>
                            </div>
                            <h3 className="text-gray-400 text-sm">Friends</h3>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div
                            className="p-6 glass-card rounded-2xl transition-all duration-300"
                            style={{
                                background: `rgba(15, 23, 42, ${Math.min(0.6 + scrollY * 0.001, 0.9)})`,
                                backdropFilter: `blur(${Math.min(20 + scrollY * 0.05, 40)}px)`
                            }}
                        >
                            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                {/* Primary Action */}
                                <Link to="/list-item" className="block w-full">
                                    <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center space-x-3 group">
                                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                        <span className="font-semibold">List New Item</span>
                                    </button>
                                </Link>

                                {/* Marketplace Actions */}
                                <Link to="/marketplace" className="block w-full">
                                    <button className="w-full px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all flex items-center space-x-3 group">
                                        <Store className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                                        <span>Browse Marketplace</span>
                                    </button>
                                </Link>

                                <Link to="/my-listings" className="block w-full">
                                    <button className="w-full px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all flex items-center space-x-3 group">
                                        <List className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                                        <span>View My Listings</span>
                                    </button>
                                </Link>

                                {/* Messages */}
                                <Link to="/messages" className="block w-full">
                                    <button className="w-full px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all flex items-center space-x-3 group">
                                        <MessageSquare className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                                        <span>Messages</span>
                                    </button>
                                </Link>

                                {/* Scheduling */}
                                <Link to="/meetup-scheduler" className="block w-full">
                                    <button className="w-full px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all flex items-center space-x-3 group">
                                        <Calendar className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
                                        <span>Meetup Scheduler</span>
                                    </button>
                                </Link>
                            </div>
                        </div>

                        <div
                            className="p-6 glass-card rounded-2xl transition-all duration-300"
                            style={{
                                background: `rgba(15, 23, 42, ${Math.min(0.6 + scrollY * 0.001, 0.9)})`,
                                backdropFilter: `blur(${Math.min(20 + scrollY * 0.05, 40)}px)`
                            }}
                        >
                            <h3 className="text-xl font-bold mb-4">Profile Status</h3>

                            {/* Profile Completion */}
                            <Link to="/profile-completion" className="block mb-4">
                                <div className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all cursor-pointer">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                            <span className="font-semibold">Profile Completion</span>
                                        </div>
                                        <span className="text-lg font-bold text-green-400">{profileCompletion}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                                            style={{ width: `${profileCompletion}%` }}
                                        ></div>
                                    </div>
                                    {profileCompletion < 100 && (
                                        <p className="text-xs text-gray-400 mt-2">Complete your profile to unlock all features</p>
                                    )}
                                </div>
                            </Link>

                            <h3 className="text-lg font-bold mb-3">Quick Links</h3>
                            <div className="space-y-2">
                                <Link to="/marketplace" className="block p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all">
                                    <p className="text-sm text-gray-300 font-medium">Browse Marketplace</p>
                                    <p className="text-xs text-gray-500 mt-1">Find items from other students</p>
                                </Link>
                                <Link to="/request-board" className="block p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all">
                                    <p className="text-sm text-gray-300 font-medium">Request Board</p>
                                    <p className="text-xs text-gray-500 mt-1">Post what you're looking for</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default DashboardPage;