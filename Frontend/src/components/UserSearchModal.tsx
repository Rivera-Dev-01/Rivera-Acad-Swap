import { useState, useEffect } from 'react';
import { X, Search, Users as UsersIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileAvatar from './ProfileAvatar';

const API_URL = 'http://localhost:5000/api';

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

interface UserSearchModalProps {
    onClose: () => void;
}

const UserSearchModal = ({ onClose }: UserSearchModalProps) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchQuery.trim()) {
                searchUsers();
            } else {
                setUsers([]);
                setHasSearched(false);
            }
        }, 300); // Debounce search

        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    const searchUsers = async () => {
        setLoading(true);
        setHasSearched(true);
        const token = localStorage.getItem('access_token');

        try {
            const response = await fetch(`${API_URL}/user/search?q=${encodeURIComponent(searchQuery)}`, {
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

    const handleUserClick = (userId: string) => {
        navigate(`/user/${userId}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-20">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative glass-card rounded-2xl shadow-2xl max-w-2xl w-full animate-scale-in">
                {/* Header */}
                <div className="p-6 border-b border-blue-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold flex items-center space-x-2">
                            <UsersIcon className="w-6 h-6 text-blue-400" />
                            <span>Search Users</span>
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full pl-12 pr-4 py-3 glass-input rounded-xl text-white placeholder-gray-400"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Results */}
                <div className="p-6 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : users.length > 0 ? (
                        <div className="space-y-2">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => handleUserClick(user.id)}
                                    className="p-4 glass-card glass-card-hover rounded-xl cursor-pointer transition-all flex items-center justify-between"
                                >
                                    <div className="flex items-center space-x-4">
                                        <ProfileAvatar
                                            userId={user.id}
                                            firstName={user.first_name}
                                            lastName={user.last_name}
                                            profilePicture={user.profile_picture}
                                            size="md"
                                        />
                                        <div>
                                            <div className="font-semibold flex items-center space-x-2">
                                                <span>{user.first_name} {user.last_name}</span>
                                                {user.profile_completed && (
                                                    <div className="w-4 h-4 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center">
                                                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                        </svg>
                                                    </div>
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
                            ))}
                        </div>
                    ) : hasSearched ? (
                        <div className="text-center py-12 text-gray-400">
                            <UsersIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>No users found</p>
                            <p className="text-sm mt-2">Try a different search term</p>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Start typing to search for users</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserSearchModal;
