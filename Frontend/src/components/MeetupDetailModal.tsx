import { useState } from 'react';
import { X, Calendar, Clock, MapPin, User, Mail, CheckCircle, XCircle, Edit, MessageCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface MeetupDetailModalProps {
    meetup: any;
    user: any;
    onClose: () => void;
    onUpdate: () => void;
}

const MeetupDetailModal = ({ meetup, user, onClose, onUpdate }: MeetupDetailModalProps) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');

    const isSeller = meetup.seller_id === user.id;
    const isBuyer = meetup.buyer_id === user.id;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleAccept = async () => {
        if (!confirm('Accept this meetup?')) return;

        setIsProcessing(true);
        try {
            const token = localStorage.getItem('sb-access-token') || localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:5000/api/meetup/${meetup.id}/accept`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (result.success) {
                alert('Meetup accepted!');
                onUpdate();
                onClose();
            } else {
                alert(result.message || 'Failed to accept meetup');
            }
        } catch (error) {
            console.error('Error accepting meetup:', error);
            alert('Failed to accept meetup');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDecline = async () => {
        setShowCancelModal(true);
    };

    const handleComplete = async () => {
        if (!confirm('Mark this meetup as completed? This will give both parties reputation points.')) return;

        setIsProcessing(true);
        try {
            const token = localStorage.getItem('sb-access-token') || localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:5000/api/meetup/${meetup.id}/complete`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (result.success) {
                alert('Meetup marked as completed! Reputation points awarded.');
                onUpdate();
                onClose();
            } else {
                alert(result.message || 'Failed to complete meetup');
            }
        } catch (error) {
            console.error('Error completing meetup:', error);
            alert('Failed to complete meetup');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = async () => {
        if (!cancellationReason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }

        setIsProcessing(true);
        try {
            const token = localStorage.getItem('sb-access-token') || localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:5000/api/meetup/${meetup.id}/cancel`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reason: cancellationReason })
            });

            const result = await response.json();
            if (result.success) {
                alert('Meetup cancelled');
                onUpdate();
                onClose();
            } else {
                alert(result.message || 'Failed to cancel meetup');
            }
        } catch (error) {
            console.error('Error cancelling meetup:', error);
            alert('Failed to cancel meetup');
        } finally {
            setIsProcessing(false);
            setShowCancelModal(false);
        }
    };

    const handleContact = () => {
        const otherPerson = isSeller
            ? `${meetup.buyer_first_name} ${meetup.buyer_last_name} (${meetup.buyer_email})`
            : `${meetup.seller_first_name} ${meetup.seller_last_name} (${meetup.seller_email})`;
        alert(`Contact feature coming soon!\n\nFor now, you can reach out to:\n${otherPerson}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400';
            case 'confirmed':
                return 'bg-blue-500/20 border-blue-500/40 text-blue-400';
            case 'completed':
                return 'bg-green-500/20 border-green-500/40 text-green-400';
            case 'cancelled_by_seller':
            case 'cancelled_by_buyer':
                return 'bg-red-500/20 border-red-500/40 text-red-400';
            default:
                return 'bg-gray-500/20 border-gray-500/40 text-gray-400';
        }
    };

    return (
        <>
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
                            <h2 className="text-2xl font-bold">Meetup Details</h2>
                            <span className={`inline-block mt-2 px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(meetup.status)}`}>
                                {meetup.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column - Item & People Info */}
                            <div className="space-y-6">
                                {/* Item */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Item</h3>
                                    <div className="p-4 bg-slate-800/50 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            {meetup.item_images && meetup.item_images.length > 0 ? (
                                                <img src={meetup.item_images[0]} alt={meetup.item_title} className="w-20 h-20 object-cover rounded-lg" />
                                            ) : (
                                                <div className="w-20 h-20 bg-slate-700 rounded-lg" />
                                            )}
                                            <div>
                                                <h4 className="font-bold text-lg">{meetup.item_title}</h4>
                                                <p className="text-2xl font-bold text-emerald-400">₱{meetup.item_price}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Seller Info */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Seller</h3>
                                    <div className="p-4 bg-slate-800/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-lg font-bold">
                                                {meetup.seller_first_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{meetup.seller_first_name} {meetup.seller_last_name}</p>
                                                <p className="text-sm text-gray-400">{meetup.seller_email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Buyer Info */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Buyer</h3>
                                    <div className="p-4 bg-slate-800/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg font-bold">
                                                {meetup.buyer_first_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{meetup.buyer_first_name} {meetup.buyer_last_name}</p>
                                                <p className="text-sm text-gray-400">{meetup.buyer_email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Meetup Details */}
                            <div className="space-y-6">
                                {/* Date & Time */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 mb-3">When</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                                            <Calendar className="w-5 h-5 text-blue-400" />
                                            <span>{formatDate(meetup.scheduled_date)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                                            <Clock className="w-5 h-5 text-emerald-400" />
                                            <span>{formatTime(meetup.scheduled_time)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Where</h3>
                                    <div className="p-3 bg-slate-800/50 rounded-lg mb-3">
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-pink-400" />
                                            <span>{meetup.location_name}</span>
                                        </div>
                                    </div>
                                    <div className="rounded-xl overflow-hidden border-2 border-slate-700">
                                        <MapContainer
                                            center={[meetup.location_lat, meetup.location_lng]}
                                            zoom={15}
                                            style={{ height: '200px', width: '100%' }}
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; OpenStreetMap'
                                            />
                                            <Marker position={[meetup.location_lat, meetup.location_lng]}>
                                                <Popup>{meetup.location_name}</Popup>
                                            </Marker>
                                        </MapContainer>
                                    </div>
                                </div>

                                {/* Notes */}
                                {meetup.notes && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 mb-3">Notes</h3>
                                        <div className="p-4 bg-slate-800/50 rounded-xl">
                                            <p className="text-gray-300">{meetup.notes}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Cancellation Reason */}
                                {meetup.cancellation_reason && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 mb-3">Cancellation Reason</h3>
                                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                            <p className="text-red-400">{meetup.cancellation_reason}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer - Action Buttons */}
                    <div className="flex gap-4 px-8 py-6 border-t border-slate-700">
                        {/* Contact Button - Always available */}
                        <button
                            onClick={handleContact}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition-colors flex items-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Contact {isSeller ? 'Buyer' : 'Seller'}
                        </button>

                        {/* Buyer Actions */}
                        {isBuyer && meetup.status === 'pending' && (
                            <>
                                <button
                                    onClick={handleDecline}
                                    disabled={isProcessing}
                                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-5 h-5" />
                                    Decline
                                </button>
                                <button
                                    onClick={handleAccept}
                                    disabled={isProcessing}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Accept
                                </button>
                            </>
                        )}

                        {isBuyer && meetup.status === 'confirmed' && (
                            <>
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    disabled={isProcessing}
                                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-5 h-5" />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleComplete}
                                    disabled={isProcessing}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Mark Complete
                                </button>
                            </>
                        )}

                        {/* Seller Actions */}
                        {isSeller && (meetup.status === 'pending' || meetup.status === 'confirmed') && (
                            <button
                                onClick={() => setShowCancelModal(true)}
                                disabled={isProcessing}
                                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-5 h-5" />
                                Cancel Meetup
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80">
                    <div className="w-full max-w-md bg-slate-900 rounded-2xl border-2 border-red-500/30 p-6">
                        <h3 className="text-xl font-bold mb-4">Cancel Meetup</h3>
                        <p className="text-gray-400 mb-4">Please provide a reason for cancellation:</p>
                        <select
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl mb-4 text-white"
                        >
                            <option value="">Select a reason...</option>
                            <option value="Schedule conflict">Schedule conflict</option>
                            <option value="Item no longer available">Item no longer available</option>
                            <option value="Found better deal">Found better deal</option>
                            <option value="Changed mind">Changed mind</option>
                            <option value="Safety concerns">Safety concerns</option>
                            <option value="Other">Other</option>
                        </select>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isProcessing || !cancellationReason}
                                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold disabled:opacity-50"
                            >
                                {isProcessing ? 'Cancelling...' : 'Confirm Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MeetupDetailModal;
