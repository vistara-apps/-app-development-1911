import React, { useState } from 'react';
import { Edit2, Trash2, RefreshCw, ExternalLink, Wallet } from 'lucide-react';
import { useData } from '../contexts/DataContext';

function WalletCard({ wallet }) {
  const { updateWalletLabel, removeWallet, refreshWalletData, loading } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [newLabel, setNewLabel] = useState(wallet.label);

  const totalValue = wallet.tokenBalances?.reduce((sum, token) => sum + token.value, 0) || 0;

  const handleSaveLabel = () => {
    updateWalletLabel(wallet.id, newLabel);
    setIsEditing(false);
  };

  const handleRefresh = () => {
    refreshWalletData(wallet.id);
  };

  const handleRemove = () => {
    if (confirm('Are you sure you want to remove this wallet?')) {
      removeWallet(wallet.id);
    }
  };

  return (
    <div className="card-interactive group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="input flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSaveLabel()}
                autoFocus
              />
              <button
                onClick={handleSaveLabel}
                className="btn-primary text-sm px-3 py-1"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {wallet.label}
              </h3>
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-primary-600 transition-all duration-200"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="flex items-center space-x-3 mt-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </p>
            </div>
            <a
              href={`https://etherscan.io/address/${wallet.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 transition-colors"
              title="View on Etherscan"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg disabled:opacity-50 transition-all duration-200"
            title="Refresh wallet data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleRemove}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Remove wallet"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline space-x-2">
          <div className="text-3xl font-bold text-gray-900">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-sm font-medium text-crypto-success bg-green-50 px-2 py-1 rounded-full">
            +2.4%
          </div>
        </div>
        <div className="text-sm text-gray-600 mt-1">Total Portfolio Value</div>
      </div>

      <div className="space-y-3">
        {wallet.tokenBalances?.length > 0 ? (
          wallet.tokenBalances.map((token, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {token.token.slice(0, 2)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{token.balance} {token.token}</div>
                  <div className="text-xs text-gray-500">Token Balance</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  ${token.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-500">USD Value</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Wallet className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm">No tokens found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WalletCard;
