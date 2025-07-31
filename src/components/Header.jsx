import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-soft border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              WalletWatch
            </span>
          </Link>

          <nav className="flex items-center space-x-1">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 font-medium"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/wallets" 
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 font-medium"
                >
                  <Wallet className="h-4 w-4" />
                  <span>Wallets</span>
                </Link>
                <div className="border-l border-gray-200 ml-4 pl-4">
                  <div className="scale-90">
                    <ConnectButton />
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 font-medium ml-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Features
                </Link>
                <Link 
                  to="/" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Pricing
                </Link>
                <ConnectButton />
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
