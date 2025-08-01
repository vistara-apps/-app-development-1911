import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Wallet, TrendingUp, Activity, Bell, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useNotifications } from '../contexts/NotificationContext';
import SubscriptionGate from '../components/SubscriptionGate';
import PortfolioChart from '../components/PortfolioChart';
import TransactionList from '../components/TransactionList';

function Dashboard() {
  const { user } = useAuth();
  const { wallets, transactions, loading, refreshAllWallets, getTotalPortfolioValue } = useData();
  const { 
    isMonitoring, 
    startMonitoring, 
    monitorWallet, 
    notifications, 
    unreadCount 
  } = useNotifications();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Start monitoring wallets when dashboard loads
  useEffect(() => {
    if (wallets.length > 0 && !isMonitoring) {
      // Add all wallets to monitoring
      wallets.forEach(wallet => {
        if (!wallet.isDemo) {
          monitorWallet(wallet.address);
        }
      });
      startMonitoring();
    }
  }, [wallets, isMonitoring, monitorWallet, startMonitoring]);

  const totalPortfolioValue = wallets.reduce((total, wallet) => {
    return total + (wallet.tokenBalances?.reduce((sum, token) => sum + token.value, 0) || 0);
  }, 0);

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  const stats = [
    {
      title: 'Total Portfolio Value',
      value: `$${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-crypto-success',
      bgColor: 'bg-green-50',
      change: '+12.5%',
      changeColor: 'text-crypto-success'
    },
    {
      title: 'Tracked Wallets',
      value: wallets.length.toString(),
      icon: <Wallet className="h-6 w-6" />,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      change: `+${wallets.length > 0 ? '1' : '0'}`,
      changeColor: 'text-primary-600'
    },
    {
      title: 'Recent Transactions',
      value: transactions.length.toString(),
      icon: <Activity className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+24',
      changeColor: 'text-purple-600'
    },
    {
      title: 'Active Alerts',
      value: unreadCount.toString(),
      icon: <Bell className="h-6 w-6" />,
      color: 'text-crypto-warning',
      bgColor: 'bg-orange-50',
      change: unreadCount > 0 ? 'New' : 'None',
      changeColor: unreadCount > 0 ? 'text-crypto-warning' : 'text-gray-500'
    }
  ];

  return (
    <SubscriptionGate>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-gray-600">Here's what's happening with your crypto portfolio today</p>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <div className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                isMonitoring 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-gray-50 text-gray-700'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}></div>
                {isMonitoring ? 'Live Monitoring' : 'Monitoring Off'}
              </div>
              <button 
                onClick={refreshAllWallets}
                disabled={loading}
                className="btn-ghost"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card hover-lift slide-up" style={{animationDelay: `${index * 100}ms`}}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className={`text-sm font-medium px-2 py-1 rounded-full ${stat.changeColor} bg-opacity-10`} style={{backgroundColor: `${stat.changeColor.replace('text-', 'bg-').replace('-600', '-100').replace('-success', '-green-100').replace('-warning', '-orange-100')}`}}>
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Portfolio Chart */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Portfolio Performance</h2>
                <select className="input text-sm">
                  <option>Last 30 days</option>
                  <option>Last 7 days</option>
                  <option>Last 90 days</option>
                </select>
              </div>
              <PortfolioChart />
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  View All
                </button>
              </div>
              <TransactionList transactions={recentTransactions} limit={5} />
            </div>
          </div>
        </div>

        {/* Top Holdings */}
        <div className="mt-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Holdings</h2>
            <div className="space-y-4">
              {wallets.slice(0, 3).map((wallet) => (
                <div key={wallet.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{wallet.label}</h3>
                      <p className="text-sm text-gray-600 font-mono">
                        {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${(wallet.tokenBalances?.reduce((sum, token) => sum + token.value, 0) || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600">+2.4%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SubscriptionGate>
  );
}

export default Dashboard;
