import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Eye, Bell, TrendingUp, Shield, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Landing() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (error) {
      alert('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Eye className="h-6 w-6" />,
      title: 'Wallet Monitoring',
      description: 'Track multiple wallets and their token balances in real-time'
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: 'Smart Alerts',
      description: 'Get instant notifications for transfers, sales, and important events'
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Portfolio Analytics',
      description: 'Advanced insights and historical analysis of your crypto holdings'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure & Private',
      description: 'Your data is encrypted and stored securely with privacy in mind'
    },
    {
      icon: <Wallet className="h-6 w-6" />,
      title: 'Multi-Chain Support',
      description: 'Support for Ethereum, Polygon, and other major blockchains'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Real-Time Updates',
      description: 'Lightning-fast updates and synchronization with blockchain data'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="crypto-gradient text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="fade-in">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                <Zap className="h-4 w-4 mr-2" />
                Real-time crypto monitoring
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Monitor Your Crypto Assets with 
                <span className="block text-gradient bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Precision
                </span>
              </h1>
              <p className="text-xl mb-8 text-blue-100 leading-relaxed">
                Track wallets, receive intelligent alerts, and get deep insights into your crypto portfolio. 
                Never miss important transactions again with our advanced monitoring system.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setIsSignUp(true)}
                  className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-medium hover:shadow-strong hover:-translate-y-1"
                >
                  Get Started Free
                </button>
                <button className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-200 backdrop-blur-sm">
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Auth Form */}
            <div className="glass-effect rounded-2xl p-8 text-gray-900 shadow-strong slide-up">
              <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input w-full"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input w-full"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Loading...
                    </div>
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </button>
              </form>
              <p className="text-center mt-6 text-sm text-gray-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary-600 hover:text-primary-700 font-medium hover:underline transition-colors"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4 mr-2" />
              Trusted by 10,000+ crypto investors
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Track Crypto
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed for serious crypto investors and traders who demand precision and reliability
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card-interactive text-center group slide-up" style={{animationDelay: `${index * 100}ms`}}>
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">$2.5B+</div>
              <div className="text-gray-600">Assets Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">50K+</div>
              <div className="text-gray-600">Wallets Monitored</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-purple-600/10"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to Take Control of Your 
            <span className="text-gradient bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent block">
              Crypto Portfolio?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of investors who trust WalletWatch to monitor their digital assets with precision and reliability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setIsSignUp(true)}
              className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-purple-700 transition-all duration-200 text-lg shadow-strong hover:shadow-medium hover:-translate-y-1"
            >
              Start Your Free Trial
            </button>
            <button className="border-2 border-gray-600 text-gray-300 px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 hover:border-gray-500 transition-all duration-200 text-lg">
              Schedule Demo
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}

export default Landing;
