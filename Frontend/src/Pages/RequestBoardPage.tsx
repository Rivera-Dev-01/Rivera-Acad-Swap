import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Send, Plus, Search } from 'lucide-react';
import NavigationMenu from '../components/NavigationMenu';

interface Reply {
    id: number;
    author: string;
    content: string;
    timestamp: string;
    likes: number;
}

interface Post {
    id: number;
    author: string;
    title: string;
    content: string;
    timestamp: string;
    likes: number;
    replies: Reply[];
    category: string;
}

const RequestBoardPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [showNewPostModal, setShowNewPostModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });
    const [replyContent, setReplyContent] = useState('');

    // Mock posts - replace with real data from backend
    const [posts, setPosts] = useState<Post[]>([
        {
            id: 1,
            author: 'John Doe',
            title: 'Looking for Calculus 2 Textbook',
            content: 'Hi! I need a Calculus 2 textbook for this semester. Preferably the 9th edition. Willing to pay up to ₱800. Please message me if you have one!',
            timestamp: '2 hours ago',
            likes: 12,
            category: 'Books',
            replies: [
                {
                    id: 1,
                    author: 'Jane Smith',
                    content: 'I have one! It\'s in good condition. DM me.',
                    timestamp: '1 hour ago',
                    likes: 3
                },
                {
                    id: 2,
                    author: 'Mike Johnson',
                    content: 'Check the library, they might have extra copies for sale.',
                    timestamp: '30 mins ago',
                    likes: 1
                }
            ]
        },
        {
            id: 2,
            author: 'Sarah Lee',
            title: 'Need: Gaming Mouse (Budget Friendly)',
            content: 'Looking for a decent gaming mouse under ₱1000. RGB not necessary, just need good DPI and comfortable grip.',
            timestamp: '5 hours ago',
            likes: 8,
            category: 'Electronics',
            replies: []
        },
        {
            id: 3,
            author: 'Alex Chen',
            title: 'WTB: Women\'s Uniform Size M',
            content: 'Need a complete women\'s uniform set, size medium. Preferably gently used. Budget is ₱1500.',
            timestamp: '1 day ago',
            likes: 5,
            category: 'Clothing',
            replies: [
                {
                    id: 1,
                    author: 'Emma Wilson',
                    content: 'I have one! Worn only twice. Let me know if you\'re interested.',
                    timestamp: '20 hours ago',
                    likes: 2
                }
            ]
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

    const handleCreatePost = () => {
        if (!newPost.title.trim() || !newPost.content.trim()) {
            alert('Please fill in all fields');
            return;
        }

        const post: Post = {
            id: posts.length + 1,
            author: `${user.first_name} ${user.last_name}`,
            title: newPost.title,
            content: newPost.content,
            timestamp: 'Just now',
            likes: 0,
            category: newPost.category,
            replies: []
        };

        setPosts([post, ...posts]);
        setNewPost({ title: '', content: '', category: 'General' });
        setShowNewPostModal(false);
    };

    const handleReply = (postId: number) => {
        if (!replyContent.trim()) return;

        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    replies: [
                        ...post.replies,
                        {
                            id: post.replies.length + 1,
                            author: `${user.first_name} ${user.last_name}`,
                            content: replyContent,
                            timestamp: 'Just now',
                            likes: 0
                        }
                    ]
                };
            }
            return post;
        }));

        setReplyContent('');
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
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
                                            <span className="font-semibold">{post.author}</span>
                                            <span className="text-gray-500 text-sm">•</span>
                                            <span className="text-gray-500 text-sm">{post.timestamp}</span>
                                            <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs">
                                                {post.category}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                                        <p className="text-gray-300">{post.content}</p>
                                    </div>
                                </div>

                                {/* Post Actions */}
                                <div className="flex items-center space-x-4 mb-4">
                                    <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors">
                                        <ThumbsUp className="w-5 h-5" />
                                        <span>{post.likes}</span>
                                    </button>
                                    <button
                                        onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)}
                                        className="flex items-center space-x-2 text-gray-400 hover:text-emerald-400 transition-colors"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        <span>{post.replies.length} replies</span>
                                    </button>
                                </div>

                                {/* Replies Section */}
                                {selectedPost?.id === post.id && (
                                    <div className="mt-4 pt-4 border-t border-slate-800">
                                        {/* Existing Replies */}
                                        <div className="space-y-3 mb-4">
                                            {post.replies.map((reply) => (
                                                <div key={reply.id} className="bg-slate-800/50 rounded-lg p-4">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span className="font-semibold text-sm">{reply.author}</span>
                                                        <span className="text-gray-500 text-xs">•</span>
                                                        <span className="text-gray-500 text-xs">{reply.timestamp}</span>
                                                    </div>
                                                    <p className="text-gray-300 text-sm">{reply.content}</p>
                                                    <button className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition-colors mt-2">
                                                        <ThumbsUp className="w-4 h-4" />
                                                        <span className="text-xs">{reply.likes}</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Reply Input */}
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                placeholder="Write a reply..."
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                className="flex-1 px-4 py-2 bg-slate-800/50 border border-blue-500/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-gray-500"
                                            />
                                            <button
                                                onClick={() => handleReply(post.id)}
                                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
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

            {/* New Post Modal */}
            {showNewPostModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-blue-500/20">
                            <h3 className="text-2xl font-bold">Create New Request</h3>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                                <select
                                    value={newPost.category}
                                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-blue-500/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white"
                                >
                                    <option value="General">General</option>
                                    <option value="Books">Books</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Clothing">Clothing</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                                <input
                                    type="text"
                                    placeholder="What are you looking for?"
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-blue-500/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                <textarea
                                    placeholder="Provide details about what you're looking for..."
                                    value={newPost.content}
                                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                    rows={5}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-blue-500/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-gray-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-blue-500/20 flex space-x-3">
                            <button
                                onClick={() => setShowNewPostModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreatePost}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all font-medium"
                            >
                                Post Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestBoardPage;
