import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Mail, Phone, MapPin, BookOpen, Calendar, Users, Award, Edit2, Save, X } from 'lucide-react';
import NavigationMenu from '../components/NavigationMenu';
import Toast from '../components/Toast';
import { API_BASE as API_URL } from '../config/constants';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
    const [scrollY, setScrollY] = useState(0);
    const [editForm, setEditForm] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        address: '',
        course: '',
        current_year: '',
        block_section: ''
    });

    useEffect(() => {
        fetchProfile();

        // Restore scroll position on page load
        const savedScrollY = sessionStorage.getItem('profileScrollY');
        if (savedScrollY) {
            window.scrollTo(0, parseInt(savedScrollY));
            setScrollY(parseInt(savedScrollY));
        }

        // Scroll effect
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrollY(currentScrollY);
            // Save scroll position
            sessionStorage.setItem('profileScrollY', currentScrollY.toString());
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchProfile = async () => {
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
                setUser(data.user);
                setEditForm({
                    first_name: data.user.first_name || '',
                    last_name: data.user.last_name || '',
                    phone_number: data.user.phone_number || '',
                    address: data.user.address || '',
                    course: data.user.course || '',
                    current_year: data.user.current_year || '',
                    block_section: data.user.block_section || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const token = localStorage.getItem('access_token');

        try {
            const response = await fetch(`${API_URL}/user/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.user);
                setIsEditing(false);
                // Update localStorage with new user data including profile_completed status
                localStorage.setItem('user', JSON.stringify(data.user));
                setToastMessage('Profile updated successfully!');
                setToastType('success');
                setShowToast(true);

                // Check if profile is now complete
                if (data.user.profile_completed) {
                    setTimeout(() => {
                        setToastMessage('🎉 Your profile is now complete! You can list unlimited items.');
                        setToastType('success');
                        setShowToast(true);
                    }, 2000);
                }
            } else {
                setToastMessage('Failed to update profile');
                setToastType('error');
                setShowToast(true);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setToastMessage('Failed to update profile');
            setToastType('error');
            setShowToast(true);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setToastMessage('Please select an image file');
            setToastType('error');
            setShowToast(true);
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setToastMessage('Image size must be less than 5MB');
            setToastType('error');
            setShowToast(true);
            return;
        }

        setUploadingImage(true);
        const token = localStorage.getItem('access_token');

        try {
            // Convert image to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;

                // Update profile with image
                const response = await fetch(`${API_URL}/user/profile`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ profile_picture: base64String })
                });

                const data = await response.json();

                if (data.success) {
                    setUser(data.user);
                    // Update localStorage with new user data including profile_completed status
                    localStorage.setItem('user', JSON.stringify(data.user));
                    setToastMessage('Profile picture updated successfully!');
                    setToastType('success');
                    setShowToast(true);

                    // Check if profile is now complete
                    if (data.user.profile_completed) {
                        setTimeout(() => {
                            setToastMessage('🎉 Your profile is now complete! You can list unlimited items.');
                            setToastType('success');
                            setShowToast(true);
                        }, 2000);
                    }
                } else {
                    setToastMessage('Failed to update profile picture');
                    setToastType('error');
                    setShowToast(true);
                }
                setUploadingImage(false);
            };

            reader.onerror = () => {
                setToastMessage('Failed to read image file');
                setToastType('error');
                setShowToast(true);
                setUploadingImage(false);
            };

            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading image:', error);
            setToastMessage('Failed to upload image');
            setToastType('error');
            setShowToast(true);
            setUploadingImage(false);
        }
    };

    const getReputationTier = (score: number) => {
        if (score >= 100) return { name: 'Mythic', color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-500/20' };
        if (score >= 75) return { name: 'Legend', color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-500/20' };
        if (score >= 51) return { name: 'Rare', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/20' };
        if (score >= 25) return { name: 'Uncommon', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-500/20' };
        return { name: 'Common', color: 'from-gray-500 to-slate-500', bgColor: 'bg-gray-500/20' };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const tier = getReputationTier(user.reputation_score || 0);

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
            {/* Animated Background */}
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
            </div>

            <NavigationMenu
                user={user}
                onLogout={() => {
                    localStorage.clear();
                    navigate('/');
                }}
            />

            <div className="relative pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Profile Header */}
                    <div
                        className="mb-8 p-8 glass-card rounded-2xl transition-all duration-300"
                        style={{
                            background: `rgba(15, 23, 42, ${Math.min(0.6 + scrollY * 0.001, 0.9)})`,
                            backdropFilter: `blur(${Math.min(20 + scrollY * 0.05, 40)}px)`
                        }}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center space-x-6">
                                {/* Profile Picture */}
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 p-1">
                                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                                            {user.profile_picture ? (
                                                <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera className="w-12 h-12 text-gray-500" />
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        id="profile-picture-upload"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => document.getElementById('profile-picture-upload')?.click()}
                                        disabled={uploadingImage}
                                        className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Upload profile picture"
                                    >
                                        {uploadingImage ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ) : (
                                            <Camera className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                {/* Name and Reputation */}
                                <div>
                                    <h1 className="text-3xl font-bold mb-2 flex items-center space-x-2">
                                        <span>{user.first_name} {user.last_name}</span>
                                        {user.profile_completed && (
                                            <div
                                                className="relative group"
                                                title="Verified Profile"
                                            >
                                                {/* Star Badge */}
                                                <svg className="w-6 h-6 drop-shadow-lg flex-shrink-0" viewBox="0 0 24 24" fill="none">
                                                    <defs>
                                                        <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
                                                            <stop offset="100%" stopColor="rgba(34, 211, 238, 0.8)" />
                                                        </linearGradient>
                                                    </defs>
                                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                                        fill="url(#starGradient)"
                                                        stroke="white"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round" />
                                                    <polyline points="9 12 11 14 15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        )}
                                    </h1>
                                    <div className={`inline-flex items-center space-x-2 px-4 py-2 ${tier.bgColor} border border-${tier.color.split('-')[1]}-500/30 rounded-full`}>
                                        <Award className="w-5 h-5" />
                                        <span className={`font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                                            {tier.name}
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <span className="font-semibold">{user.reputation_score || 0} pts</span>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Button */}
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-2 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    <span>Edit Profile</span>
                                </button>
                            ) : (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>{saving ? 'Saving...' : 'Save'}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditForm({
                                                first_name: user.first_name || '',
                                                last_name: user.last_name || '',
                                                phone_number: user.phone_number || '',
                                                address: user.address || '',
                                                course: user.course || '',
                                                current_year: user.current_year || '',
                                                block_section: user.block_section || ''
                                            });
                                        }}
                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg flex items-center space-x-2 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        <span>Cancel</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Profile Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Email */}
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-400 mb-1">School Email</p>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-400 mb-1">Phone Number</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.phone_number}
                                            onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="font-medium">{user.phone_number || 'Not set'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Course */}
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="w-5 h-5 text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-400 mb-1">Course</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.course}
                                            onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="font-medium">{user.course || 'Not set'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Year & Block */}
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-400 mb-1">Year & Block</p>
                                    {isEditing ? (
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={editForm.current_year}
                                                onChange={(e) => setEditForm({ ...editForm, current_year: e.target.value })}
                                                placeholder="Year"
                                                className="w-1/2 px-3 py-2 bg-slate-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                                            />
                                            <input
                                                type="text"
                                                value={editForm.block_section}
                                                onChange={(e) => setEditForm({ ...editForm, block_section: e.target.value })}
                                                placeholder="Block"
                                                className="w-1/2 px-3 py-2 bg-slate-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    ) : (
                                        <p className="font-medium">
                                            {user.current_year && user.block_section
                                                ? `${user.current_year} - ${user.block_section}`
                                                : 'Not set'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Address */}
                            <div className="flex items-start space-x-3 md:col-span-2">
                                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-400 mb-1">Address</p>
                                    {isEditing ? (
                                        <textarea
                                            value={editForm.address}
                                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                            rows={2}
                                            className="w-full px-3 py-2 bg-slate-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="font-medium">{user.address || 'Not set'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Friends/Mutual Section */}
                    <div
                        className="p-8 glass-card rounded-2xl transition-all duration-300"
                        style={{
                            background: `rgba(15, 23, 42, ${Math.min(0.6 + scrollY * 0.001, 0.9)})`,
                            backdropFilter: `blur(${Math.min(20 + scrollY * 0.05, 40)}px)`
                        }}
                    >
                        <div className="flex items-center space-x-3 mb-6">
                            <Users className="w-6 h-6 text-blue-400" />
                            <h2 className="text-2xl font-bold">Friends & Connections</h2>
                        </div>
                        <div className="text-center py-12 text-gray-400">
                            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Friends feature coming soon!</p>
                        </div>
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

export default ProfilePage;
