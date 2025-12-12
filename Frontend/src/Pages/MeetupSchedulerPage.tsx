import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Plus, User, AlertCircle } from 'lucide-react';
import NavigationMenu from '../components/NavigationMenu';

interface Meetup {
    id: number;
    title: string;
    buyer: string;
    seller: string;
    item: string;
    date: string;
    time: string;
    location: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    notes: string;
}

const MeetupSchedulerPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [showNewMeetupModal, setShowNewMeetupModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
    const [newMeetup, setNewMeetup] = useState({
        title: '',
        buyer: '',
        item: '',
        date: '',
        time: '',
        location: '',
        notes: ''
    });

    // Mock meetups - replace with real data from backend
    const [meetups, setMeetups] = useState<Meetup[]>([
        {
            id: 1,
            title: 'Calculus Textbook Exchange',
            buyer: 'John Doe',
            seller: 'Jane Smith',
            item: 'Calculus 2 Textbook',
            date: '2024-12-15',
            time: '14:00',
            location: 'Library - 2nd Floor',
            status: 'upcoming',
            notes: 'Bring exact change ₱800'
        },
        {
            id: 2,
            title: 'Laptop Sale',
            buyer: 'Mike Johnson',
            seller: 'Sarah Lee',
            item: 'Gaming Laptop',
            date: '2024-12-16',
            time: '10:30',
            location: 'Cafeteria',
            status: 'upcoming',
            notes: 'Will test the laptop before purchase'
        },
        {
            id: 3,
            title: 'Uniform Purchase',
            buyer: 'Alex Chen',
            seller: 'Emma Wilson',
            item: 'Women\'s Uniform Set',
            date: '2024-12-10',
            time: '15:00',
            location: 'Main Gate',
            status: 'completed',
            notes: 'Transaction completed successfully'
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

        // Check for upcoming meetups (simulate notification check)
        checkUpcomingMeetups();
    }, [navigate]);

    const checkUpcomingMeetups = () => {
        const now = new Date();
        const upcomingMeetups = meetups.filter(meetup => {
            if (meetup.status !== 'upcoming') return false;

            const meetupDateTime = new Date(`${meetup.date}T${meetup.time}`);
            const timeDiff = meetupDateTime.getTime() - now.getTime();
            const hoursDiff = timeDiff / (1000 * 60 * 60);

            // Notify if meetup is within 24 hours
            return hoursDiff > 0 && hoursDiff <= 24;
        });

        if (upcomingMeetups.length > 0) {
            console.log('You have upcoming meetups within 24 hours!', upcomingMeetups);
            // In production, this would trigger actual notifications
        }
    };

    const handleCreateMeetup = () => {
        if (!newMeetup.title.trim() || !newMeetup.buyer.trim() || !newMeetup.item.trim() ||
            !newMeetup.date || !newMeetup.time || !newMeetup.location.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        const meetup: Meetup = {
            id: meetups.length + 1,
            title: newMeetup.title,
            buyer: newMeetup.buyer,
            seller: `${user.first_name} ${user.last_name}`,
            item: newMeetup.item,
            date: newMeetup.date,
            time: newMeetup.time,
            location: newMeetup.location,
            status: 'upcoming',
            notes: newMeetup.notes
        };

        setMeetups([meetup, ...meetups]);
        setNewMeetup({ title: '', buyer: '', item: '', date: '', time: '', location: '', notes: '' });
        setShowNewMeetupModal(false);
    };

    const handleCompleteMeetup = (id: number) => {
        setMeetups(meetups.map(meetup =>
            meetup.id === id ? { ...meetup, status: 'completed' as const } : meetup
        ));
    };

    const handleCancelMeetup = (id: number) => {
        setMeetups(meetups.map(meetup =>
            meetup.id === id ? { ...meetup, status: 'cancelled' as const } : meetup
        ));
    };

    const getTimeUntilMeetup = (date: string, time: string) => {
        const now = new Date();
        const meetupDateTime = new Date(`${date}T${time}`);
        const timeDiff = meetupDateTime.getTime() - now.getTime();
        const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
        const daysDiff = Math.floor(hoursDiff / 24);

        if (timeDiff < 0) return 'Past due';
        if (daysDiff > 0) return `In ${daysDiff} day${daysDiff > 1 ? 's' : ''}`;
        if (hoursDiff > 0) return `In ${hoursDiff} hour${hoursDiff > 1 ? 's' : ''}`;
        return 'Soon!';
    };

    const filteredMeetups = meetups.filter(meetup =>
        activeTab === 'upcoming' ? meetup.status === 'upcoming' : meetup.status === 'completed'
    );

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
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2">
                            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Meetup Scheduler</span>
                        </h1>
                        <p className="text-gray-400">Schedule and manage your meetups with buyers and sellers</p>
                    </div>

                    {/* Tabs and Create Button */}
                    <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setActiveTab('upcoming')}
                                className={`px-6 py-2 rounded-lg transition-all ${activeTab === 'upcoming'
                                    ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white'
                                    : 'bg-slate-900/50 text-gray-400 hover:bg-slate-800/50'
                                    }`}
                            >
                                Upcoming
                            </button>
                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`px-6 py-2 rounded-lg transition-all ${activeTab === 'completed'
                                    ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white'
                                    : 'bg-slate-900/50 text-gray-400 hover:bg-slate-800/50'
                                    }`}
                            >
                                Completed
                            </button>
                        </div>

                        <button
                            onClick={() => setShowNewMeetupModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center space-x-2"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Schedule Meetup</span>
                        </button>
                    </div>

                    {/* Meetups List */}
                    <div className="space-y-4">
                        {filteredMeetups.map((meetup) => (
                            <div
                                key={meetup.id}
                                className="bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/50 transition-all"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    {/* Meetup Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold mb-2">{meetup.title}</h3>
                                                <p className="text-gray-400 mb-2">Item: {meetup.item}</p>
                                            </div>
                                            {meetup.status === 'upcoming' && (
                                                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-sm text-emerald-400">
                                                    {getTimeUntilMeetup(meetup.date, meetup.time)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="flex items-center space-x-2 text-gray-300">
                                                <User className="w-5 h-5 text-blue-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Buyer</p>
                                                    <p className="font-medium">{meetup.buyer}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 text-gray-300">
                                                <User className="w-5 h-5 text-emerald-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Seller</p>
                                                    <p className="font-medium">{meetup.seller}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 text-gray-300">
                                                <Calendar className="w-5 h-5 text-purple-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Date</p>
                                                    <p className="font-medium">{new Date(meetup.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 text-gray-300">
                                                <Clock className="w-5 h-5 text-pink-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Time</p>
                                                    <p className="font-medium">{meetup.time}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 text-gray-300 md:col-span-2">
                                                <MapPin className="w-5 h-5 text-red-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Location</p>
                                                    <p className="font-medium">{meetup.location}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {meetup.notes && (
                                            <div className="flex items-start space-x-2 text-gray-300 bg-slate-800/50 rounded-lg p-3">
                                                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                                                    <p className="text-sm">{meetup.notes}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {meetup.status === 'upcoming' && (
                                        <div className="flex lg:flex-col gap-2">
                                            <button
                                                onClick={() => handleCompleteMeetup(meetup.id)}
                                                className="flex-1 lg:flex-none px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-all text-emerald-400"
                                            >
                                                Complete
                                            </button>
                                            <button
                                                onClick={() => handleCancelMeetup(meetup.id)}
                                                className="flex-1 lg:flex-none px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all text-red-400"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* No Meetups */}
                    {filteredMeetups.length === 0 && (
                        <div className="text-center py-16">
                            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                No {activeTab} meetups
                            </h3>
                            <p className="text-gray-400">
                                {activeTab === 'upcoming'
                                    ? 'Schedule a meetup to get started!'
                                    : 'Completed meetups will appear here'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* New Meetup Modal */}
            {showNewMeetupModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-blue-500/20">
                            <h3 className="text-2xl font-bold">Schedule New Meetup</h3>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Meetup Title *</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Textbook Exchange"
                                    value={newMeetup.title}
                                    onChange={(e) => setNewMeetup({ ...newMeetup, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-blue-500/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Buyer Name *</label>
                                <input
                                    type="text"
                                    placeholder="Who are you meeting?"
                                    value={newMeetup.buyer}
                                    onChange={(e) => setNewMeetup({ ...newMeetup, buyer: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-blue-500/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Item *</label>
                                <input
                                    type="text"
                                    placeholder="What item is being exchanged?"
                                    value={newMeetup.item}
                                    onChange={(e) => setNewMeetup({ ...newMeetup, item: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-blue-500/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-gray-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Date *</label>
                                    <input
                                        type="date"
                                        value={newMeetup.date}
                                        onChange={(e) => setNewMeetup({ ...newMeetup, date: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-blue-500/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Time *</label>
                                    <input
                                        type="time"
                                        value={newMeetup.time}
                                        onChange={(e) => setNewMeetup({ ...newMeetup, time: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-blue-500/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Location *</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Library - 2nd Floor"
                                    value={newMeetup.location}
                                    onChange={(e) => setNewMeetup({ ...newMeetup, location: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-blue-500/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Notes (Optional)</label>
                                <textarea
                                    placeholder="Any additional information..."
                                    value={newMeetup.notes}
                                    onChange={(e) => setNewMeetup({ ...newMeetup, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-blue-500/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-gray-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-blue-500/20 flex space-x-3">
                            <button
                                onClick={() => setShowNewMeetupModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateMeetup}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all font-medium"
                            >
                                Schedule Meetup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeetupSchedulerPage;
