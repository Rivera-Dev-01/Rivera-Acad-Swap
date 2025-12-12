import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    // 1. New State for the checkbox
    const [rememberMe, setRememberMe] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);

    // 2. Effect: Check for saved email when page loads
    useEffect(() => {
        const savedEmail = localStorage.getItem('remembered_email');
        if (savedEmail) {
            setFormData(prev => ({ ...prev, email: savedEmail }));
            setRememberMe(true); // Check the box visually
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.(edu|edu\.ph)$/i;
        return emailRegex.test(email);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please use a valid university email';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Send login request to backend
        handleLogin();
    };

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            console.log('=== LOGIN RESPONSE DEBUG ===');
            console.log('Full response:', data);

            if (data.success) {
                console.log('Login successful, processing data...');

                // Store session tokens
                if (data.session) {
                    localStorage.setItem('access_token', data.session.access_token);
                    localStorage.setItem('refresh_token', data.session.refresh_token);
                }

                // Store user data
                if (data.user) {
                    const userString = JSON.stringify(data.user);
                    localStorage.setItem('user', userString);
                } else {
                    alert('Login successful but user data is missing. Please try again.');
                    return;
                }

                // 3. Handle "Remember Me" Logic
                if (rememberMe) {
                    localStorage.setItem('remembered_email', formData.email);
                } else {
                    localStorage.removeItem('remembered_email');
                }

                console.log('✓ Navigating to dashboard...');
                navigate('/dashboard', { replace: true });
            } else {
                console.error('Login failed:', data.message);

                if (data.message && data.message.includes('user data is missing')) {
                    alert('Your account is missing profile information. Please contact support.');
                } else {
                    alert('Login failed: ' + data.message);
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login. Please try again.');
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
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                                Acad Swap
                            </span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Login Form */}
            <div className="relative flex items-center justify-center min-h-screen px-4 pt-16">
                <div className="w-full max-w-md">
                    <div className="p-8 bg-slate-900/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold mb-2">
                                Welcome <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Back</span>
                            </h1>
                            <p className="text-gray-400">Login to your campus marketplace account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                    University Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-gray-500 ${errors.email ? 'border-red-500' : 'border-blue-500/30'
                                        }`}
                                    placeholder="student@university.edu"
                                />
                                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 pr-12 bg-slate-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-gray-500 ${errors.password ? 'border-red-500' : 'border-blue-500/30'
                                            }`}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                            </div>

                            {/* 4. Updated Checkbox UI */}
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center text-gray-400 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="mr-2 rounded border-gray-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    Remember me
                                </label>
                                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                                    Forgot password?
                                </a>
                            </div>

                            <button
                                type="submit"
                                className="group w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-105 flex items-center justify-center space-x-2"
                            >
                                <span>Login</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-400">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                    Register here
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

export default LoginPage;