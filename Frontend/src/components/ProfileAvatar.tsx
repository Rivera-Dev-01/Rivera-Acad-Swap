import { useNavigate } from 'react-router-dom';

interface ProfileAvatarProps {
    userId: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    size?: 'sm' | 'md' | 'lg';
    showName?: boolean;
    className?: string;
}

const ProfileAvatar = ({
    userId,
    firstName,
    lastName,
    profilePicture,
    size = 'md',
    showName = false,
    className = ''
}: ProfileAvatarProps) => {
    const navigate = useNavigate();

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    };

    const handleClick = () => {
        navigate(`/user/${userId}`);
    };

    return (
        <div
            className={`flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity ${className}`}
            onClick={handleClick}
        >
            {/* Avatar */}
            <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 p-0.5 flex-shrink-0`}>
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                    {profilePicture ? (
                        <img src={profilePicture} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
                    ) : (
                        <span className={`${textSizes[size]} font-bold`}>
                            {firstName[0]}{lastName[0]}
                        </span>
                    )}
                </div>
            </div>

            {/* Name */}
            {showName && (
                <span className={`${textSizes[size]} font-medium hover:text-blue-400 transition-colors`}>
                    {firstName} {lastName}
                </span>
            )}
        </div>
    );
};

export default ProfileAvatar;
