import React, { useState } from 'react';
import { Edit2, Trash2, RefreshCw, ExternalLink } from 'lucide-react';
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
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="input flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSaveLabel()}
              />
              <button
                onClick={handleSaveLabel}
                className="btn-primary text-sm"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">{wallet.label}</h3>
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-sm text-gray-600 font-mono">
              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
            </p>
            <a
              href={`https://etherscan.io/address/${wallet.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-2xl font-bold text-gray-900">
          ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-sm text-gray-600">Total Value</div>
      </div>

      <div className="space-y-2">
        {wallet.tokenBalances?.map((token, index) => (
          <div key={index} className="flex justify-between items-center">
            <div>
              <span className="font-medium">{token.balance} {token.token}</span>
            </div>
            <div className="text-sm text-gray-600">
              ${token.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WalletCard;