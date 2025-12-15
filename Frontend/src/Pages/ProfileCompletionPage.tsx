import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, Camera, MapPin, ShoppingBag } from 'lucide-react';
import NavigationMenu from '../components/NavigationMenu';
import Toast from '../components/Toast';
import { API_BASE as API_URL } from '../config/constants';

interface ProfileTask {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    icon: any;
}

const ProfileCompletionPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
    const [scrollY, setScrollY] = useState(0);
    const [tasks, setTasks] = useState<ProfileTask[]>([
        {
            id: 'profile_picture',
            title: 'Upload Profile Picture',
            description: 'Add a profile picture to your account',
            completed: false,
            icon: Camera
        },
        {
            id: 'address',
            title: 'Add Address',
            description: 'Set your address for meetups',
            completed: false,
            icon: MapPin
        },
        {
            id: 'first_listing',
            title: 'Create First Listing',
            description: 'List your first item for sale',
            completed: false,
            icon: ShoppingBag
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

            // Auto-check profile completion on mount to show correct status (no toast)
            checkProfileCompletion(false);
        } catch (error) {
            navigate('/login');
        }

        // Restore scroll position on page load
        const savedScrollY = sessionStorage.getItem('profileCompletionScrollY');
        if (savedScrollY) {
            window.scrollTo(0, parseInt(savedScrollY));
            setScrollY(parseInt(savedScrollY));
        }

        // Scroll effect
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrollY(currentScrollY);
            // Save scroll position
            sessionStorage.setItem('profileCompletionScrollY', currentScrollY.toString());
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [navigate]);

    const checkProfileCompletion = async (showToastMessage = false) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/user/profile/completion`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                const { tasks: taskStatus, profile_completed } = data;

                setTasks(prev => prev.map(task => ({
                    ...task,
                    completed: taskStatus[task.id] || false
                })));

                // Always update user in localStorage with current completion status
                const userData = localStorage.getItem('user');
                if (userData) {
                    const parsedUser = JSON.parse(userData);
                    parsedUser.profile_completed = profile_completed;
                    localStorage.setItem('user', JSON.stringify(parsedUser));
                    setUser(parsedUser);
                }

                // Only show toast if explicitly requested (when user clicks button)
                if (showToastMessage) {
                    if (profile_completed) {
                        setToastMessage('🎉 Congratulations! Your profile is complete! You can now list unlimited items.');
                        setToastType('success');
                        setShowToast(true);
                    } else {
                        setToastMessage('Keep going! Complete the remaining tasks to unlock unlimited listings.');
                        setToastType('info');
                        setShowToast(true);
                    }
                }
            }
        } catch (error) {
            console.error('Error checking profile completion:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        await checkProfileCompletion(true); // Show toast when user clicks button
    };

    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

    if (!user || loading) {
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
                            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Profile Completion</span>
                        </h1>
                        <p className="text-gray-400">Complete your profile to unlock all features</p>
                    </div>

                    {/* Progress Card */}
                    <div
                        className="mb-8 p-8 glass-card-gradient rounded-2xl transition-all duration-300"
                        style={{
                            backdropFilter: `blur(${Math.min(20 + scrollY * 0.05, 40)}px)`
                        }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-3xl font-bold mb-1">{completionPercentage}% Complete</h2>
                                <p className="text-gray-300">{completedTasks} of {totalTasks} tasks completed</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-4 bg-slate-800/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                                style={{ width: `${completionPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div
                        className="mb-8 p-6 glass-card rounded-2xl transition-all duration-300"
                        style={{
                            background: `rgba(15, 23, 42, ${Math.min(0.6 + scrollY * 0.001, 0.9)})`,
                            backdropFilter: `blur(${Math.min(20 + scrollY * 0.05, 40)}px)`
                        }}
                    >
                        <h3 className="text-xl font-bold mb-4">Why Complete Your Profile?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start space-x-3">
                                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold mb-1">List More Items</h4>
                                    <p className="text-sm text-gray-400">Unlock unlimited listings</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold mb-1">Build Trust</h4>
                                    <p className="text-sm text-gray-400">Complete profiles get more responses</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold mb-1">Better Meetups</h4>
                                    <p className="text-sm text-gray-400">Address helps with location planning</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold mb-1">Full Access</h4>
                                    <p className="text-sm text-gray-400">Use all marketplace features</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tasks List */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold mb-4">Complete These Tasks</h3>
                        {tasks.map((task) => {
                            const Icon = task.icon;
                            return (
                                <div
                                    key={task.id}
                                    className={`p-6 rounded-2xl transition-all ${task.completed
                                        ? 'glass-card-success'
                                        : 'glass-card hover:glass-card-hover'
                                        }`}
                                    style={{
                                        background: task.completed
                                            ? `rgba(16, 185, 129, ${Math.min(0.1 + scrollY * 0.0005, 0.3)})`
                                            : `rgba(15, 23, 42, ${Math.min(0.6 + scrollY * 0.001, 0.9)})`,
                                        backdropFilter: `blur(${Math.min(20 + scrollY * 0.05, 40)}px)`
                                    }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${task.completed
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h4 className="text-lg font-semibold">{task.title}</h4>
                                                    {task.completed ? (
                                                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                                                    ) : (
                                                        <Circle className="w-5 h-5 text-gray-600" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-400 mb-3">{task.description}</p>
                                                {task.completed && (
                                                    <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-full">
                                                        Completed
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {!task.completed && task.id === 'profile_picture' && (
                                            <button
                                                onClick={() => navigate('/profile')}
                                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all text-sm font-medium">
                                                Go to Profile
                                            </button>
                                        )}
                                        {!task.completed && task.id === 'address' && (
                                            <button
                                                onClick={() => navigate('/profile')}
                                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all text-sm font-medium">
                                                Go to Profile
                                            </button>
                                        )}
                                        {!task.completed && task.id === 'first_listing' && (
                                            <button
                                                onClick={() => navigate('/list-item')}
                                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all text-sm font-medium">
                                                List Item
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Complete Button */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={handleComplete}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all font-bold text-lg">
                            Check Completion Status
                        </button>
                        <p className="text-sm text-gray-400 mt-3">
                            Click to verify if you've completed all requirements
                        </p>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setShowToast(false)}
                />
            )}
        </div>
    );
};

export default ProfileCompletionPage;
