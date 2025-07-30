import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import SubscriptionGate from '../components/SubscriptionGate';
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
    <SubscriptionGate>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-6">Add New Wallet</h2>
              <form onSubmit={handleAddWallet} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Wallet Address</label>
                  <input
                    type="text"
                    value={newWalletAddress}
                    onChange={(e) => setNewWalletAddress(e.target.value)}
                    placeholder="0x..."
                    className="input w-full font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Label</label>
                  <input
                    type="text"
                    value={newWalletLabel}
                    onChange={(e) => setNewWalletLabel(e.target.value)}
                    placeholder="e.g., Main Wallet, Trading Account"
                    className="input w-full"
                    required
                  />
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
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Wallets Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'No wallets match your search.' : 'Start by adding your first wallet to track.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddWallet(true)}
                className="btn-primary"
              >
                Add Your First Wallet
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} />
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
    </SubscriptionGate>
  );
}

export default WalletList;