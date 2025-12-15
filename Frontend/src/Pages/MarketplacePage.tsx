import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ShoppingBag, X, MessageCircle } from 'lucide-react';
import NavigationMenu from '../components/NavigationMenu';
import ProfileAvatar from '../components/ProfileAvatar';
import MakeOfferModal from '../components/MakeOfferModal';
import Toast from '../components/Toast';
import { useRealtimeItems } from '../hooks/useRealtimeData';

// Custom Peso Icon
const PesoIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M5 6h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H5V6z" />
        <line x1="5" y1="6" x2="5" y2="20" />
        <line x1="3" y1="10" x2="11" y2="10" />
        <line x1="3" y1="14" x2="11" y2="14" />
    </svg>
);

const MarketplacePage = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState<any>(null);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [activeSubCategory, setActiveSubCategory] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [showItemModal, setShowItemModal] = useState(false);
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Category structure
    const categories: Record<string, string[]> = {
        'Textbooks': [],
        'Electronics': ['Laptops', 'Phones', 'Consoles', 'Accessories', 'Other'],
        'Clothing & Accessories': ['Tops', 'Bottoms', 'Outerwear', 'Footwear', 'Accessories', 'Uniforms'],
        'Furniture': [],
        'School Supplies': [],
        'Sports Equipment': [],
        'Musical Instruments': [],
        'Books & Novels': ['Fiction', 'Non-Fiction', 'Comics', 'Magazines', 'Other'],
        'Other': []
    };

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

    // Fetch marketplace items from backend
    useEffect(() => {
        const fetchItems = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/marketplace/items`);
                const result = await response.json();

                if (result.success && result.data) {
                    setItems(result.data);
                } else {
                    setError(result.message || 'Failed to load items');
                }
            } catch (err: any) {
                console.error('Error fetching marketplace items:', err);
                setError('Failed to connect to server');
            } finally {
                setIsLoading(false);
            }
        };

        fetchItems();
    }, []);

    // Real-time marketplace - instant updates!
    useRealtimeItems((changedItem) => {
        console.log('Item changed:', changedItem);
        setItems(prev => {
            const exists = prev.find(item => item.id === changedItem.id);
            if (exists) {
                // Update existing item
                return prev.map(item => item.id === changedItem.id ? changedItem : item);
            } else {
                // Add new item
                return [changedItem, ...prev];
            }
        });
    });

    const handleCategoryClick = (category: string) => {
        setActiveCategory(category);
        setActiveSubCategory('');
    };

    const handleSubCategoryClick = (subCategory: string) => {
        setActiveSubCategory(subCategory);
    };



    const handleMarkAsSold = async () => {
        if (!selectedItem) return;

        const confirmSold = window.confirm(`Are you sure you want to mark "${selectedItem.title}" as sold? This will remove it from the marketplace.`);
        if (!confirmSold) return;

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/items/${selectedItem.id}/mark-sold`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                setToast({ message: 'Item marked as sold successfully!', type: 'success' });
                setShowItemModal(false);
                setSelectedItem(null);
                // Refresh the items list
                const refreshResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/marketplace/items`);
                const refreshResult = await refreshResponse.json();
                if (refreshResult.success && refreshResult.data) {
                    setItems(refreshResult.data);
                }
            } else {
                setToast({ message: `Failed to mark item as sold: ${result.message}`, type: 'error' });
            }
        } catch (error) {
            console.error('Error marking item as sold:', error);
            setToast({ message: 'An error occurred while marking the item as sold', type: 'error' });
        }
    };

    const handleMakeOffer = async (offerAmount: number, message: string) => {
        if (!selectedItem) return;

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/offer/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    item_id: selectedItem.id,
                    offer_amount: offerAmount,
                    message: message
                })
            });

            const result = await response.json();

            if (result.success) {
                setToast({ message: 'Offer sent successfully!', type: 'success' });
                setShowOfferModal(false);
                setShowItemModal(false);
            } else {
                setToast({ message: result.message || 'Failed to send offer', type: 'error' });
            }
        } catch (error) {
            console.error('Error making offer:', error);
            setToast({ message: 'An error occurred while sending the offer', type: 'error' });
        }
    };

    const filteredItems = items.filter(item => {
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        const matchesSubCategory = !activeSubCategory || item.subcategory === activeSubCategory;
        const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSubCategory && matchesSearch;
    });

    if (!user || isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading marketplace...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Error Loading Items</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        Try Again
                    </button>
                </div>
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

            {/* Filter Pill Bar - Only show when filters are active */}
            {(activeCategory !== 'All' || activeSubCategory) && (
                <div className="fixed top-16 w-full z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
                            <span className="text-sm text-gray-400 font-medium whitespace-nowrap">Active filters:</span>

                            {/* Active Filter Pills */}
                            {activeCategory !== 'All' && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/40 rounded-full text-sm font-medium whitespace-nowrap">
                                    <span>{activeCategory}</span>
                                    <button
                                        onClick={() => setActiveCategory('All')}
                                        className="hover:bg-blue-500/30 rounded-full p-0.5 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {activeSubCategory && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-sm font-medium whitespace-nowrap">
                                    <span>{activeSubCategory}</span>
                                    <button
                                        onClick={() => setActiveSubCategory('')}
                                        className="hover:bg-emerald-500/30 rounded-full p-0.5 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Clear All */}
                            <button
                                onClick={() => {
                                    setActiveCategory('All');
                                    setActiveSubCategory('');
                                }}
                                className="px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap underline"
                            >
                                Clear all
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Modal */}
            {showFilterModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
                    onClick={() => setShowFilterModal(false)}
                >
                    <div
                        className="w-full max-w-3xl max-h-[85vh] bg-slate-900 rounded-3xl border-2 border-slate-700 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-700 bg-slate-900">
                            <div>
                                <h2 className="text-3xl font-bold mb-1">Filters</h2>
                                <p className="text-sm text-gray-400">Find exactly what you're looking for</p>
                            </div>
                            <button
                                onClick={() => setShowFilterModal(false)}
                                className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content - Optimized for smooth scrolling */}
                        <div
                            className="p-8 overflow-y-auto max-h-[calc(85vh-200px)] space-y-8"
                            style={{
                                scrollBehavior: 'smooth',
                                WebkitOverflowScrolling: 'touch',
                                willChange: 'scroll-position'
                            }}
                        >
                            {/* Categories Section */}
                            <div>
                                <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full"></span>
                                    Categories
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => {
                                            handleCategoryClick('All');
                                            setShowFilterModal(false);
                                        }}
                                        className={`px-5 py-4 rounded-xl transition-colors font-semibold text-base flex items-center gap-3 ${activeCategory === 'All'
                                            ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white'
                                            : 'bg-slate-800 hover:bg-slate-700 text-gray-300 border-2 border-slate-700'
                                            }`}
                                    >
                                        <span className="text-2xl">🔥</span>
                                        <span>All Items</span>
                                    </button>

                                    {Object.keys(categories).map((category) => {
                                        const categoryEmojis: Record<string, string> = {
                                            'Textbooks': '📚',
                                            'Electronics': '💻',
                                            'Clothing & Accessories': '👕',
                                            'Furniture': '🪑',
                                            'School Supplies': '✏️',
                                            'Sports Equipment': '⚽',
                                            'Musical Instruments': '🎸',
                                            'Books & Novels': '📖',
                                            'Other': '🎁'
                                        };

                                        return (
                                            <button
                                                key={category}
                                                onClick={() => {
                                                    handleCategoryClick(category);
                                                    if (categories[category].length === 0) {
                                                        setShowFilterModal(false);
                                                    }
                                                }}
                                                className={`px-5 py-4 rounded-xl transition-colors font-semibold text-base flex items-center gap-3 ${activeCategory === category
                                                    ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white'
                                                    : 'bg-slate-800 hover:bg-slate-700 text-gray-300 border-2 border-slate-700'
                                                    }`}
                                            >
                                                <span className="text-2xl">{categoryEmojis[category]}</span>
                                                <span className="text-left truncate">{category}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Subcategories Section - Only show if category has subcategories */}
                            {activeCategory !== 'All' && categories[activeCategory]?.length > 0 && (
                                <div className="pt-6 border-t border-slate-700/50">
                                    <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-full"></span>
                                        {activeCategory} Subcategories
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {categories[activeCategory].map((subCat) => (
                                            <button
                                                key={subCat}
                                                onClick={() => {
                                                    handleSubCategoryClick(subCat);
                                                    setShowFilterModal(false);
                                                }}
                                                className={`px-5 py-4 rounded-xl transition-colors font-semibold text-base text-left ${activeSubCategory === subCat
                                                    ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white'
                                                    : 'bg-slate-800 hover:bg-slate-700 text-gray-300 border-2 border-slate-700'
                                                    }`}
                                            >
                                                {subCat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-4 px-8 py-6 border-t border-slate-700 bg-slate-900">
                            <button
                                onClick={() => {
                                    setActiveCategory('All');
                                    setActiveSubCategory('');
                                }}
                                className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-lg transition-colors border-2 border-slate-700"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={() => setShowFilterModal(false)}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className={`relative pb-12 px-4 ${(activeCategory !== 'All' || activeSubCategory) ? 'pt-32' : 'pt-20'}`}>
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="mb-10 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-3">
                            Find Your Next <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Great Deal</span>
                        </h1>
                        <p className="text-gray-400 text-lg">Browse items from students like you 🎓</p>
                    </div>

                    {/* Search Bar with Filter Button */}
                    <div className="mb-8 flex gap-3">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search for textbooks, electronics, clothing..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 text-lg bg-slate-900/50 backdrop-blur-xl border-2 border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-500"
                            />
                        </div>

                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilterModal(true)}
                            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 transition-all whitespace-nowrap"
                        >
                            <Filter className="w-5 h-5" />
                            <span className="hidden sm:inline">Filters</span>
                        </button>
                    </div>

                    {/* Results Count */}
                    <div className="mb-6">
                        <p className="text-gray-400">
                            <span className="text-white font-semibold">{filteredItems.length}</span> items available
                        </p>
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => {
                                    setSelectedItem(item);
                                    setShowItemModal(true);
                                }}
                                className="group bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer"
                            >
                                {/* Image */}
                                <div className="relative w-full h-56 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
                                    {item.images && item.images.length > 0 ? (
                                        <img
                                            src={item.images[0]}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <ShoppingBag className="w-20 h-20 text-gray-700 group-hover:text-gray-600 transition-colors" />
                                    )}
                                    {/* Condition Badge */}
                                    <div className="absolute top-3 right-3 px-3 py-1.5 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg text-xs font-semibold">
                                        {item.condition}
                                    </div>
                                </div>

                                {/* Item Details */}
                                <div className="p-5">
                                    <h3 className="text-lg font-bold mb-3 group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[3.5rem]">
                                        {item.title}
                                    </h3>

                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">₱{item.price}</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                                        <ProfileAvatar
                                            userId={item.seller_id}
                                            firstName={item.seller_first_name}
                                            lastName={item.seller_last_name}
                                            profilePicture={item.seller_profile_picture}
                                            size="sm"
                                            showName={true}
                                        />
                                    </div>
                                </div>

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            </div>
                        ))}
                    </div>

                    {/* No Results */}
                    {filteredItems.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 mx-auto mb-6 bg-slate-800/50 rounded-full flex items-center justify-center">
                                <ShoppingBag className="w-12 h-12 text-gray-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">No items found</h3>
                            <p className="text-gray-400 text-lg mb-6">Try adjusting your search or filters</p>
                            <button
                                onClick={() => {
                                    setActiveCategory('All');
                                    setActiveSubCategory('');
                                    setSearchQuery('');
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                            >
                                View All Items
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Item Detail Modal */}
            {showItemModal && selectedItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fadeIn"
                    onClick={() => setShowItemModal(false)}
                >
                    <div
                        className="w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl border-2 border-slate-700 shadow-2xl overflow-hidden animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-700 bg-slate-900">
                            <h2 className="text-2xl font-bold">Item Details</h2>
                            <button
                                onClick={() => setShowItemModal(false)}
                                className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Image Section */}
                                <div className="space-y-4">
                                    <div className="relative w-full h-80 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden">
                                        {selectedItem.images && selectedItem.images.length > 0 ? (
                                            <img
                                                src={selectedItem.images[0]}
                                                alt={selectedItem.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ShoppingBag className="w-24 h-24 text-gray-700" />
                                            </div>
                                        )}
                                    </div>
                                    {selectedItem.images && selectedItem.images.length > 1 && (
                                        <div className="grid grid-cols-4 gap-2">
                                            {selectedItem.images.slice(1, 5).map((img: string, idx: number) => (
                                                <div key={idx} className="relative w-full h-20 bg-slate-800 rounded-lg overflow-hidden">
                                                    <img src={img} alt={`${selectedItem.title} ${idx + 2}`} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Details Section */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-3xl font-bold mb-2">{selectedItem.title}</h3>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm">
                                                {selectedItem.category}
                                            </span>
                                            {selectedItem.subcategory && (
                                                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-sm">
                                                    {selectedItem.subcategory}
                                                </span>
                                            )}
                                            <span className="px-3 py-1 bg-slate-700 rounded-lg text-sm font-semibold">
                                                {selectedItem.condition}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="py-4 border-y border-slate-700">
                                        <div className="text-sm text-gray-400 mb-1">Price</div>
                                        <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                                            ₱{selectedItem.price}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-400 mb-2">Description</div>
                                        <p className="text-gray-300 leading-relaxed">{selectedItem.description || 'No description provided.'}</p>
                                    </div>

                                    {selectedItem.size && (
                                        <div>
                                            <div className="text-sm text-gray-400 mb-2">Size</div>
                                            <p className="text-white font-medium">{selectedItem.size}</p>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-slate-700">
                                        <div className="text-sm text-gray-400 mb-3">Seller</div>
                                        <div className="flex items-center gap-3">
                                            <ProfileAvatar
                                                userId={selectedItem.seller_id}
                                                firstName={selectedItem.seller_first_name}
                                                lastName={selectedItem.seller_last_name}
                                                profilePicture={selectedItem.seller_profile_picture}
                                                size="lg"
                                            />
                                            <div>
                                                <div
                                                    className="font-semibold text-lg hover:text-blue-400 cursor-pointer transition-colors"
                                                    onClick={() => navigate(`/user/${selectedItem.seller_id}`)}
                                                >
                                                    {selectedItem.seller_first_name} {selectedItem.seller_last_name}
                                                </div>
                                                <div className="text-sm text-gray-400">Listed {new Date(selectedItem.created_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-4 px-8 py-6 border-t border-slate-700 bg-slate-900">
                            <button
                                onClick={() => setShowItemModal(false)}
                                className="px-6 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-lg transition-colors border-2 border-slate-700"
                            >
                                Close
                            </button>

                            {/* Show Mark as Sold button only if user is the seller */}
                            {selectedItem.seller_id === user?.id ? (
                                <button
                                    onClick={handleMarkAsSold}
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
                                >
                                    Mark as Sold
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            navigate('/messages', {
                                                state: {
                                                    openConversation: selectedItem.seller_id,
                                                    userName: `${selectedItem.seller_first_name} ${selectedItem.seller_last_name}`,
                                                    profilePicture: selectedItem.seller_profile_picture
                                                }
                                            });
                                        }}
                                        className="flex-1 px-6 py-4 glass-card hover:bg-slate-800/50 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        Contact Seller
                                    </button>
                                    <button
                                        onClick={() => setShowOfferModal(true)}
                                        className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <PesoIcon className="w-5 h-5" />
                                        Make Offer
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Make Offer Modal */}
            {showOfferModal && selectedItem && (
                <MakeOfferModal
                    item={{
                        id: selectedItem.id,
                        title: selectedItem.title,
                        price: selectedItem.price,
                        seller_first_name: selectedItem.seller_first_name,
                        seller_last_name: selectedItem.seller_last_name
                    }}
                    onClose={() => setShowOfferModal(false)}
                    onSubmit={handleMakeOffer}
                />
            )}

            {/* Toast Notifications */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default MarketplacePage;
