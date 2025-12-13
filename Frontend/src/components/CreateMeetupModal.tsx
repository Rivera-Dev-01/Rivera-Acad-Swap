import { useState, useEffect } from 'react';
import { X, Search, MapPin, Calendar, Clock, Package } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CreateMeetupModalProps {
    user: any;
    onClose: () => void;
    onSuccess: () => void;
}

interface Item {
    id: string;
    title: string;
    price: number;
    images: string[];
}

interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}

function LocationMarker({ position, onLocationSelect }: any) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng);
        },
    });

    return position ? <Marker position={position} /> : null;
}

const CreateMeetupModal = ({ user, onClose, onSuccess }: CreateMeetupModalProps) => {
    const [step, setStep] = useState(1);
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [buyerSearch, setBuyerSearch] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedBuyer, setSelectedBuyer] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        scheduled_date: '',
        scheduled_time: '',
        location_name: '',
        location_lat: 14.5995,
        location_lng: 120.9842,
        notes: ''
    });
    const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [locationSearch, setLocationSearch] = useState('');
    const [locationSearchResults, setLocationSearchResults] = useState<any[]>([]);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);

    useEffect(() => {
        fetchUserItems();
    }, []);

    const fetchUserItems = async () => {
        try {
            const token = localStorage.getItem('sb-access-token') || localStorage.getItem('access_token');
            const response = await fetch('http://localhost:5000/items/user/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            console.log('Fetched items:', result);
            if (result.success && result.data) {
                setItems(result.data.filter((item: any) => item.status === 'active'));
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const searchBuyers = async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const token = localStorage.getItem('sb-access-token') || localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:5000/api/meetup/search-users?q=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success && result.data) {
                setSearchResults(result.data.filter((u: User) => u.id !== user.id));
            }
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (buyerSearch) {
                searchBuyers(buyerSearch);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [buyerSearch]);

    const handleLocationSelect = (latlng: any, name?: string) => {
        setMarkerPosition([latlng.lat, latlng.lng]);
        setFormData({
            ...formData,
            location_lat: latlng.lat,
            location_lng: latlng.lng,
            location_name: name || formData.location_name
        });
    };

    const searchLocation = async (query: string) => {
        if (query.length < 3) {
            setLocationSearchResults([]);
            return;
        }

        setIsSearchingLocation(true);
        try {
            // Using Nominatim (OpenStreetMap's free geocoding service)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
            );
            const results = await response.json();
            setLocationSearchResults(results);
        } catch (error) {
            console.error('Error searching location:', error);
        } finally {
            setIsSearchingLocation(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (locationSearch) {
                searchLocation(locationSearch);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [locationSearch]);

    const handleSubmit = async () => {
        if (!selectedItem || !selectedBuyer) {
            alert('Please select an item and buyer');
            return;
        }

        if (!formData.title || !formData.scheduled_date || !formData.scheduled_time || !formData.location_name) {
            alert('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('sb-access-token') || localStorage.getItem('access_token');
            const response = await fetch('http://localhost:5000/api/meetup/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    item_id: selectedItem.id,
                    buyer_id: selectedBuyer.id,
                    ...formData
                })
            });

            const result = await response.json();
            if (result.success) {
                alert('Meetup scheduled successfully!');
                onSuccess();
            } else {
                alert(result.message || 'Failed to schedule meetup');
            }
        } catch (error) {
            console.error('Error creating meetup:', error);
            alert('Failed to schedule meetup');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl border-2 border-slate-700 shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-700">
                    <div>
                        <h2 className="text-2xl font-bold">Schedule Meetup</h2>
                        <p className="text-sm text-gray-400">Step {step} of 3</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-8">
                    {/* Step 1: Select Item */}
                    {step === 1 && (
                        <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Package className="w-6 h-6 text-blue-400" />
                                Select Item
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {items.length === 0 ? (
                                    <p className="text-gray-400 col-span-2">No active items found. List an item first!</p>
                                ) : (
                                    items.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => setSelectedItem(item)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedItem?.id === item.id
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : 'border-slate-700 hover:border-slate-600'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                {item.images && item.images.length > 0 ? (
                                                    <img src={item.images[0]} alt={item.title} className="w-16 h-16 object-cover rounded-lg" />
                                                ) : (
                                                    <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center">
                                                        <Package className="w-8 h-8 text-gray-600" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-semibold">{item.title}</h4>
                                                    <p className="text-emerald-400 font-bold">₱{item.price}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Select Buyer */}
                    {step === 2 && (
                        <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Search className="w-6 h-6 text-emerald-400" />
                                Select Buyer
                            </h3>
                            <div className="relative mb-4">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={buyerSearch}
                                    onChange={(e) => setBuyerSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                                />
                            </div>

                            {selectedBuyer && (
                                <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                                    <p className="text-sm text-gray-400 mb-1">Selected Buyer:</p>
                                    <p className="font-semibold">{selectedBuyer.first_name} {selectedBuyer.last_name}</p>
                                    <p className="text-sm text-gray-400">{selectedBuyer.email}</p>
                                </div>
                            )}

                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {searchResults.map(buyer => (
                                    <div
                                        key={buyer.id}
                                        onClick={() => setSelectedBuyer(buyer)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedBuyer?.id === buyer.id
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-slate-700 hover:border-slate-600'
                                            }`}
                                    >
                                        <p className="font-semibold">{buyer.first_name} {buyer.last_name}</p>
                                        <p className="text-sm text-gray-400">{buyer.email}</p>
                                    </div>
                                ))}
                                {buyerSearch && searchResults.length === 0 && (
                                    <p className="text-gray-400 text-center py-4">No users found</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Meetup Details */}
                    {step === 3 && (
                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Meetup Title <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Textbook Exchange at Library"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        <Calendar className="w-4 h-4 inline mr-2" />
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.scheduled_date}
                                        onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        <Clock className="w-4 h-4 inline mr-2" />
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.scheduled_time}
                                        onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    <MapPin className="w-4 h-4 inline mr-2" />
                                    Location Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Campus Library, Main Entrance"
                                    value={formData.location_name}
                                    onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Search Location or Click on Map
                                </label>

                                {/* Location Search */}
                                <div className="relative mb-3">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search for a place..."
                                        value={locationSearch}
                                        onChange={(e) => setLocationSearch(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                                    />
                                </div>

                                {/* Search Results */}
                                {locationSearchResults.length > 0 && (
                                    <div className="mb-3 max-h-40 overflow-y-auto space-y-2 bg-slate-800 rounded-xl p-2 border border-slate-700">
                                        {locationSearchResults.map((result, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => {
                                                    handleLocationSelect(
                                                        { lat: parseFloat(result.lat), lng: parseFloat(result.lon) },
                                                        result.display_name
                                                    );
                                                    setLocationSearch('');
                                                    setLocationSearchResults([]);
                                                }}
                                                className="w-full text-left p-3 hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                                                    <span className="text-sm text-gray-300">{result.display_name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {isSearchingLocation && (
                                    <div className="mb-3 text-center text-gray-400 text-sm">
                                        Searching...
                                    </div>
                                )}

                                <div className="rounded-xl overflow-hidden border-2 border-slate-700">
                                    <MapContainer
                                        center={markerPosition || [14.5995, 120.9842]}
                                        zoom={markerPosition ? 15 : 13}
                                        style={{ height: '300px', width: '100%' }}
                                        key={markerPosition ? `${markerPosition[0]}-${markerPosition[1]}` : 'default'}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        />
                                        <LocationMarker position={markerPosition} onLocationSelect={handleLocationSelect} />
                                    </MapContainer>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    💡 Tip: Search for a location or click directly on the map to set the meetup point
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Notes (Optional)</label>
                                <textarea
                                    placeholder="Any additional instructions or details..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white resize-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-4 px-8 py-6 border-t border-slate-700">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-colors"
                        >
                            Back
                        </button>
                    )}
                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={step === 1 && !selectedItem || step === 2 && !selectedBuyer}
                            className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Scheduling...' : 'Schedule Meetup'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateMeetupModal;
