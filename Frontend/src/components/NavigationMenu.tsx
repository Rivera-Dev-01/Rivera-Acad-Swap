import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    ShoppingBag,
    Bell,
    LogOut,
    Menu,
    X,
    Plus,
    Store,
    List,
    Mail,
    MessageCircle,
    MessageSquare,
    Calendar,
    UserPlus,
    CheckCircle,
    LayoutDashboard,
    User,
    Search,
    Users
} from 'lucide-react';
import UserSearchModal from './UserSearchModal';
import { useRealtimeNotifications } from '../hooks/useRealtimeData';

interface NavigationMenuProps {
    user: any;
    onLogout: () => void;
}

interface Notification {
    id: string;
    type: 'offer' | 'message' | 'meetup' | 'friend_request' | 'board_post';
    title: string;
    message: string;
    time: string;
    read: boolean;
    link?: string;
}

const NavigationMenu = ({ user, onLogout }: NavigationMenuProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [profileCompletion, setProfileCompletion] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const location = useLocation();

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
            fetchNotifications();
        }
    }, [user]);

    // Real-time notifications - no more polling!
    useRealtimeNotifications(user?.id || '', (newNotification) => {
        console.log('New notification received:', newNotification);
        setNotifications(prev => [newNotification, ...prev]);
    });

    // Fetch notifications
    const fetchNotifications = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const response = await fetch('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-400' },
        { path: '/profile', icon: User, label: 'My Profile', color: 'text-indigo-400' },
        { path: '/find-users', icon: Users, label: 'Find Users', color: 'text-teal-400' },
        { path: '/friend-requests', icon: UserPlus, label: 'Friend Requests', color: 'text-purple-400' },
        { path: '/marketplace', icon: Store, label: 'Browse Marketplace', color: 'text-blue-400' },
        { path: '/my-listings', icon: List, label: 'My Listings', color: 'text-emerald-400' },
        { path: '/offers', icon: Mail, label: 'Offers', color: 'text-emerald-400' },
        { path: '/messages', icon: MessageCircle, label: 'Messages', color: 'text-purple-400' },
        { path: '/request-board', icon: MessageSquare, label: 'Request Board', color: 'text-cyan-400' },
        { path: '/meetup-scheduler', icon: Calendar, label: 'Meetup Scheduler', color: 'text-pink-400' },
        { path: '/invite-friend', icon: User, label: 'Invite a Friend', color: 'text-yellow-400', badge: '+15 pts' },
        { path: '/profile-completion', icon: CheckCircle, label: 'Profile Completion', color: 'text-green-400', badge: `${profileCompletion}%` }
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* Top Navigation Bar */}
            <nav className="fixed w-full z-50 glass-nav">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo and Hamburger */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                            >
                                {isMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </button>

                            <Link to="/dashboard" className="flex items-center space-x-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent hidden sm:block">
                                    Acad Swap
                                </span>
                            </Link>
                        </div>

                        {/* Right Side - User Info */}
                        <div className="flex items-center space-x-4">
                            {/* Search Button */}
                            <button
                                onClick={() => setShowSearch(true)}
                                className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                                title="Search Users"
                            >
                                <Search className="w-6 h-6" />
                            </button>

                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                            >
                                <Bell className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            <div className="hidden md:flex items-center space-x-3">
                                <Link to="/profile" className="flex items-center space-x-3 hover:bg-slate-800/50 rounded-lg p-2 transition-colors">
                                    {/* Profile Picture */}
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 p-0.5 flex-shrink-0">
                                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                                            {user.profile_picture ? (
                                                <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-bold">
                                                    {user.first_name[0]}{user.last_name[0]}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Name and Course */}
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                                        <p className="text-xs text-gray-400">{user.course}</p>
                                    </div>
                                </Link>
                                <button
                                    onClick={onLogout}
                                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Slide-out Menu */}
            <div
                className={`fixed inset-0 z-40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsMenuOpen(false)}
                ></div>

                {/* Menu Panel */}
                <div
                    className={`absolute top-16 left-0 h-[calc(100vh-4rem)] w-80 glass-card border-r shadow-2xl transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <div className="p-6 h-full flex flex-col">
                        {/* User Info (Mobile) */}
                        <div className="md:hidden mb-6 pb-6 border-b border-slate-800">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                                    <span className="text-lg font-bold">
                                        {user.first_name[0]}{user.last_name[0]}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold">{user.first_name} {user.last_name}</p>
                                    <p className="text-sm text-gray-400">{user.course}</p>
                                </div>
                            </div>
                        </div>

                        {/* Primary Action */}
                        <Link to="/list-item" className="w-full mb-4" onClick={() => setIsMenuOpen(false)}>
                            <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center space-x-3 group">
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                <span className="font-semibold">List New Item</span>
                            </button>
                        </Link>

                        {/* Menu Items */}
                        <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-slate-800/50">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`w-full px-4 py-3 rounded-lg transition-all flex items-center justify-between group ${active
                                            ? 'bg-gradient-to-r from-blue-600/20 to-emerald-600/20 border border-blue-500/30'
                                            : 'hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
                                            <span className={active ? 'font-semibold' : ''}>{item.label}</span>
                                        </div>
                                        {item.badge && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${typeof item.badge === 'number'
                                                ? 'bg-red-500 text-white'
                                                : item.badge.includes('pts')
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-400'
                                                }`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Logout (Mobile) */}
                        <button
                            onClick={() => {
                                setIsMenuOpen(false);
                                onLogout();
                            }}
                            className="md:hidden mt-4 w-full px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all flex items-center justify-center space-x-2 text-red-400"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Modal */}
            {showSearch && <UserSearchModal onClose={() => setShowSearch(false)} />}

            {/* Notifications Dropdown */}
            {showNotifications && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowNotifications(false)}
                    ></div>
                    <div className="fixed top-20 right-4 w-96 max-h-[600px] glass-card rounded-2xl shadow-2xl z-50 animate-slide-down overflow-hidden">
                        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                            <h3 className="text-lg font-bold">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="text-sm text-blue-400">{unreadCount} new</span>
                            )}
                        </div>
                        <div className="max-h-[500px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <Link
                                        key={notif.id}
                                        to={notif.link || '#'}
                                        onClick={() => setShowNotifications(false)}
                                        className={`block p-4 border-b border-slate-800/50 hover:bg-slate-800/50 transition-all ${!notif.read ? 'bg-blue-500/10' : ''
                                            }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-blue-500' : 'bg-gray-600'
                                                }`}></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm">{notif.title}</p>
                                                <p className="text-sm text-gray-400 mt-1">{notif.message}</p>
                                                <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <div className="p-3 border-t border-slate-700 text-center">
                                <button className="text-sm text-blue-400 hover:text-blue-300">
                                    Mark all as read
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </>
    );
};

export default NavigationMenu;
