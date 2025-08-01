import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Calendar, Filter, Download, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import SubscriptionGate from '../components/SubscriptionGate';
import TransactionAnalytics from '../components/TransactionAnalytics';
import TransactionTimeline from '../components/TransactionTimeline';
import TransactionFilters from '../components/TransactionFilters';

function Analytics() {
  const { user } = useAuth();
  const { wallets, transactions, getWalletTransactions } = useData();
  const [selectedWallet, setSelectedWallet] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [transactionType, setTransactionType] = useState('all');
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Filter transactions based on selected criteria
  useEffect(() => {
    let filtered = transactions;

    // Filter by wallet
    if (selectedWallet !== 'all') {
      filtered = filtered.filter(tx => tx.walletId === selectedWallet);
    }

    // Filter by transaction type
    if (transactionType !== 'all') {
      filtered = filtered.filter(tx => tx.type === transactionType);
    }

    // Filter by date range
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (dateRange) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffDate.setDate(now.getDate() - 30);
    }

    filtered = filtered.filter(tx => new Date(tx.timestamp) >= cutoffDate);

    setFilteredTransactions(filtered);
  }, [transactions, selectedWallet, dateRange, transactionType]);

  // Calculate analytics data
  const analyticsData = {
    totalTransactions: filteredTransactions.length,
    incomingTransactions: filteredTransactions.filter(tx => tx.type === 'incoming').length,
    outgoingTransactions: filteredTransactions.filter(tx => tx.type === 'outgoing').length,
    totalVolume: filteredTransactions.reduce((sum, tx) => sum + parseFloat(tx.value || 0), 0),
    uniqueTokens: [...new Set(filteredTransactions.map(tx => tx.token))].length,
    averageTransactionValue: filteredTransactions.length > 0 
      ? filteredTransactions.reduce((sum, tx) => sum + parseFloat(tx.value || 0), 0) / filteredTransactions.length 
      : 0
  };

  const handleExportData = () => {
    const csvContent = [
      ['Date', 'Type', 'Token', 'Amount', 'From', 'To', 'Hash'].join(','),
      ...filteredTransactions.map(tx => [
        new Date(tx.timestamp).toISOString(),
        tx.type,
        tx.token,
        tx.value,
        tx.from,
        tx.to,
        tx.hash
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-transactions-${dateRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <SubscriptionGate>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <BarChart3 className="h-8 w-8 mr-3 text-primary-600" />
                Transaction Analytics
              </h1>
              <p className="text-gray-600">Analyze your wallet activity and transaction patterns</p>
            </div>
            <button
              onClick={handleExportData}
              className="btn-secondary flex items-center space-x-2"
              disabled={filteredTransactions.length === 0}
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <TransactionFilters
            selectedWallet={selectedWallet}
            setSelectedWallet={setSelectedWallet}
            dateRange={dateRange}
            setDateRange={setDateRange}
            transactionType={transactionType}
            setTransactionType={setTransactionType}
            wallets={wallets}
          />
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card hover-lift slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalTransactions}</p>
            </div>
          </div>

          <div className="stat-card hover-lift slide-up" style={{animationDelay: '100ms'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <ArrowDownLeft className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Incoming</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.incomingTransactions}</p>
            </div>
          </div>

          <div className="stat-card hover-lift slide-up" style={{animationDelay: '200ms'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Outgoing</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.outgoingTransactions}</p>
            </div>
          </div>

          <div className="stat-card hover-lift slide-up" style={{animationDelay: '300ms'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalVolume.toFixed(4)}</p>
            </div>
          </div>
        </div>

        {/* Charts and Analysis */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Transaction Analytics Chart */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Transaction Volume Over Time</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Last {dateRange}</span>
                </div>
              </div>
              <TransactionAnalytics transactions={filteredTransactions} />
            </div>
          </div>

          {/* Summary Stats */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Unique Tokens</span>
                  <span className="text-lg font-bold text-gray-900">{analyticsData.uniqueTokens}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Avg Transaction</span>
                  <span className="text-lg font-bold text-gray-900">
                    {analyticsData.averageTransactionValue.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Success Rate</span>
                  <span className="text-lg font-bold text-green-600">
                    {filteredTransactions.length > 0 
                      ? ((filteredTransactions.filter(tx => tx.status !== 'failed').length / filteredTransactions.length) * 100).toFixed(1)
                      : 0
                    }%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Timeline */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Transaction Timeline</h2>
            <div className="text-sm text-gray-500">
              {filteredTransactions.length} transactions
            </div>
          </div>
          <TransactionTimeline transactions={filteredTransactions} />
        </div>
      </div>
    </SubscriptionGate>
  );
}

export default Analytics;
