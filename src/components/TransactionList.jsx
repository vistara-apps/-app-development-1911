import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function TransactionList({ transactions, limit = null }) {
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'transfer':
        return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
      case 'sale':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      default:
        return <ArrowUpRight className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'transfer':
        return 'text-blue-600';
      case 'sale':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (displayTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transactions found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayTransactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getTransactionIcon(transaction.type)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`font-medium capitalize ${getTransactionColor(transaction.type)}`}>
                  {transaction.type}
                </span>
                <span className="text-sm text-gray-600">
                  {transaction.amount}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {formatDistanceToNow(transaction.timestamp, { addSuffix: true })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-sm font-mono text-gray-600">
                To: {transaction.to.slice(0, 6)}...{transaction.to.slice(-4)}
              </div>
            </div>
            <a
              href={`https://etherscan.io/tx/${transaction.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TransactionList;