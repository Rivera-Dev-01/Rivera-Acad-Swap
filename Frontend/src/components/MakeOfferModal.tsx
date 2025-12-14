import { useState } from 'react';
import { X, DollarSign } from 'lucide-react';

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

interface MakeOfferModalProps {
    item: {
        id: string;
        title: string;
        price: number;
        seller_first_name: string;
        seller_last_name: string;
    };
    onClose: () => void;
    onSubmit: (offerAmount: number, message: string) => void;
}

const MakeOfferModal = ({ item, onClose, onSubmit }: MakeOfferModalProps) => {
    const [offerAmount, setOfferAmount] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        const amount = parseFloat(offerAmount);
        if (!amount || amount <= 0) {
            alert('Please enter a valid offer amount');
            return;
        }

        if (amount > item.price) {
            alert('Offer amount cannot exceed the listed price');
            return;
        }

        setSubmitting(true);
        await onSubmit(amount, message);
        setSubmitting(false);
    };

    const suggestedOffers = [
        Math.round(item.price * 0.7),
        Math.round(item.price * 0.8),
        Math.round(item.price * 0.9)
    ];

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md glass-card rounded-2xl shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-blue-500/20">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold flex items-center space-x-2">
                            <PesoIcon className="w-6 h-6 text-emerald-400" />
                            <span>Make an Offer</span>
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-gray-400 text-sm">
                        Offering on: <span className="text-white font-semibold">{item.title}</span>
                    </p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Listed Price */}
                    <div className="glass-card-gradient rounded-xl p-4">
                        <p className="text-sm text-gray-400 mb-1">Listed Price</p>
                        <p className="text-3xl font-bold text-emerald-400">₱{item.price.toLocaleString()}</p>
                    </div>

                    {/* Offer Amount */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Your Offer Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">₱</span>
                            <input
                                type="number"
                                value={offerAmount}
                                onChange={(e) => setOfferAmount(e.target.value)}
                                placeholder="0"
                                className="w-full pl-10 pr-4 py-3 glass-input rounded-xl text-lg font-semibold"
                            />
                        </div>
                    </div>

                    {/* Quick Offer Buttons */}
                    <div>
                        <p className="text-sm text-gray-400 mb-2">Quick offers:</p>
                        <div className="flex gap-2">
                            {suggestedOffers.map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => setOfferAmount(amount.toString())}
                                    className="flex-1 px-4 py-2 glass-card hover:bg-slate-800/50 rounded-lg text-sm font-semibold transition-all"
                                >
                                    ₱{amount.toLocaleString()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Message (Optional)</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Add a message to the seller..."
                            rows={3}
                            className="w-full px-4 py-3 glass-input rounded-xl resize-none"
                        />
                    </div>

                    {/* Seller Info */}
                    <div className="glass-card rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Sending offer to:</p>
                        <p className="font-semibold">{item.seller_first_name} {item.seller_last_name}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-blue-500/20 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 glass-card hover:bg-slate-800/50 rounded-xl font-semibold transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !offerAmount}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Sending...' : 'Send Offer'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MakeOfferModal;
