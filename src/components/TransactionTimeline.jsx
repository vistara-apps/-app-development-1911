import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function TransactionTimeline({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p>No transactions to display</p>
      </div>
    );
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'incoming':
        return <ArrowDownLeft className="h-5 w-5 text-green-600" />;
      case 'outgoing':
        return <ArrowUpRight className="h-5 w-5 text-red-600" />;
      default:
        return <ArrowUpRight className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'incoming':
        return 'border-l-green-500 bg-green-50';
      case 'outgoing':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const getEtherscanUrl = (hash) => {
    return `https://etherscan.io/tx/${hash}`;
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {transactions.map((tx, index) => (
        <div
          key={tx.id || tx.hash || index}
          className={`p-4 border-l-4 rounded-lg transition-colors hover:bg-gray-50 ${getTransactionColor(tx.type)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0 mt-1">
                {getTransactionIcon(tx.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`text-sm font-medium ${
                    tx.type === 'incoming' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {tx.type === 'incoming' ? 'Received' : 'Sent'}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {parseFloat(tx.value || 0).toFixed(6)} {tx.token}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">From:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                      {formatAddress(tx.from)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">To:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                      {formatAddress(tx.to)}
                    </span>
                  </div>
                </div>
                
                {tx.hash && (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Hash:</span>
                    <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {formatAddress(tx.hash)}
                    </span>
                    <a
                      href={getEtherscanUrl(tx.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 transition-colors"
                      title="View on Etherscan"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-shrink-0 text-right">
              <div className="text-xs text-gray-500 mb-1">
                {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
              </div>
              {tx.status && (
                <div className={`text-xs px-2 py-1 rounded-full ${
                  tx.status === 'success' 
                    ? 'bg-green-100 text-green-700' 
                    : tx.status === 'failed'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {tx.status}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {transactions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No transactions match the current filters</p>
        </div>
      )}
    </div>
  );
}

export default TransactionTimeline;
