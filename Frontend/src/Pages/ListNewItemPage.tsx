import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Upload, X, ArrowLeft } from 'lucide-react';
// IMPORTANT: Adjust this path to where your supabase client is initialized
import { supabase } from '../lib/supabaseClient';

const ListNewItemPage = () => {
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        subcategory: '',
        price: '',
        condition: '',
        description: '',
        notes: '',
        size: ''
    });

    // Image State
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // UI State
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const categories = [
        'Textbooks',
        'Electronics',
        'Clothing & Accessories',
        'Furniture',
        'School Supplies',
        'Sports Equipment',
        'Musical Instruments',
        'Books & Novels',
        'Other'
    ];

    const subcategories: Record<string, string[]> = {
        'Clothing & Accessories': ['Tops', 'Bottoms', 'Outerwear', 'Footwear', 'Accessories', 'Uniforms'],
        'Electronics': ['Laptops', 'Phones', 'Consoles', 'Accessories', 'Other'],
        'Books & Novels': ['Fiction', 'Non-Fiction', 'Comics', 'Magazines', 'Other']
    };

    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'Other'];

    const conditions = ['Brand New', 'Like New', 'Good', 'Fair', 'For Parts'];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset subcategory when category changes
            ...(name === 'category' ? { subcategory: '' } : {})
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + images.length > 5) {
            alert('Maximum 5 images allowed');
            return;
        }

        setImages(prev => [...prev, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        // 1. Validation
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.price.trim()) newErrors.price = 'Price is required';
        if (!formData.condition) newErrors.condition = 'Condition is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (images.length === 0) newErrors.images = 'At least one image is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            // 2. Check Authentication
            // Make sure this matches the key you used when saving the token during Login
            const token = localStorage.getItem('sb-access-token') || localStorage.getItem('access_token');

            if (!token) {
                alert("You must be logged in to list an item.");
                navigate('/login');
                return;
            }

            // 3. Upload Images to Supabase Storage
            const uploadedImageUrls: string[] = [];

            for (const file of images) {
                // Generate unique filename to avoid collisions
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                // Upload
                const { error: uploadError } = await supabase.storage
                    .from('item-images') // Make sure this bucket exists in Supabase
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                // Get Public URL
                const { data: urlData } = supabase.storage
                    .from('item-images')
                    .getPublicUrl(fileName);

                uploadedImageUrls.push(urlData.publicUrl);
            }

            // 4. Prepare Payload for Python Backend
            const backendPayload = {
                title: formData.title,
                category: formData.category,
                subcategory: formData.subcategory || null,
                price: parseFloat(formData.price),
                condition: formData.condition,
                description: formData.description,
                notes: formData.notes || null,
                size: formData.size || null,
                images: uploadedImageUrls // Send the Array of URLs
            };

            // 5. Send to Python Backend
            const response = await fetch('http://localhost:5000/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // This triggers your Python auth check
                },
                body: JSON.stringify(backendPayload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to list item");
            }

            // 6. Success
            alert('Item listed successfully!');
            navigate('/dashboard');

        } catch (error: any) {
            console.error("Error listing item:", error);
            alert(error.message || "Something went wrong while listing the item.");
        } finally {
            setIsLoading(false);
        }
    };

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
            <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-lg border-b border-blue-500/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/dashboard" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                                Acad Swap
                            </span>
                        </Link>

                        <Link
                            to="/dashboard"
                            className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back to Dashboard</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-12 text-center">
                        <h1 className="text-5xl font-bold mb-4">
                            List Your <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Item</span>
                        </h1>
                        <p className="text-gray-400 text-lg">Turn your unused stuff into cash 💰</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Item Title */}
                        <div className="group">
                            <label htmlFor="title" className="block text-base font-semibold text-white mb-3">
                                What are you selling? <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={`w-full px-6 py-4 text-lg bg-slate-900/50 backdrop-blur-xl border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-500 ${errors.title ? 'border-red-500' : 'border-slate-700 hover:border-slate-600'
                                    }`}
                                placeholder="e.g., Calculus Textbook 10th Edition"
                            />
                            {errors.title && <p className="text-red-400 text-sm mt-2 flex items-center gap-1">⚠️ {errors.title}</p>}
                        </div>

                        {/* Category & Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Category */}
                            <div>
                                <label htmlFor="category" className="block text-base font-semibold text-white mb-3">
                                    Category <span className="text-red-400">*</span>
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className={`w-full px-6 py-4 text-lg bg-slate-900/50 backdrop-blur-xl border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white ${errors.category ? 'border-red-500' : 'border-slate-700 hover:border-slate-600'
                                        }`}
                                >
                                    <option value="" className="bg-slate-800">Choose a category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
                                    ))}
                                </select>
                                {errors.category && <p className="text-red-400 text-sm mt-2 flex items-center gap-1">⚠️ {errors.category}</p>}
                            </div>

                            {/* Price */}
                            <div>
                                <label htmlFor="price" className="block text-base font-semibold text-white mb-3">
                                    Price <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-gray-400">₱</span>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className={`w-full pl-14 pr-6 py-4 text-lg bg-slate-900/50 backdrop-blur-xl border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-500 ${errors.price ? 'border-red-500' : 'border-slate-700 hover:border-slate-600'
                                            }`}
                                        placeholder="0.00"
                                        step="0.01"
                                    />
                                </div>
                                {errors.price && <p className="text-red-400 text-sm mt-2 flex items-center gap-1">⚠️ {errors.price}</p>}
                            </div>
                        </div>

                        {/* Subcategory - Only show if category has subcategories */}
                        {formData.category && subcategories[formData.category] && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="subcategory" className="block text-base font-semibold text-white mb-3">
                                        Subcategory <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                                    </label>
                                    <select
                                        id="subcategory"
                                        name="subcategory"
                                        value={formData.subcategory}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 text-lg bg-slate-900/50 backdrop-blur-xl border-2 border-slate-700 hover:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white"
                                    >
                                        <option value="" className="bg-slate-800">Choose subcategory</option>
                                        {subcategories[formData.category].map(subcat => (
                                            <option key={subcat} value={subcat} className="bg-slate-800">{subcat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Size - Only show for Clothing & Accessories */}
                                {formData.category === 'Clothing & Accessories' && (
                                    <div>
                                        <label htmlFor="size" className="block text-base font-semibold text-white mb-3">
                                            Size <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                                        </label>
                                        <select
                                            id="size"
                                            name="size"
                                            value={formData.size}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 text-lg bg-slate-900/50 backdrop-blur-xl border-2 border-slate-700 hover:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white"
                                        >
                                            <option value="" className="bg-slate-800">Select size</option>
                                            {sizes.map(size => (
                                                <option key={size} value={size} className="bg-slate-800">{size}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Condition */}
                        <div>
                            <label htmlFor="condition" className="block text-base font-semibold text-white mb-3">
                                Condition <span className="text-red-400">*</span>
                            </label>
                            <select
                                id="condition"
                                name="condition"
                                value={formData.condition}
                                onChange={handleChange}
                                className={`w-full px-6 py-4 text-lg bg-slate-900/50 backdrop-blur-xl border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white ${errors.condition ? 'border-red-500' : 'border-slate-700 hover:border-slate-600'
                                    }`}
                            >
                                <option value="" className="bg-slate-800">How's the condition?</option>
                                {conditions.map(cond => (
                                    <option key={cond} value={cond} className="bg-slate-800">{cond}</option>
                                ))}
                            </select>
                            {errors.condition && <p className="text-red-400 text-sm mt-2 flex items-center gap-1">⚠️ {errors.condition}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-base font-semibold text-white mb-3">
                                Description <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={5}
                                className={`w-full px-6 py-4 text-lg bg-slate-900/50 backdrop-blur-xl border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-500 resize-none ${errors.description ? 'border-red-500' : 'border-slate-700 hover:border-slate-600'
                                    }`}
                                placeholder="Tell buyers about your item... What's included? Any defects? Why are you selling?"
                            />
                            {errors.description && <p className="text-red-400 text-sm mt-2 flex items-center gap-1">⚠️ {errors.description}</p>}
                        </div>

                        {/* Additional Notes */}
                        <div>
                            <label htmlFor="notes" className="block text-base font-semibold text-white mb-3">
                                Additional Notes <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-6 py-4 text-lg bg-slate-900/50 backdrop-blur-xl border-2 border-slate-700 hover:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-white placeholder-gray-500 resize-none"
                                placeholder="Meetup location? Negotiable? Delivery options?"
                            />
                            <p className="text-sm text-gray-500 mt-2">💡 Tip: Mention your preferred meetup spot or if you're open to negotiation</p>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-base font-semibold text-white mb-3">
                                Photos <span className="text-red-400">*</span> <span className="text-gray-500 text-sm font-normal">(Up to 5)</span>
                            </label>
                            <p className="text-sm text-gray-400 mb-4">📸 Good photos = faster sales! Show all angles</p>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover rounded-xl border-2 border-slate-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}

                                {images.length < 5 && (
                                    <label className="aspect-square border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-800/50 transition-all group">
                                        <Upload className="w-10 h-10 text-gray-400 group-hover:text-blue-400 transition-colors mb-2" />
                                        <span className="text-sm text-gray-400 group-hover:text-blue-400 transition-colors font-medium">Add Photo</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                            {errors.images && <p className="text-red-400 text-sm mt-3 flex items-center gap-1">⚠️ {errors.images}</p>}
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                disabled={isLoading}
                                className="flex-1 px-8 py-4 text-lg bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all font-semibold disabled:opacity-50 border-2 border-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex-1 px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl transition-all font-semibold 
                                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-[1.02]'}`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                        Uploading...
                                    </span>
                                ) : '🚀 List My Item'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ListNewItemPage;