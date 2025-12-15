import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Plus, Search, X, Trash2, Send } from 'lucide-react';
import NavigationMenu from '../components/NavigationMenu';

interface Reply {
    id: string;
    request_id: string;
    user_id: string;
    content?: string;
    message?: string;
    created_at: string;
    user_first_name?: string;
    user_last_name?: string;
}

interface Post {
    id: string;
    user_id: string;
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    budget?: number;
    status: string;
    created_at: string;
    updated_at: string;
    like_count?: number;
    reply_count?: number;
    user_liked?: boolean;
    replies?: Reply[];
    user_first_name?: string;
    user_last_name?: string;
}

const RequestBoardPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [showNewPostModal, setShowNewPostModal] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [newPost, setNewPost] = useState({ title: '', description: '', category: 'Textbooks', budget: '' });
    const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedPosts, setExpandedPosts] = useState<{ [key: string]: boolean }>({});

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

    // Fetch requests from backend
    useEffect(() => {
        const fetchRequests = async () => {
            setIsLoading(true);

            try {
                console.log('Fetching requests from:', 'http://localhost:5000/api/board/request');

                // Include auth token if available
                const token = localStorage.getItem('sb-access-token') || localStorage.getItem('access_token');
                const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch('http://localhost:5000/api/board/request', { headers });
                console.log('Response status:', response.status);

                const result = await response.json();
                console.log('Response data:', result);

                if (result.success && result.data) {
                    setPosts(result.data);
                } else {
                    console.error('Failed to load:', result.message);
                    // Still stop loading even if no data
                    setPosts([]);
                }
            } catch (err: any) {
                console.error('Error fetching requests:', err);
                // Stop loading on error
                setPosts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const handleCreatePost = async () => {
        if (!newPost.title.trim() || !newPost.description.trim()) {
            alert('Please fill in title and description');
            return;
        }

        try {
            const token = localStorage.getItem('sb-access-token') || localStorage.getItem('access_token');

            const response = await fetch('http://localhost:5000/api/board/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: newPost.title,
                    description: newPost.description,
                    category: newPost.category,
                    budget: newPost.budget ? parseFloat(newPost.budget) : null
                })
            });

            const result = await response.json();

            if (result.success) {
                // Add new post to UI without full page reload
                const created = (result.data && result.data[0]) as Post | undefined;
                if (created) {
                    const newPostWithMeta: Post = {
                        ...created,
                        user_first_name: user.first_name,
                        user_last_name: user.last_name,
                        like_count: 0,
                        reply_count: 0,
                        replies: []
                    };
                    setPosts(prev => [newPostWithMeta, ...prev]);
                }
                setShowNewPostModal(false);
                setNewPost({ title: '', description: '', category: 'Textbooks', budget: '' });
            } else {
                alert(result.message || 'Failed to post request');
            }
        } catch (error: any) {
            console.error('Error posting request:', error);
            alert('Failed to post request');
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this request?')) {
            return;
        }

        try {
            const token = localStorage.getItem('sb-access-token') || localStorage.getItem('access_token');

            const response = await fetch(`http://localhost:5000/api/board/requests/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (result.success) {
                setPosts(posts.filter(p => p.id !== postId));
            } else {
                alert(result.message || 'Failed to delete request');
            }
        } catch (error: any) {
            console.error('Error deleting request:', error);
            alert('Failed to delete request');
        }
    };

    const handleLikePost = async (postId: string) => {
        try {
            const token = localStorage.getItem('sb-access-token') || localStorage.getItem('access_token');

            const response = await fetch(`http://localhost:5000/api/board/requests/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (result.success) {
                // Update local state
                setPosts(posts.map(p => {
                    if (p.id === postId) {
                        return {
                            ...p,
                            like_count: result.data.like_count,
                            user_liked: result.data.user_liked
                        };
                    }
                    return p;
                }));
            }
        } catch (error: any) {
            console.error('Error liking post:', error);
        }
    };

    const toggleReplies = async (postId: string) => {
        const isExpanded = expandedPosts[postId];

        if (!isExpanded) {
            // Fetch replies when expanding
            try {
                const response = await fetch(`http://localhost:5000/api/board/requests/${postId}/replies`);
                const result = await response.json();

                if (result.success && result.data) {
                    setPosts(posts.map(p => {
                        if (p.id === postId) {
                            return { ...p, replies: result.data, reply_count: result.data.length };
                        }
                        return p;
                    }));
                } else {
                    // If backend not ready, just expand with empty replies
                    setPosts(posts.map(p => {
                        if (p.id === postId) {
                            return { ...p, replies: [] };
                        }
                        return p;
                    }));
                }
            } catch (error: any) {
                console.error('Error fetching replies:', error);
                // If backend not ready, just expand with empty replies
                setPosts(posts.map(p => {
                    if (p.id === postId) {
                        return { ...p, replies: [] };
                    }
                    return p;
                }));
            }
        }

        setExpandedPosts({ ...expandedPosts, [postId]: !isExpanded });
    };

    const handleReply = async (postId: string) => {
        const content = replyContent[postId];
        if (!content || !content.trim()) {
            return;
        }

        const token = localStorage.getItem('sb-access-token') || localStorage.getItem('access_token');

        // Create optimistic reply
        const tempReply: Reply = {
            id: `temp-${Date.now()}`,
            request_id: postId,
            user_id: user.id,
            content: content,
            created_at: new Date().toISOString(),
            user_first_name: user.first_name,
            user_last_name: user.last_name,
            // message is used in UI, so mirror content
            message: content
        };

        // Add reply instantly to the matching post
        setPosts(prev =>
            prev.map(p =>
                p.id === postId
                    ? {
                        ...p,
                        replies: [...(p.replies || []), tempReply],
                        reply_count: (p.reply_count || 0) + 1
                    }
                    : p
            )
        );

        // Clear input immediately
        setReplyContent({ ...replyContent, [postId]: '' });

        try {
            const response = await fetch(`http://localhost:5000/api/board/requests/${postId}/replies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: content,
                    message: content
                })
            });

            const result = await response.json();

            if (result.success) {
                // Replace temp reply with real one from backend (if returned)
                const saved = (result.data && result.data[0]) as Reply | undefined;
                if (saved) {
                    const savedReply: Reply = {
                        ...saved,
                        user_first_name: user.first_name,
                        user_last_name: user.last_name
                    };
                    setPosts(prev =>
                        prev.map(p =>
                            p.id === postId
                                ? {
                                    ...p,
                                    replies: (p.replies || []).map(r =>
                                        r.id === tempReply.id ? savedReply : r
                                    )
                                }
                                : p
                        )
                    );
                }
            } else {
                // Rollback on error
                setPosts(prev =>
                    prev.map(p =>
                        p.id === postId
                            ? {
                                ...p,
                                replies: (p.replies || []).filter(r => r.id !== tempReply.id),
                                reply_count: Math.max((p.reply_count || 1) - 1, 0)
                            }
                            : p
                    )
                );
                setReplyContent({ ...replyContent, [postId]: content });
            }
        } catch (error: any) {
            console.error('Error posting reply:', error);
            // Rollback on error
            setPosts(prev =>
                prev.map(p =>
                    p.id === postId
                        ? {
                            ...p,
                            replies: (p.replies || []).filter(r => r.id !== tempReply.id),
                            reply_count: Math.max((p.reply_count || 1) - 1, 0)
                        }
                        : p
                )
            );
            setReplyContent({ ...replyContent, [postId]: content });
        }
    };

    const handleDeleteReply = async (postId: string, replyId: string) => {
        if (!confirm('Are you sure you want to delete this reply?')) {
            return;
        }

        try {
            const token = localStorage.getItem('sb-access-token') || localStorage.getItem('access_token');

            const response = await fetch(`http://localhost:5000/api/board/requests/${postId}/replies/${replyId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (result.success) {
                // Update local state
                setPosts(posts.map(p => {
                    if (p.id === postId && p.replies) {
                        return {
                            ...p,
                            replies: p.replies.filter(r => r.id !== replyId),
                            reply_count: (p.reply_count || 0) - 1
                        };
                    }
                    return p;
                }));
            } else {
                alert(result.message || 'Failed to delete reply');
            }
        } catch (error: any) {
            console.error('Error deleting reply:', error);
            alert('Failed to delete reply');
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    };

    if (!user || isLoading) {
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
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2">
                            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Request Board</span>
                        </h1>
                        <p className="text-gray-400">Post what you're looking for and connect with sellers</p>
                    </div>

                    {/* Search and Create Post */}
                    <div className="mb-6 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search requests..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-gray-500"
                            />
                        </div>
                        <button
                            onClick={() => setShowNewPostModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center space-x-2"
                        >
                            <Plus className="w-5 h-5" />
                            <span>New Request</span>
                        </button>
                    </div>

                    {/* Posts List */}
                    <div className="space-y-4">
                        {filteredPosts.map((post) => (
                            <div
                                key={post.id}
                                className="bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/50 transition-all"
                            >
                                {/* Post Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="font-semibold">{post.user_first_name} {post.user_last_name}</span>
                                            <span className="text-gray-500 text-sm">•</span>
                                            <span className="text-gray-500 text-sm">{formatTimeAgo(post.created_at)}</span>
                                            <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs">
                                                {post.category}
                                            </span>
                                            {post.budget && (
                                                <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded text-xs">
                                                    Budget: ₱{post.budget}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                                        <p className="text-gray-300">{post.description}</p>
                                    </div>
                                    {/* Delete button - only show if user owns the post */}
                                    {user && post.user_id === user.id && (
                                        <button
                                            onClick={() => handleDeletePost(post.id)}
                                            className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Delete request"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>

                                {/* Post Actions */}
                                <div className="flex items-center space-x-4 mb-4">
                                    <button
                                        onClick={() => handleLikePost(post.id)}
                                        className={`flex items-center space-x-2 transition-colors ${post.user_liked
                                            ? 'text-blue-400'
                                            : 'text-gray-400 hover:text-blue-400'
                                            }`}
                                    >
                                        <ThumbsUp className={`w-5 h-5 ${post.user_liked ? 'fill-current' : ''}`} />
                                        <span>{post.like_count || 0}</span>
                                    </button>
                                    <button
                                        onClick={() => toggleReplies(post.id)}
                                        className="flex items-center space-x-2 text-gray-400 hover:text-emerald-400 transition-colors"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        <span>{post.reply_count || 0} replies</span>
                                    </button>
                                </div>

                                {/* Replies Section */}
                                {expandedPosts[post.id] && (
                                    <div className="mt-4 pt-4 border-t border-slate-700 animate-slideDown">
                                        {/* Reply Input */}
                                        <div className="flex gap-2 mb-4">
                                            <input
                                                type="text"
                                                placeholder="Write a reply..."
                                                value={replyContent[post.id] || ''}
                                                onChange={(e) => setReplyContent({ ...replyContent, [post.id]: e.target.value })}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleReply(post.id);
                                                    }
                                                }}
                                                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-500"
                                            />
                                            <button
                                                onClick={() => handleReply(post.id)}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                                            >
                                                <Send className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Replies List */}
                                        <div className="space-y-3">
                                            {post.replies && post.replies.length > 0 ? (
                                                post.replies.map((reply) => (
                                                    <div key={reply.id} className="bg-slate-800/50 rounded-lg p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <span className="font-semibold text-sm">{reply.user_first_name} {reply.user_last_name}</span>
                                                                    <span className="text-gray-500 text-xs">•</span>
                                                                    <span className="text-gray-500 text-xs">{formatTimeAgo(reply.created_at)}</span>
                                                                </div>
                                                                <p className="text-gray-300 text-sm">{reply.message || reply.content}</p>
                                                            </div>
                                                            {/* Delete reply button */}
                                                            {user && reply.user_id === user.id && (
                                                                <button
                                                                    onClick={() => handleDeleteReply(post.id, reply.id)}
                                                                    className="ml-2 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                                                                    title="Delete reply"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-sm text-center py-4">No replies yet. Be the first to reply!</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* No Results */}
                    {filteredPosts.length === 0 && (
                        <div className="text-center py-16">
                            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No requests found</h3>
                            <p className="text-gray-400">Be the first to post a request!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* New Post Modal - Redesigned */}
            {showNewPostModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
                    onClick={() => setShowNewPostModal(false)}
                >
                    <div
                        className="w-full max-w-3xl max-h-[90vh] bg-slate-900 rounded-3xl border-2 border-slate-700 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-700 bg-slate-900">
                            <div>
                                <h2 className="text-3xl font-bold mb-1">Create New Request</h2>
                                <p className="text-sm text-gray-400">Post what you're looking for</p>
                            </div>
                            <button
                                onClick={() => setShowNewPostModal(false)}
                                className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content - Optimized for smooth scrolling */}
                        <div
                            className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6"
                            style={{
                                scrollBehavior: 'smooth',
                                WebkitOverflowScrolling: 'touch',
                                willChange: 'scroll-position'
                            }}
                        >
                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block text-base font-semibold text-white mb-3">
                                    What are you looking for? <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    placeholder="e.g., Calculus 2 Textbook 9th Edition"
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                    className="w-full px-6 py-4 text-lg bg-slate-800 border-2 border-slate-700 hover:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-500"
                                />
                            </div>

                            {/* Category and Budget Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Category */}
                                <div>
                                    <label htmlFor="category" className="block text-base font-semibold text-white mb-3">
                                        Category <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        id="category"
                                        value={newPost.category}
                                        onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                                        className="w-full px-6 py-4 text-lg bg-slate-800 border-2 border-slate-700 hover:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white"
                                    >
                                        <option value="Textbooks">📚 Textbooks</option>
                                        <option value="Electronics">💻 Electronics</option>
                                        <option value="Clothing & Accessories">👕 Clothing & Accessories</option>
                                        <option value="Furniture">🪑 Furniture</option>
                                        <option value="School Supplies">✏️ School Supplies</option>
                                        <option value="Sports Equipment">⚽ Sports Equipment</option>
                                        <option value="Musical Instruments">🎸 Musical Instruments</option>
                                        <option value="Books & Novels">📖 Books & Novels</option>
                                        <option value="Other">🎁 Other</option>
                                    </select>
                                </div>

                                {/* Budget */}
                                <div>
                                    <label htmlFor="budget" className="block text-base font-semibold text-white mb-3">
                                        Budget <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-gray-400">₱</span>
                                        <input
                                            type="number"
                                            id="budget"
                                            placeholder="0.00"
                                            value={newPost.budget}
                                            onChange={(e) => setNewPost({ ...newPost, budget: e.target.value })}
                                            className="w-full pl-14 pr-6 py-4 text-lg bg-slate-800 border-2 border-slate-700 hover:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-500"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-base font-semibold text-white mb-3">
                                    Description <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    placeholder="Provide details... What condition? Any specific requirements? Where to meet?"
                                    value={newPost.description}
                                    onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                                    rows={5}
                                    className="w-full px-6 py-4 text-lg bg-slate-800 border-2 border-slate-700 hover:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-500 resize-none"
                                />
                                <p className="text-sm text-gray-500 mt-2">💡 Tip: Be specific to get better responses!</p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-4 px-8 py-6 border-t border-slate-700 bg-slate-900">
                            <button
                                onClick={() => setShowNewPostModal(false)}
                                className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-lg transition-colors border-2 border-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreatePost}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
                            >
                                🚀 Post Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestBoardPage;
