import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronDown, ShoppingBag } from 'lucide-react';
import NavigationMenu from '../components/NavigationMenu';

const MarketplacePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [activeSubCategory, setActiveSubCategory] = useState<string>('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    // Category structure
    const categories = {
        'Women': ['Dress', 'T-shirt', 'Pants', 'Heels', 'Uniforms', 'Makeup', 'Accessories'],
        'Men': ['Hat', 'T-shirt', 'Sweater', 'Jacket', 'Pants', 'Shoes'],
        'Unisex': ['T-shirt', 'Hoodie', 'Jacket', 'Pants', 'Shoes', 'Accessories'],
        'Electronics': ['Console', 'PC/Laptop', 'Phone'],
        'Books': ['Textbooks', 'Novels', 'Reference Books', 'Notebooks']
    };

    // Mock items - replace with real data from backend
    const [items] = useState([
        { id: 1, name: 'Calculus Textbook', price: 500, category: 'Books', image: '', seller: 'John Doe', condition: 'Like New' },
        { id: 2, name: 'Blue Dress', price: 350, category: 'Women', image: '', seller: 'Jane Smith', condition: 'Good' },
        { id: 3, name: 'Gaming Console', price: 15000, category: 'Electronics', image: '', seller: 'Mike Johnson', condition: 'Excellent' },
        { id: 4, name: 'Men\'s Jacket', price: 800, category: 'Men', image: '', seller: 'Tom Brown', condition: 'Like New' },
        { id: 5, name: 'Laptop Stand', price: 450, category: 'Electronics', image: '', seller: 'Sarah Lee', condition: 'New' },
        { id: 6, name: 'Physics Notes', price: 200, category: 'Books', image: '', seller: 'Alex Chen', condition: 'Good' },
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

    const handleCategoryClick = (category: string) => {
        setActiveCategory(category);
        setActiveSubCategory('');
        setShowCategoryDropdown('');
    };

    const handleSubCategoryClick = (subCategory: string) => {
        setActiveSubCategory(subCategory);
        setShowCategoryDropdown('');
    };

    const filteredItems = items.filter(item => {
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

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

            {/* Category Navigation */}
            <div className="fixed top-16 w-full z-40 bg-slate-900/80 backdrop-blur-lg border-b border-blue-500/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-1 h-14 overflow-x-auto">
                        <button
                            onClick={() => handleCategoryClick('All')}
                            className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${activeCategory === 'All'
                                ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white'
                                : 'hover:bg-slate-800/50 text-gray-300'
                                }`}
                        >
                            All Items
                        </button>

                        {Object.keys(categories).map((category) => (
                            <div key={category} className="relative">
                                <button
                                    onClick={() => handleCategoryClick(category)}
                                    onMouseEnter={() => setShowCategoryDropdown(category)}
                                    className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap flex items-center space-x-1 ${activeCategory === category
                                        ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white'
                                        : 'hover:bg-slate-800/50 text-gray-300'
                                        }`}
                                >
                                    <span>{category}</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>

                                {/* Dropdown */}
                                {showCategoryDropdown === category && (
                                    <div
                                        onMouseLeave={() => setShowCategoryDropdown('')}
                                        className="absolute top-full left-0 mt-1 w-48 bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 rounded-lg shadow-2xl overflow-hidden"
                                    >
                                        {categories[category as keyof typeof categories].map((subCat) => (
                                            <button
                                                key={subCat}
                                                onClick={() => handleSubCategoryClick(subCat)}
                                                className="w-full px-4 py-2 text-left hover:bg-slate-800/50 transition-colors text-gray-300 hover:text-white"
                                            >
                                                {subCat}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative pt-32 pb-12 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Search and Filter Bar */}
                    <div className="mb-8 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-gray-500"
                            />
                        </div>
                        <button className="px-6 py-3 bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-lg hover:border-blue-500/50 transition-all flex items-center space-x-2">
                            <Filter className="w-5 h-5" />
                            <span>Filters</span>
                        </button>
                    </div>

                    {/* Active Filters */}
                    {(activeCategory !== 'All' || activeSubCategory) && (
                        <div className="mb-6 flex items-center space-x-2">
                            <span className="text-gray-400">Active filters:</span>
                            {activeCategory !== 'All' && (
                                <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm">
                                    {activeCategory}
                                </span>
                            )}
                            {activeSubCategory && (
                                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-sm">
                                    {activeSubCategory}
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setActiveCategory('All');
                                    setActiveSubCategory('');
                                }}
                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Clear all
                            </button>
                        </div>
                    )}

                    {/* Items Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className="group bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all hover:scale-105 cursor-pointer"
                            >
                                {/* Image Placeholder */}
                                <div className="w-full h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                    <ShoppingBag className="w-16 h-16 text-gray-600" />
                                </div>

                                {/* Item Details */}
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                                        {item.name}
                                    </h3>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-2xl font-bold text-emerald-400">₱{item.price}</span>
                                        <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs">
                                            {item.condition}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-400">
                                        <span>{item.seller}</span>
                                        <span className="text-xs">{item.category}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* No Results */}
                    {filteredItems.length === 0 && (
                        <div className="text-center py-16">
                            <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No items found</h3>
                            <p className="text-gray-400">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketplacePage;
