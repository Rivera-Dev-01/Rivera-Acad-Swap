import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Eye, EyeOff, Gift } from 'lucide-react';

const RegisterPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [referralCode, setReferralCode] = useState<string | null>(null);
    const [referralValid, setReferralValid] = useState<boolean | null>(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        currentYear: '',
        blockSection: '',
        course: '',
        phoneNumber: '',
        schoolEmail: '',
        password: '',
        confirmPassword: ''
    });

    // Check for referral code in URL
    useEffect(() => {
        const refCode = searchParams.get('ref');
        if (refCode) {
            setReferralCode(refCode);
            // Validate referral code
            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/referral/validate/${refCode}`)
                .then(res => res.json())
                .then(data => {
                    setReferralValid(data.valid);
                })
                .catch(err => {
                    console.error('Error validating referral code:', err);
                    setReferralValid(false);
                });
        }
    }, [searchParams]);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'password') {
            setPasswordStrength({
                hasMinLength: value.length >= 8,
                hasUpperCase: /[A-Z]/.test(value),
                hasLowerCase: /[a-z]/.test(value),
                hasNumber: /[0-9]/.test(value),
                hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value)
            });
        }
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.(edu|edu\.ph)$/i;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string) => {
        const phoneRegex = /^(\+63|0)?9\d{9}$/;
        return phoneRegex.test(phone.replace(/\s|-/g, ''));
    };

    const validatePasswordStrength = (password: string) => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters';
        }
        if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/[a-z]/.test(password)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/[0-9]/.test(password)) {
            return 'Password must contain at least one number';
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return 'Password must contain at least one special character';
        }
        return null;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.currentYear) newErrors.currentYear = 'Current year is required';
        if (!formData.blockSection.trim()) newErrors.blockSection = 'Block section is required';
        if (!formData.course.trim()) newErrors.course = 'Course is required';
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!validatePhone(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Invalid phone number format';
        }
        if (!formData.schoolEmail.trim()) {
            newErrors.schoolEmail = 'School email is required';
        } else if (!validateEmail(formData.schoolEmail)) {
            newErrors.schoolEmail = 'Please use a valid university email';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else {
            const passwordError = validatePasswordStrength(formData.password);
            if (passwordError) {
                newErrors.password = passwordError;
            }
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        handleRegistration();
    };

    const handleRegistration = async () => {
        try {
            const requestBody: any = {
                schoolEmail: formData.schoolEmail,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                currentYear: formData.currentYear,
                blockSection: formData.blockSection,
                course: formData.course,
                phoneNumber: formData.phoneNumber
            };

            // Add referral code if valid
            if (referralCode && referralValid) {
                requestBody.referralCode = referralCode;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (data.success) {
                const message = referralCode && referralValid
                    ? 'Registration successful! You earned +10 reputation from the referral. Your friend earned +15 reputation. You can now login.'
                    : 'Registration successful! You can now login with your credentials.';
                alert(message);
            } else {
                alert('Registration failed: ' + data.message);
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
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

                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-lg border-b border-blue-500/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                                Acad Swap
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="relative flex items-center justify-center min-h-screen px-4 py-24">
                <div className="w-full max-w-2xl">
                    <div className="p-8 bg-slate-900/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold mb-2">
                                Student <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Registration</span>
                            </h1>
                            <p className="text-gray-400">Create your account with your university email</p>

                            {referralCode && (
                                <div className={`mt-4 p-3 rounded-lg border ${referralValid === true
                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                    : referralValid === false
                                        ? 'bg-red-500/10 border-red-500/30'
                                        : 'bg-blue-500/10 border-blue-500/30'
                                    }`}>
                                    <div className="flex items-center justify-center space-x-2">
                                        <Gift className={`w-5 h-5 ${referralValid === true
                                            ? 'text-emerald-400'
                                            : referralValid === false
                                                ? 'text-red-400'
                                                : 'text-blue-400'
                                            }`} />
                                        <span className={`text-sm font-medium ${referralValid === true
                                            ? 'text-emerald-400'
                                            : referralValid === false
                                                ? 'text-red-400'
                                                : 'text-blue-400'
                                            }`}>
                                            {referralValid === true
                                                ? `Valid referral code! You'll get +10 reputation bonus`
                                                : referralValid === false
                                                    ? 'Invalid referral code'
                                                    : 'Validating referral code...'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                                        First Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-gray-500 ${errors.firstName ? 'border-red-500' : 'border-blue-500/30'}`}
                                        placeholder="Juan"
                                    />
                                    {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                                        Last Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-gray-500 ${errors.lastName ? 'border-red-500' : 'border-blue-500/30'}`}
                                        placeholder="Dela Cruz"
                                    />
                                    {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="currentYear" className="block text-sm font-medium text-gray-300 mb-2">
                                        Current Year <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        id="currentYear"
                                        name="currentYear"
                                        value={formData.currentYear}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white ${errors.currentYear ? 'border-red-500' : 'border-blue-500/30'}`}
                                    >
                                        <option value="" className="bg-slate-800">Select Year</option>
                                        <option value="1" className="bg-slate-800">1st Year</option>
                                        <option value="2" className="bg-slate-800">2nd Year</option>
                                        <option value="3" className="bg-slate-800">3rd Year</option>
                                        <option value="4" className="bg-slate-800">4th Year</option>
                                        <option value="5" className="bg-slate-800">5th Year</option>
                                    </select>
                                    {errors.currentYear && <p className="text-red-400 text-sm mt-1">{errors.currentYear}</p>}
                                </div>

                                <div>
                                    <label htmlFor="blockSection" className="block text-sm font-medium text-gray-300 mb-2">
                                        Block Section <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="blockSection"
                                        name="blockSection"
                                        value={formData.blockSection}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-gray-500 ${errors.blockSection ? 'border-red-500' : 'border-blue-500/30'}`}
                                        placeholder="A"
                                    />
                                    {errors.blockSection && <p className="text-red-400 text-sm mt-1">{errors.blockSection}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="course" className="block text-sm font-medium text-gray-300 mb-2">
                                    Course <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="course"
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-gray-500 ${errors.course ? 'border-red-500' : 'border-blue-500/30'}`}
                                    placeholder="BS Computer Science"
                                />
                                {errors.course && <p className="text-red-400 text-sm mt-1">{errors.course}</p>}
                            </div>

                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-2">
                                    Phone Number <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-gray-500 ${errors.phoneNumber ? 'border-red-500' : 'border-blue-500/30'}`}
                                    placeholder="09123456789"
                                />
                                {errors.phoneNumber && <p className="text-red-400 text-sm mt-1">{errors.phoneNumber}</p>}
                            </div>

                            <div>
                                <label htmlFor="schoolEmail" className="block text-sm font-medium text-gray-300 mb-2">
                                    School Email <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="schoolEmail"
                                    name="schoolEmail"
                                    value={formData.schoolEmail}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-gray-500 ${errors.schoolEmail ? 'border-red-500' : 'border-blue-500/30'}`}
                                    placeholder="student@university.edu"
                                />
                                {errors.schoolEmail && <p className="text-red-400 text-sm mt-1">{errors.schoolEmail}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                        Password <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 pr-12 bg-slate-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-gray-500 ${errors.password ? 'border-red-500' : 'border-blue-500/30'}`}
                                            placeholder="Create strong password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                                        >
                                            {/* UPDATED: Matches Login Page Logic */}
                                            {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}

                                    {formData.password && (
                                        <div className="mt-3 space-y-2">
                                            <p className="text-xs text-gray-400 font-medium">Password must contain:</p>
                                            <div className="space-y-1">
                                                <div className={`flex items-center space-x-2 text-xs ${passwordStrength.hasMinLength ? 'text-emerald-400' : 'text-gray-500'}`}>
                                                    <span>{passwordStrength.hasMinLength ? '✓' : '○'}</span>
                                                    <span>At least 8 characters</span>
                                                </div>
                                                <div className={`flex items-center space-x-2 text-xs ${passwordStrength.hasUpperCase ? 'text-emerald-400' : 'text-gray-500'}`}>
                                                    <span>{passwordStrength.hasUpperCase ? '✓' : '○'}</span>
                                                    <span>One uppercase letter (A-Z)</span>
                                                </div>
                                                <div className={`flex items-center space-x-2 text-xs ${passwordStrength.hasLowerCase ? 'text-emerald-400' : 'text-gray-500'}`}>
                                                    <span>{passwordStrength.hasLowerCase ? '✓' : '○'}</span>
                                                    <span>One lowercase letter (a-z)</span>
                                                </div>
                                                <div className={`flex items-center space-x-2 text-xs ${passwordStrength.hasNumber ? 'text-emerald-400' : 'text-gray-500'}`}>
                                                    <span>{passwordStrength.hasNumber ? '✓' : '○'}</span>
                                                    <span>One number (0-9)</span>
                                                </div>
                                                <div className={`flex items-center space-x-2 text-xs ${passwordStrength.hasSpecialChar ? 'text-emerald-400' : 'text-gray-500'}`}>
                                                    <span>{passwordStrength.hasSpecialChar ? '✓' : '○'}</span>
                                                    <span>One special character (!@#$%...)</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                        Confirm Password <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 pr-12 bg-slate-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-gray-500 ${errors.confirmPassword ? 'border-red-500' : 'border-blue-500/30'}`}
                                            placeholder="Re-enter password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                                        >
                                            {/* UPDATED: Matches Login Page Logic */}
                                            {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                className="group w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-105 flex items-center justify-center space-x-2"
                            >
                                <span>Register</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-gray-400">
                                Already have an account?{' '}
                                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                    Login here
                                </Link>
                            </p>
                        </div>
                    </div>

                    <p className="text-center text-gray-500 text-sm mt-6">
                        🎓 Built by students, for students
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;