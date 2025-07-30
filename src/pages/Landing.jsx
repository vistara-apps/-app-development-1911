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
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Monitor Your Crypto Assets with Ease
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Track wallets, receive alerts, and get deep insights into your crypto portfolio. 
                Never miss important transactions again.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setIsSignUp(true)}
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Started Free
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Auth Form */}
            <div className="bg-white rounded-xl p-8 text-gray-900">
              <h3 className="text-2xl font-bold mb-6 text-center">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input w-full"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </button>
              </form>
              <p className="text-center mt-4 text-sm">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-600 hover:underline"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Track Crypto
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed for serious crypto investors and traders
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="text-blue-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Take Control of Your Crypto?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of investors who trust WalletWatch to monitor their digital assets.
          </p>
          <button 
            onClick={() => setIsSignUp(true)}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
          >
            Start Your Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}

export default Landing;