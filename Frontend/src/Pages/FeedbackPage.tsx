import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationMenu from '../components/NavigationMenu';
import Toast from '../components/Toast';
import { MessageCircle, Send, AlertTriangle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const FeedbackPage = () => {
    const navigate = useNavigate();
    const [user] = useState<any>(() => {
        const data = localStorage.getItem('user');
        return data ? JSON.parse(data) : null;
    });

    const [type, setType] = useState<'bug' | 'idea' | 'other'>('bug');
    const [message, setMessage] = useState('');
    const [page, setPage] = useState('');
    const [contact, setContact] = useState('');
    const [sending, setSending] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    if (!user) {
        navigate('/login');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            setToast({ message: 'Please enter a message.', type: 'error' });
            return;
        }

        setSending(true);
        try {
            const response = await fetch(`${API_URL}/feedback/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type,
                    message,
                    page: page || window.location.pathname,
                    contact: contact || user.email
                })
            });

            const data = await response.json();
            if (data.success) {
                setToast({ message: 'Thanks! Your feedback was sent.', type: 'success' });
                setMessage('');
                setPage('');
                // keep contact so they don't retype
            } else {
                setToast({ message: data.message || 'Failed to send feedback.', type: 'error' });
            }
        } catch (err) {
            console.error('Feedback error:', err);
            setToast({ message: 'Failed to send feedback.', type: 'error' });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
            {/* Background */}
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
                <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Send Feedback / Report a Bug</h1>
                            <p className="text-gray-400 text-sm">
                                This will be sent directly to the developer so issues can be fixed quickly.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                            <div className="flex gap-2">
                                {(['bug', 'idea', 'other'] as const).map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setType(t)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${type === t
                                            ? 'bg-gradient-to-r from-blue-600 to-emerald-600 border-transparent'
                                            : 'bg-slate-900/50 border-slate-700 hover:border-blue-500/50'
                                            }`}
                                    >
                                        {t === 'bug' && 'Bug / Issue'}
                                        {t === 'idea' && 'Feature Idea'}
                                        {t === 'other' && 'Other'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                What happened? <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={5}
                                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-sm text-white resize-none"
                                placeholder="Describe the problem or share your idea..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Which page / screen?</label>
                                <input
                                    type="text"
                                    value={page}
                                    onChange={(e) => setPage(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-900/60 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-sm text-white"
                                    placeholder="e.g. Marketplace, Messages, Dashboard"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    How can we reach you? <span className="text-gray-500 text-xs">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-900/60 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-sm text-white"
                                    placeholder={user.email || 'Email / social handle'}
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-2 text-xs text-gray-500 bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                            <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                            <p>
                                Please avoid sending passwords or sensitive personal data here. This form is only for feedback and bug
                                reports.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-4 py-2 text-sm bg-slate-800/70 hover:bg-slate-800 rounded-xl border border-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={sending}
                                className="px-5 py-2 text-sm bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl flex items-center gap-2 disabled:opacity-60"
                            >
                                {sending ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </span>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span>Send Feedback</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default FeedbackPage;


