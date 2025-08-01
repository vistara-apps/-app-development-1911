import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Search, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import WalletCard from '../components/WalletCard';

function WalletList() {
  const { user } = useAuth();
  const { wallets, addWallet } = useData();
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newWalletLabel, setNewWalletLabel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const filteredWallets = wallets.filter(wallet =>
    wallet.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddWallet = (e) => {
    e.preventDefault();
    if (newWalletAddress && newWalletLabel) {
      addWallet(newWalletAddress, newWalletLabel);
      setNewWalletAddress('');
      setNewWalletLabel('');
      setShowAddWallet(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wallets</h1>
            <p className="text-gray-600">Manage and monitor your crypto wallets</p>
          </div>
          <button
            onClick={() => setShowAddWallet(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Wallet</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search wallets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full md:w-96"
            />
          </div>
        </div>

        {/* Add Wallet Modal */}
        {showAddWallet && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-strong slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Wallet</h2>
                <button
                  onClick={() => setShowAddWallet(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleAddWallet} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Wallet Address</label>
                  <input
                    type="text"
                    value={newWalletAddress}
                    onChange={(e) => setNewWalletAddress(e.target.value)}
                    placeholder="0x1234567890abcdef..."
                    className="input w-full font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter a valid Ethereum wallet address</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Wallet Label</label>
                  <input
                    type="text"
                    value={newWalletLabel}
                    onChange={(e) => setNewWalletLabel(e.target.value)}
                    placeholder="e.g., Main Wallet, Trading Account, DeFi Portfolio"
                    className="input w-full"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Choose a memorable name for this wallet</p>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Add Wallet
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddWallet(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Wallets Grid */}
        {filteredWallets.length === 0 ? (
          <div className="text-center py-16 fade-in">
            <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              {searchTerm ? (
                <Search className="h-16 w-16 text-primary-400" />
              ) : (
                <Wallet className="h-16 w-16 text-primary-400" />
              )}
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              {searchTerm ? 'No Matching Wallets' : 'No Wallets Yet'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              {searchTerm 
                ? `No wallets match "${searchTerm}". Try adjusting your search terms.`
                : 'Start building your crypto portfolio by adding your first wallet to track. Monitor balances, transactions, and get real-time insights.'
              }
            </p>
            {!searchTerm && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowAddWallet(true)}
                  className="btn-primary text-lg px-8 py-4"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Wallet
                </button>
                <p className="text-sm text-gray-500">
                  Supports Ethereum and ERC-20 tokens
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWallets.map((wallet, index) => (
              <div key={wallet.id} className="slide-up" style={{animationDelay: `${index * 100}ms`}}>
                <WalletCard wallet={wallet} />
              </div>
            ))}
          </div>
        )}

        {/* Wallet Stats */}
        {wallets.length > 0 && (
          <div className="mt-12 card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{wallets.length}</div>
                <div className="text-sm text-gray-600">Total Wallets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${wallets.reduce((total, wallet) => 
                    total + (wallet.tokenBalances?.reduce((sum, token) => sum + token.value, 0) || 0), 0
                  ).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Combined Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {wallets.reduce((total, wallet) => total + (wallet.tokenBalances?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Tokens</div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

export default WalletList;
