import { useState } from 'react';
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
    MessageSquare,
    Calendar,
    UserPlus,
    CheckCircle,
    LayoutDashboard
} from 'lucide-react';

interface NavigationMenuProps {
    user: any;
    onLogout: () => void;
}

const NavigationMenu = ({ user, onLogout }: NavigationMenuProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-400' },
        { path: '/marketplace', icon: Store, label: 'Browse Marketplace', color: 'text-blue-400' },
        { path: '/my-listings', icon: List, label: 'My Listings', color: 'text-emerald-400' },
        { path: '/offers-messages', icon: Mail, label: 'Offers & Messages', color: 'text-purple-400', badge: 3 },
        { path: '/request-board', icon: MessageSquare, label: 'Request Board', color: 'text-cyan-400' },
        { path: '/meetup-scheduler', icon: Calendar, label: 'Meetup Scheduler', color: 'text-pink-400' },
        { path: '/invite-friend', icon: UserPlus, label: 'Invite a Friend', color: 'text-yellow-400', badge: '+50 pts' },
        { path: '/profile-completion', icon: CheckCircle, label: 'Profile Completion', color: 'text-green-400', badge: '75%' }
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* Top Navigation Bar */}
            <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-lg border-b border-blue-500/20">
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
                            <button className="relative p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
                                <Bell className="w-6 h-6" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            </button>
                            <div className="hidden md:flex items-center space-x-3">
                                <div className="text-right">
                                    <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                                    <p className="text-xs text-gray-400">{user.course}</p>
                                </div>
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
                    className={`absolute top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-slate-900/95 backdrop-blur-xl border-r border-blue-500/20 shadow-2xl transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
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
                        <button className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center space-x-3 group">
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            <span className="font-semibold">List New Item</span>
                        </button>

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
        </>
    );
};

export default NavigationMenu;
