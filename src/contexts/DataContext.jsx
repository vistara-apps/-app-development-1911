import React, { createContext, useContext, useState, useEffect } from 'react';
import { blockchainApi } from '../services/blockchainApi.js';

const DataContext = createContext();

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export function DataProvider({ children }) {
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prices, setPrices] = useState({});

  // Load wallets from localStorage on mount
  useEffect(() => {
    const savedWallets = localStorage.getItem('walletwatch_wallets');
    if (savedWallets) {
      try {
        const parsedWallets = JSON.parse(savedWallets);
        setWallets(parsedWallets);
        // Start loading real data for saved wallets
        parsedWallets.forEach(wallet => {
          refreshWalletData(wallet.id, false);
        });
      } catch (error) {
        console.error('Error loading saved wallets:', error);
        // Start with empty state for first-time users
        setWallets([]);
        setTransactions([]);
      }
    } else {
      // Start with empty state for first-time users - no demo data
      setWallets([]);
      setTransactions([]);
    }
  }, []);

  // Save wallets to localStorage whenever wallets change
  useEffect(() => {
    if (wallets.length > 0) {
      localStorage.setItem('walletwatch_wallets', JSON.stringify(wallets));
    }
  }, [wallets]);

  // Load demo data for demonstration
  const loadDemoData = () => {
    const demoWallets = [
      {
        id: '1',
        address: '0x742dB2C47Fd32Ee3fC91cEA8B321F1bF8dD3ff4e',
        label: 'Demo Trading Wallet',
        tokenBalances: [
          { token: 'ETH', balance: '2.45', value: 4410.75 },
          { token: 'USDC', balance: '5000.00', value: 5000.00 }
        ],
        isDemo: true
      },
      {
        id: '2',
        address: '0x1234567890123456789012345678901234567890',
        label: 'Demo DeFi Wallet',
        tokenBalances: [
          { token: 'ETH', balance: '1.23', value: 2214.30 },
          { token: 'LINK', balance: '100.00', value: 1500.00 }
        ],
        isDemo: true
      }
    ];

    const demoTransactions = [
      {
        id: '1',
        walletId: '1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'outgoing',
        from: '0x742dB2C47Fd32Ee3fC91cEA8B321F1bF8dD3ff4e',
        to: '0x1234567890123456789012345678901234567890',
        value: '0.5',
        token: 'ETH',
        hash: '0xdemo1'
      },
      {
        id: '2',
        walletId: '1',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        type: 'incoming',
        from: '0xUniswap',
        to: '0x742dB2C47Fd32Ee3fC91cEA8B321F1bF8dD3ff4e',
        value: '1000.00',
        token: 'USDC',
        hash: '0xdemo2'
      }
    ];

    setWallets(demoWallets);
    setTransactions(demoTransactions);
  };

  const addWallet = async (address, label) => {
    const newWallet = {
      id: Date.now().toString(),
      address,
      label,
      tokenBalances: [],
      isDemo: false,
      lastUpdated: null
    };
    
    setWallets(prev => [...prev, newWallet]);
    
    // Immediately fetch real data for the new wallet
    await refreshWalletData(newWallet.id, true);
    
    return newWallet;
  };

  const updateWalletLabel = (walletId, newLabel) => {
    setWallets(prev => prev.map(wallet => 
      wallet.id === walletId ? { ...wallet, label: newLabel } : wallet
    ));
  };

  const removeWallet = (walletId) => {
    setWallets(prev => prev.filter(wallet => wallet.id !== walletId));
  };

  const refreshWalletData = async (walletId, showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      const wallet = wallets.find(w => w.id === walletId);
      if (!wallet || wallet.isDemo) {
        if (showLoading) setLoading(false);
        return;
      }

      // Fetch real blockchain data
      const walletData = await blockchainApi.getWalletData(wallet.address);
      
      // Get token prices
      const tokenSymbols = ['ETH', ...walletData.tokenBalances.map(t => t.token)];
      const tokenPrices = await blockchainApi.getTokenPrices(tokenSymbols);
      setPrices(prev => ({ ...prev, ...tokenPrices }));

      // Update wallet with real data
      setWallets(prev => prev.map(w => {
        if (w.id === walletId) {
          const ethBalance = {
            token: 'ETH',
            balance: walletData.ethBalance.balance,
            value: parseFloat(walletData.ethBalance.balance) * (tokenPrices.ETH || 0)
          };

          const tokenBalances = walletData.tokenBalances.map(token => ({
            token: token.token,
            balance: token.balance,
            value: parseFloat(token.balance) * (tokenPrices[token.token] || 0),
            contractAddress: token.contractAddress,
            name: token.name
          }));

          return {
            ...w,
            tokenBalances: [ethBalance, ...tokenBalances],
            lastUpdated: new Date(),
            error: null
          };
        }
        return w;
      }));

      // Update transactions
      const walletTransactions = walletData.recentTransactions.map(tx => ({
        ...tx,
        walletId: walletId
      }));

      setTransactions(prev => {
        // Remove old transactions for this wallet and add new ones
        const filtered = prev.filter(tx => tx.walletId !== walletId);
        return [...walletTransactions, ...filtered]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 100); // Keep only last 100 transactions
      });

    } catch (error) {
      console.error('Error refreshing wallet data:', error);
      setError(error.message);
      
      // Mark wallet as having an error
      setWallets(prev => prev.map(w => 
        w.id === walletId ? { ...w, error: error.message } : w
      ));
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const refreshAllWallets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const realWallets = wallets.filter(w => !w.isDemo);
      await Promise.all(
        realWallets.map(wallet => refreshWalletData(wallet.id, false))
      );
    } catch (error) {
      console.error('Error refreshing all wallets:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getWalletTransactions = (walletId, limit = 10) => {
    return transactions
      .filter(tx => tx.walletId === walletId)
      .slice(0, limit);
  };

  const getTotalPortfolioValue = () => {
    return wallets.reduce((total, wallet) => {
      return total + (wallet.tokenBalances?.reduce((sum, token) => sum + (token.value || 0), 0) || 0);
    }, 0);
  };

  const clearDemoData = () => {
    setWallets(prev => prev.filter(w => !w.isDemo));
    setTransactions(prev => prev.filter(tx => {
      const wallet = wallets.find(w => w.id === tx.walletId);
      return wallet && !wallet.isDemo;
    }));
  };

  const value = {
    wallets,
    transactions,
    loading,
    error,
    prices,
    addWallet,
    updateWalletLabel,
    removeWallet,
    refreshWalletData,
    refreshAllWallets,
    getWalletTransactions,
    getTotalPortfolioValue,
    clearDemoData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
