import { useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
}

const Toast = ({ message, type = 'success', onClose, duration = 4000 }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle className="w-6 h-6 text-emerald-400" />,
        error: <AlertCircle className="w-6 h-6 text-red-400" />,
        info: <Info className="w-6 h-6 text-blue-400" />
    };

    const colors = {
        success: 'from-emerald-600/20 to-emerald-600/10 border-emerald-500/30',
        error: 'from-red-600/20 to-red-600/10 border-red-500/30',
        info: 'from-blue-600/20 to-blue-600/10 border-blue-500/30'
    };

    return (
        <div className="fixed top-20 right-4 z-[100] animate-slide-in-right">
            <div className={`glass-card bg-gradient-to-r ${colors[type]} border rounded-xl shadow-2xl p-4 pr-12 max-w-md`}>
                <div className="flex items-start space-x-3">
                    {icons[type]}
                    <p className="text-white text-sm flex-1">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
