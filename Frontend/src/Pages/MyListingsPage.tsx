import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, Eye, Edit, Trash2, TrendingUp, X, Upload, Save } from 'lucide-react';
import NavigationMenu from '../components/NavigationMenu';
// IMPORTANT: Ensure this path is correct for your project
import { supabase } from '../lib/supabaseClient';

interface Listing {
    id: string;
    title: string;
    price: number;
    category: string;
    condition: string;
    status: 'active' | 'sold' | 'inactive';
    view_count: number;
    description: string;
    notes?: string;
    images: string[];
    created_at: string;
    seller_id: string;
}

const MyListingsPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'active' | 'sold'>('active');
    const [listings, setListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- EDIT MODAL STATE ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Listing | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Form State for Edit
    const [editForm, setEditForm] = useState({
        title: '',
        category: '',
        price: '',
        condition: '',
        description: '',
        notes: ''
    });
    const [existingImages, setExistingImages] = useState<string[]>([]); // URLs from DB
    const [newImages, setNewImages] = useState<File[]>([]); // New files to upload
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]); // Previews for new files
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});

    // Static Data
    const categories = ['Textbooks', 'Electronics', 'Clothing', 'Furniture', 'School Supplies', 'Sports Equipment', 'Musical Instruments', 'Other'];
    const conditions = ['Brand New', 'Like New', 'Good', 'Fair', 'For Parts'];

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }
        try {
            setUser(JSON.parse(userData));
            fetchMyListings();
        } catch (error) {
            navigate('/login');
        }
    }, [navigate]);

    const fetchMyListings = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('sb-access-token') || localStorage.getItem('access_token');
            if (!token) return;

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/items/user/me`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();
            if (response.ok && result.success && result.data) {
                setListings(result.data);
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- DELETE LOGIC ---
    const handleDelete = async (itemId: string) => {
        if (!confirm("Are you sure you want to delete this listing?")) return;

        try {
            const token = localStorage.getItem('sb-access-token') || localStorage.getItem('access_token');
            if (!token) return;

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/items/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            if (response.ok && result.success) {
                setListings(prev => prev.filter(item => item.id !== itemId));
                alert("Item deleted successfully.");
            } else {
                alert(result.message || "Failed to delete item.");
            }
        } catch (error) {
            alert("An error occurred while deleting.");
        }
    };

    // --- EDIT LOGIC ---

    // 1. Open Modal and Populate Data
    const openEditModal = (item: Listing) => {
        setEditingItem(item);
        setEditForm({
            title: item.title,
            category: item.category,
            price: item.price.toString(),
            condition: item.condition,
            description: item.description,
            notes: item.notes || ''
        });
        setExistingImages(item.images || []);
        setNewImages([]);
        setNewImagePreviews([]);
        setEditErrors({});
        setIsEditModalOpen(true);
    };

    // 2. Handle Input Changes
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
        if (editErrors[name]) setEditErrors(prev => ({ ...prev, [name]: '' }));
    };

    // 3. Handle Image Uploads for Edit
    const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const totalImages = existingImages.length + newImages.length + files.length;

        if (totalImages > 5) {
            alert('Maximum 5 images allowed total');
            return;
        }

        setNewImages(prev => [...prev, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    // 4. Remove Image (either old or new)
    const removeImage = (type: 'existing' | 'new', index: number) => {
        if (type === 'existing') {
            setExistingImages(prev => prev.filter((_, i) => i !== index));
        } else {
            setNewImages(prev => prev.filter((_, i) => i !== index));
            setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
        }
    };

    // 5. Submit Update
    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        // Validation
        const newErrors: Record<string, string> = {};
        if (!editForm.title.trim()) newErrors.title = 'Title is required';
        if (!editForm.category) newErrors.category = 'Category is required';
        if (!editForm.price.trim()) newErrors.price = 'Price is required';
        if (!editForm.condition) newErrors.condition = 'Condition is required';
        if (!editForm.description.trim()) newErrors.description = 'Description is required';
        if (existingImages.length + newImages.length === 0) newErrors.images = 'At least one image is required';

        if (Object.keys(newErrors).length > 0) {
            setEditErrors(newErrors);
            return;
        }

        setIsUpdating(true);

        try {
            const token = localStorage.getItem('sb-access-token') || localStorage.getItem('access_token');
            if (!token) throw new Error("Not authenticated");

            // A. Upload NEW images to Supabase
            const newlyUploadedUrls: string[] = [];
            for (const file of newImages) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('item-images')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('item-images')
                    .getPublicUrl(fileName);

                newlyUploadedUrls.push(urlData.publicUrl);
            }

            // B. Combine Old URLs + New URLs
            const finalImages = [...existingImages, ...newlyUploadedUrls];

            // C. Prepare Payload
            const payload = {
                title: editForm.title,
                category: editForm.category,
                price: parseFloat(editForm.price),
                condition: editForm.condition,
                description: editForm.description,
                notes: editForm.notes,
                images: finalImages
            };

            console.log('Sending update payload:', payload); // DEBUG

            // D. Send PUT Request
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/items/${editingItem.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log('Update response:', result); // DEBUG

            if (!response.ok) {
                throw new Error(result.message || "Failed to update");
            }

            // E. Update UI with returned data or use payload
            const updatedItem = result.data || { ...editingItem, ...payload };

            setListings(prev => prev.map(item =>
                item.id === editingItem.id ? updatedItem : item
            ));

            alert("Listing updated successfully!");
            setIsEditModalOpen(false);

        } catch (error: any) {
            console.error("Update error:", error);
            alert(error.message || "Failed to update listing");
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredListings = listings.filter(listing =>
        activeTab === 'active' ? listing.status === 'active' : listing.status === 'sold'
    );

    const totalEarnings = listings
        .filter(l => l.status === 'sold')
        .reduce((sum, l) => sum + l.price, 0);

    if (!user || isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
            {/* Background (Same as before) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950"></div>
                <svg className="absolute inset-0 w-full h-full opacity-20"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" /></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg>
            </div>

            <NavigationMenu user={user} onLogout={() => { localStorage.clear(); navigate('/'); }} />

            <div className="relative pt-24 pb-12 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2">
                            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">My Listings</span>
                        </h1>
                        <p className="text-gray-400">Manage your active and sold items</p>
                    </div>

                    {/* Stats & Tabs (Same as before) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="p-4 bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <Package className="w-8 h-8 text-blue-400" />
                                <div><p className="text-2xl font-bold">{listings.filter(l => l.status === 'active').length}</p><p className="text-sm text-gray-400">Active Listings</p></div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-900/50 backdrop-blur-xl border border-emerald-500/20 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <TrendingUp className="w-8 h-8 text-emerald-400" />
                                <div><p className="text-2xl font-bold">{listings.filter(l => l.status === 'sold').length}</p><p className="text-sm text-gray-400">Items Sold</p></div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-900/50 backdrop-blur-xl border border-teal-500/20 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <ShoppingBag className="w-8 h-8 text-teal-400" />
                                <div><p className="text-2xl font-bold">₱{totalEarnings.toLocaleString()}</p><p className="text-sm text-gray-400">Total Earnings</p></div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 flex space-x-2">
                        <button onClick={() => setActiveTab('active')} className={`px-6 py-2 rounded-lg transition-all ${activeTab === 'active' ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white' : 'bg-slate-900/50 text-gray-400 hover:bg-slate-800/50'}`}>Active</button>
                        <button onClick={() => setActiveTab('sold')} className={`px-6 py-2 rounded-lg transition-all ${activeTab === 'sold' ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white' : 'bg-slate-900/50 text-gray-400 hover:bg-slate-800/50'}`}>Sold</button>
                    </div>

                    {/* Listings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredListings.map((listing) => (
                            <div key={listing.id} className="bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all">
                                <div className="w-full h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
                                    {listing.images && listing.images.length > 0 ? (
                                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <ShoppingBag className="w-16 h-16 text-gray-600" />
                                    )}
                                    {listing.status === 'sold' && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-lg">SOLD</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4">
                                    <h3 className="text-lg font-semibold mb-2">{listing.title}</h3>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-2xl font-bold text-emerald-400">₱{listing.price}</span>
                                        <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs">{listing.condition}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                                        <div className="flex items-center space-x-3">
                                            <span className="flex items-center space-x-1"><Eye className="w-4 h-4" /><span>{listing.view_count}</span></span>
                                        </div>
                                        <span className="text-xs">{listing.category}</span>
                                    </div>

                                    {listing.status === 'active' && (
                                        <div className="flex space-x-2">
                                            {/* EDIT BUTTON TRIGGERS MODAL */}
                                            <button
                                                onClick={() => openEditModal(listing)}
                                                className="flex-1 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all flex items-center justify-center space-x-1"
                                            >
                                                <Edit className="w-4 h-4" />
                                                <span className="text-sm">Edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(listing.id)}
                                                className="flex-1 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all flex items-center justify-center space-x-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="text-sm">Delete</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ================= EDIT MODAL ================= */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsEditModalOpen(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative w-full max-w-3xl bg-slate-900 border border-blue-500/20 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
                            <h2 className="text-2xl font-bold">Edit Listing</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleUpdateSubmit} className="space-y-6">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Title <span className="text-red-400">*</span></label>
                                    <input type="text" name="title" value={editForm.title} onChange={handleEditChange} className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white ${editErrors.title ? 'border-red-500' : 'border-blue-500/30'}`} />
                                </div>

                                {/* Category & Price */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Category <span className="text-red-400">*</span></label>
                                        <select name="category" value={editForm.category} onChange={handleEditChange} className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white ${editErrors.category ? 'border-red-500' : 'border-blue-500/30'}`}>
                                            <option value="">Select</option>
                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Price (₱) <span className="text-red-400">*</span></label>
                                        <input type="number" name="price" value={editForm.price} onChange={handleEditChange} className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white ${editErrors.price ? 'border-red-500' : 'border-blue-500/30'}`} step="0.01" />
                                    </div>
                                </div>

                                {/* Condition */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Condition <span className="text-red-400">*</span></label>
                                    <select name="condition" value={editForm.condition} onChange={handleEditChange} className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white ${editErrors.condition ? 'border-red-500' : 'border-blue-500/30'}`}>
                                        <option value="">Select</option>
                                        {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Description <span className="text-red-400">*</span></label>
                                    <textarea name="description" value={editForm.description} onChange={handleEditChange} rows={4} className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white resize-none ${editErrors.description ? 'border-red-500' : 'border-blue-500/30'}`} />
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                                    <textarea name="notes" value={editForm.notes} onChange={handleEditChange} rows={3} className="w-full px-4 py-3 bg-slate-800/50 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-white resize-none" />
                                </div>

                                {/* Images */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Images (Max 5)</label>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {/* Existing Images */}
                                        {existingImages.map((url, idx) => (
                                            <div key={`old-${idx}`} className="relative aspect-square">
                                                <img src={url} alt="Old" className="w-full h-full object-cover rounded-lg border border-blue-500/30" />
                                                <button type="button" onClick={() => removeImage('existing', idx)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"><X className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                        {/* New Images */}
                                        {newImagePreviews.map((url, idx) => (
                                            <div key={`new-${idx}`} className="relative aspect-square">
                                                <img src={url} alt="New" className="w-full h-full object-cover rounded-lg border border-green-500/30" />
                                                <div className="absolute top-0 right-0 bg-green-500 text-xs px-1 rounded-bl">New</div>
                                                <button type="button" onClick={() => removeImage('new', idx)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"><X className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                        {/* Upload Button */}
                                        {(existingImages.length + newImages.length) < 5 && (
                                            <label className="aspect-square border-2 border-dashed border-blue-500/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-slate-800/30 transition-all">
                                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-xs text-gray-400">Upload</span>
                                                <input type="file" accept="image/*" multiple onChange={handleNewImageUpload} className="hidden" />
                                            </label>
                                        )}
                                    </div>
                                    {editErrors.images && <p className="text-red-400 text-sm mt-1">{editErrors.images}</p>}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} disabled={isUpdating} className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all font-medium">Cancel</button>
                                    <button type="submit" disabled={isUpdating} className={`flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg transition-all font-medium flex items-center justify-center gap-2 ${isUpdating ? 'opacity-50' : 'hover:shadow-lg hover:shadow-blue-500/50'}`}>
                                        {isUpdating ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                        <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyListingsPage;