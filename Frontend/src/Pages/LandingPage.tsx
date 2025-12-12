import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Users, Shield, Zap, ArrowRight, Menu, X, Star, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950"></div>

        {/* Animated Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Floating Orbs with Animation */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

        {/* Moving Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 20}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-lg border-b border-blue-500/20' : ''}`}>
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

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a>
              <a href="#benefits" className="hover:text-blue-400 transition-colors">Benefits</a>
              <Link to="/login" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full hover:shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-105">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-950/95 backdrop-blur-lg border-t border-blue-500/20">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block hover:text-blue-400 transition-colors">Features</a>
              <a href="#how-it-works" className="block hover:text-blue-400 transition-colors">How It Works</a>
              <a href="#benefits" className="block hover:text-blue-400 transition-colors">Benefits</a>
              <Link to="/login" className="block w-full px-6 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full text-center">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-sm backdrop-blur-sm">
            🎓 Built by students, for students
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Your Campus
            <span className="block bg-gradient-to-r from-blue-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent animate-pulse">
              Marketplace
            </span>
            Reimagined
          </h1>

          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Buy, sell, and trade with fellow students in your university. Safe, simple, and built exclusively for the campus community.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/login" className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105 flex items-center space-x-2">
              <span>Start Selling Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-4 border-2 border-blue-500/50 rounded-full text-lg font-semibold hover:bg-blue-500/10 transition-all backdrop-blur-sm">
              Browse Products
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
            <div className="p-6 bg-slate-900/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl hover:border-blue-500/50 transition-all hover:scale-105">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">10K+</div>
              <div className="text-gray-400 text-sm mt-2">Active Students</div>
            </div>
            <div className="p-6 bg-slate-900/50 backdrop-blur-sm border border-emerald-500/20 rounded-2xl hover:border-emerald-500/50 transition-all hover:scale-105">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">50K+</div>
              <div className="text-gray-400 text-sm mt-2">Products Listed</div>
            </div>
            <div className="p-6 bg-slate-900/50 backdrop-blur-sm border border-teal-500/20 rounded-2xl hover:border-teal-500/50 transition-all hover:scale-105">
              <div className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">98%</div>
              <div className="text-gray-400 text-sm mt-2">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Why Choose <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Acad Swap</span>
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Built with cutting-edge technology to provide the best marketplace experience for university students
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group p-8 bg-slate-900/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl hover:border-blue-500/50 transition-all hover:transform hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Campus Verified</h3>
              <p className="text-gray-400">Only verified university students can join, ensuring a safe and trusted community</p>
            </div>

            <div className="group p-8 bg-slate-900/50 backdrop-blur-sm border border-emerald-500/20 rounded-2xl hover:border-emerald-500/50 transition-all hover:transform hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-emerald-500/50 transition-all">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-gray-400">List products in seconds and connect with buyers instantly through our modern platform</p>
            </div>

            <div className="group p-8 bg-slate-900/50 backdrop-blur-sm border border-teal-500/20 rounded-2xl hover:border-teal-500/50 transition-all hover:transform hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-teal-500/50 transition-all">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Campus Community</h3>
              <p className="text-gray-400">Connect with students from your own university and build lasting relationships</p>
            </div>

            <div className="group p-8 bg-slate-900/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl hover:border-blue-500/50 transition-all hover:transform hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Pricing</h3>
              <p className="text-gray-400">AI-powered price suggestions help you price items competitively and fairly</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Get Started in <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">3 Simple Steps</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg shadow-blue-500/50">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4">Sign Up</h3>
              <p className="text-gray-400">Create your account using your university email and get verified instantly</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg shadow-teal-500/50">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4">List or Browse</h3>
              <p className="text-gray-400">Post items to sell or explore products from fellow students in your campus</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg shadow-emerald-500/50">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4">Connect & Trade</h3>
              <p className="text-gray-400">Chat with buyers or sellers and arrange safe meetups on campus</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gradient-to-br from-blue-900/50 to-emerald-900/50 backdrop-blur-sm border border-blue-500/30 rounded-3xl">
            <Star className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Join Your Campus Marketplace?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of students already buying and selling on Acad Swap
            </p>
            <Link to="/login" className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105 flex items-center space-x-2 mx-auto">
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-blue-500/20 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold">Acad Swap</span>
              </div>
              <p className="text-gray-400 text-sm">Your trusted campus marketplace</p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-blue-500/20 text-center text-gray-400 text-sm">
            <p>© 2024 Acad Swap UnifiedMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}