import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, Camera, MapPin, Phone, Mail, User, ShoppingBag } from 'lucide-react';
import NavigationMenu from '../components/NavigationMenu';

interface ProfileTask {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    points: number;
    icon: any;
}

const ProfileCompletionPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    // Mock profile tasks - replace with real data from backend
    const [tasks] = useState<ProfileTask[]>([
        {
            id: 'basic_info',
            title: 'Complete Basic Information',
            description: 'Name, email, and phone number',
            completed: true,
            points: 10,
            icon: User
        },
        {
            id: 'profile_photo',
            title: 'Upload Profile Photo',
            description: 'Add a profile picture',
            completed: false,
            points: 15,
            icon: Camera
        },
        {
            id: 'location',
            title: 'Add Location',
            description: 'Set your campus location',
            completed: true,
            points: 10,
            icon: MapPin
        },
        {
            id: 'phone_verify',
            title: 'Verify Phone Number',
            description: 'Confirm your phone number',
            completed: false,
            points: 20,
            icon: Phone
        },
        {
            id: 'email_verify',
            title: 'Verify Email Address',
            description: 'Confirm your university email',
            completed: true,
            points: 20,
            icon: Mail
        },
        {
            id: 'first_listing',
            title: 'Create First Listing',
            description: 'List your first item for sale',
            completed: false,
            points: 25,
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
            setUser(JSON.parse(userData));
        } catch (error) {
            navigate('/login');
        }
    }, [navigate]);

    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const completionPercentage = Math.round((completedTasks / totalTasks) * 100);
    const earnedPoints = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);
    const totalPoints = tasks.reduce((sum, t) => sum + t.points, 0);

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
                            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Profile Completion</span>
                        </h1>
                        <p className="text-gray-400">Complete your profile to unlock all features</p>
                    </div>

                    {/* Progress Card */}
                    <div className="mb-8 p-8 bg-gradient-to-r from-blue-600/20 to-emerald-600/20 border border-blue-500/30 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-3xl font-bold mb-1">{completionPercentage}% Complete</h2>
                                <p className="text-gray-300">{completedTasks} of {totalTasks} tasks completed</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold text-yellow-400">{earnedPoints}</p>
                                <p className="text-sm text-gray-300">of {totalPoints} points</p>
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
                    <div className="mb-8 p-6 bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-2xl">
                        <h3 className="text-xl font-bold mb-4">Why Complete Your Profile?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start space-x-3">
                                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold mb-1">Build Trust</h4>
                                    <p className="text-sm text-gray-400">Verified profiles get more responses</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold mb-1">Earn Points</h4>
                                    <p className="text-sm text-gray-400">Redeem for premium features</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold mb-1">Better Matches</h4>
                                    <p className="text-sm text-gray-400">Connect with nearby students</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold mb-1">Unlock Features</h4>
                                    <p className="text-sm text-gray-400">Access advanced marketplace tools</p>
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
                                    className={`p-6 bg-slate-900/50 backdrop-blur-xl border rounded-2xl transition-all ${task.completed
                                        ? 'border-emerald-500/30 bg-emerald-500/5'
                                        : 'border-blue-500/20 hover:border-blue-500/50'
                                        }`}
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
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-sm text-yellow-400 font-semibold">
                                                        +{task.points} points
                                                    </span>
                                                    {task.completed && (
                                                        <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-full">
                                                            Completed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {!task.completed && (
                                            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all text-sm font-medium">
                                                Complete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Completion Reward */}
                    {completionPercentage === 100 && (
                        <div className="mt-8 p-8 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-2xl text-center">
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-3xl font-bold mb-2">Profile Complete!</h2>
                            <p className="text-gray-300 mb-4">
                                Congratulations! You've earned {totalPoints} points and unlocked all features.
                            </p>
                            <button className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg hover:shadow-lg hover:shadow-yellow-500/50 transition-all font-bold">
                                Claim Bonus Reward
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileCompletionPage;
