import React from 'react';
import { Filter, Calendar, Wallet, ArrowUpDown } from 'lucide-react';

function TransactionFilters({
  selectedWallet,
  setSelectedWallet,
  dateRange,
  setDateRange,
  transactionType,
  setTransactionType,
  wallets
}) {
  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  const transactionTypeOptions = [
    { value: 'all', label: 'All transactions' },
    { value: 'incoming', label: 'Incoming only' },
    { value: 'outgoing', label: 'Outgoing only' }
  ];

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Wallet Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Wallet className="h-4 w-4 inline mr-1" />
            Wallet
          </label>
          <select
            value={selectedWallet}
            onChange={(e) => setSelectedWallet(e.target.value)}
            className="input w-full"
          >
            <option value="all">All Wallets</option>
            {wallets.map(wallet => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.label} ({wallet.address.slice(0, 8)}...)
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Time Period
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input w-full"
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Transaction Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ArrowUpDown className="h-4 w-4 inline mr-1" />
            Transaction Type
          </label>
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            className="input w-full"
          >
            {transactionTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default TransactionFilters;
