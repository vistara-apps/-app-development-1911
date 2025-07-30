import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Mock data generation
  useEffect(() => {
    const mockWallets = [
      {
        id: '1',
        address: '0x742dB2C47Fd32Ee3fC91cEA8B321F1bF8dD3ff4e',
        label: 'Main Trading Wallet',
        tokenBalances: [
          { token: 'ETH', balance: '2.45', value: 4410.75 },
          { token: 'USDC', balance: '5000.00', value: 5000.00 }
        ]
      },
      {
        id: '2',
        address: '0x1234567890123456789012345678901234567890',
        label: 'DeFi Staking',
        tokenBalances: [
          { token: 'ETH', balance: '1.23', value: 2214.30 },
          { token: 'LINK', balance: '100.00', value: 1500.00 }
        ]
      }
    ];

    const mockTransactions = [
      {
        id: '1',
        walletId: '1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'transfer',
        from: '0x742dB2C47Fd32Ee3fC91cEA8B321F1bF8dD3ff4e',
        to: '0x1234567890123456789012345678901234567890',
        amount: '0.5 ETH',
        token: 'ETH'
      },
      {
        id: '2',
        walletId: '1',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        type: 'sale',
        from: '0x742dB2C47Fd32Ee3fC91cEA8B321F1bF8dD3ff4e',
        to: '0xUniswap',
        amount: '1000.00 USDC',
        token: 'USDC'
      }
    ];

    setWallets(mockWallets);
    setTransactions(mockTransactions);
  }, []);

  const addWallet = (address, label) => {
    const newWallet = {
      id: Date.now().toString(),
      address,
      label,
      tokenBalances: []
    };
    setWallets(prev => [...prev, newWallet]);
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

  const refreshWalletData = async (walletId) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const value = {
    wallets,
    transactions,
    loading,
    addWallet,
    updateWalletLabel,
    removeWallet,
    refreshWalletData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}