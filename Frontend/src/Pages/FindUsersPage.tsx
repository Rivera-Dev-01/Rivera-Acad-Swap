import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users as UsersIcon, Grid, List, Filter } from 'lucide-react';
import NavigationMenu from '../components/NavigationMenu';
import ProfileAvatar from '../components/ProfileAvatar';
import { API_BASE as API_URL } from '../config/constants';

interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    course?: string;
    current_year?: string;
    profile_picture?: string;
    profile_completed: boolean;
    reputation_score: number;
}

const FindUsersPage = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        fetchCurrentUser();
        searchUsers();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            searchUsers();
        }, 300);
        return () => clearTimeout(delaySearch);
    }, [searchQuery, courseFilter, yearFilter]);

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
                setCurrentUser(data.user);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const searchUsers = async () => {
        setLoading(true);
        const token = localStorage.getItem('access_token');

        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('q', searchQuery);
            if (courseFilter) params.append('course', courseFilter);
            if (yearFilter) params.append('year', yearFilter);

            const response = await fetch(`${API_URL}/user/search?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
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

            <NavigationMenu user={currentUser} onLogout={handleLogout} />

            <div className="relative pt-20 pb-12 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-2xl p-6 mb-6 transition-all duration-300"
                        <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                <UsersIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Find Users</h1>
                                <p className="text-gray-400">Connect with other students</p>
                            </div>
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded transition-all ${viewMode === 'grid'
                                    ? 'bg-blue-500/30 text-blue-400'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded transition-all ${viewMode === 'list'
                                    ? 'bg-blue-500/30 text-blue-400'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-900/50 backdrop-blur-xl border-2 border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-500"
                        />
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        <span className="text-sm">{showFilters ? 'Hide' : 'Show'} Filters</span>
                    </button>

                    {/* Filters */}
                    {showFilters && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-slideDown">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Course</label>
                                <select
                                    value={courseFilter}
                                    onChange={(e) => setCourseFilter(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-900/50 backdrop-blur-xl border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white"
                                >
                                    <option value="">All Courses</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Information Technology">Information Technology</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="Business">Business</option>
                                    <option value="Arts">Arts</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Year Level</label>
                                <select
                                    value={yearFilter}
                                    onChange={(e) => setYearFilter(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-900/50 backdrop-blur-xl border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white"
                                >
                                    <option value="">All Years</option>
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-gray-400">
                        {loading ? 'Searching...' : (
                            <>
                                <span className="text-white font-semibold">{users.length}</span> user{users.length !== 1 ? 's' : ''} found
                            </>
                        )}
                    </p>
                </div>

                {/* User Results */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-400">Searching users...</p>
                        </div>
                    </div>
                ) : users.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => navigate(`/user/${user.id}`)}
                                    className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-blue-500 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20"
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <ProfileAvatar
                                            userId={user.id}
                                            firstName={user.first_name}
                                            lastName={user.last_name}
                                            profilePicture={user.profile_picture}
                                            size="lg"
                                        />
                                        <div className="mt-4">
                                            <div className="font-semibold text-lg flex items-center justify-center gap-2">
                                                <span>{user.first_name} {user.last_name}</span>
                                                {user.profile_completed && (
                                                    <svg className="w-5 h-5 drop-shadow-lg flex-shrink-0" viewBox="0 0 24 24" fill="none">
                                                        <defs>
                                                            <linearGradient id="starGradientGrid" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
                                                                <stop offset="100%" stopColor="rgba(34, 211, 238, 0.8)" />
                                                            </linearGradient>
                                                        </defs>
                                                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                                            fill="url(#starGradientGrid)"
                                                            stroke="white"
                                                            strokeWidth="1.5"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round" />
                                                        <polyline points="9 12 11 14 15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                            {user.course && (
                                                <p className="text-sm text-gray-400 mt-1">{user.course}</p>
                                            )}
                                            {user.current_year && (
                                                <p className="text-xs text-gray-500">{user.current_year}</p>
                                            )}
                                            <div className="mt-3 inline-flex items-center space-x-1 px-3 py-1 bg-blue-500/20 rounded-full">
                                                <span className="text-sm text-blue-400">{user.reputation_score} pts</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => navigate(`/user/${user.id}`)}
                                    className={`glass-card glass-card-hover rounded-xl p-4 cursor-pointer transition-all ${scrolled ? 'bg-opacity-90 backdrop-blur-[40px]' : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <ProfileAvatar
                                                userId={user.id}
                                                firstName={user.first_name}
                                                lastName={user.last_name}
                                                profilePicture={user.profile_picture}
                                                size="md"
                                            />
                                            <div>
                                                <div className="font-semibold flex items-center gap-2">
                                                    <span>{user.first_name} {user.last_name}</span>
                                                    {user.profile_completed && (
                                                        <svg className="w-4 h-4 drop-shadow-lg flex-shrink-0" viewBox="0 0 24 24" fill="none">
                                                            <defs>
                                                                <linearGradient id="starGradientList" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                    <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
                                                                    <stop offset="100%" stopColor="rgba(34, 211, 238, 0.8)" />
                                                                </linearGradient>
                                                            </defs>
                                                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                                                fill="url(#starGradientList)"
                                                                stroke="white"
                                                                strokeWidth="1.5"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round" />
                                                            <polyline points="9 12 11 14 15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-400">
                                                    {user.course && user.current_year
                                                        ? `${user.course} - ${user.current_year}`
                                                        : user.email
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {user.reputation_score} pts
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-2xl p-12 text-center">
                        <UsersIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400 text-lg">No users found</p>
                        <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
        </div >
    );
};

export default FindUsersPage;
