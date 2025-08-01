import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { blockchainApi } from '../services/blockchainApi.js';
import { POLLING_INTERVALS } from '../services/apiConfig.js';

const NotificationContext = createContext();

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoringWallets, setMonitoringWallets] = useState(new Set());
  const [lastKnownBalances, setLastKnownBalances] = useState(new Map());
  const [lastKnownTransactions, setLastKnownTransactions] = useState(new Map());

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback((title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
  }, []);

  // Add in-app notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep only last 50

    // Show browser notification if enabled
    if (notification.showBrowser) {
      showBrowserNotification(notification.title, {
        body: notification.message,
        tag: notification.type
      });
    }

    return newNotification;
  }, [showBrowserNotification]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Add alert rule
  const addAlert = useCallback((alert) => {
    const newAlert = {
      id: Date.now() + Math.random(),
      enabled: true,
      createdAt: new Date(),
      ...alert
    };

    setAlerts(prev => [...prev, newAlert]);
    return newAlert;
  }, []);

  // Remove alert rule
  const removeAlert = useCallback((alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  // Toggle alert enabled state
  const toggleAlert = useCallback((alertId) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, enabled: !alert.enabled } : alert
      )
    );
  }, []);

  // Check for balance changes
  const checkBalanceChanges = useCallback(async (walletAddress) => {
    try {
      const walletData = await blockchainApi.getWalletData(walletAddress);
      const currentBalances = new Map();
      
      // Store ETH balance
      currentBalances.set('ETH', parseFloat(walletData.ethBalance.balance));
      
      // Store token balances
      walletData.tokenBalances.forEach(token => {
        currentBalances.set(token.token, parseFloat(token.balance));
      });

      const lastBalances = lastKnownBalances.get(walletAddress);
      
      if (lastBalances) {
        // Check for significant balance changes
        for (const [token, currentBalance] of currentBalances.entries()) {
          const lastBalance = lastBalances.get(token) || 0;
          const change = currentBalance - lastBalance;
          const percentChange = lastBalance > 0 ? (change / lastBalance) * 100 : 0;

          // Trigger alert for significant changes (>5% or >0.01 ETH)
          if (Math.abs(change) > 0.01 || Math.abs(percentChange) > 5) {
            const isIncrease = change > 0;
            addNotification({
              type: 'balance_change',
              title: `${token} Balance ${isIncrease ? 'Increased' : 'Decreased'}`,
              message: `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}: ${token} ${isIncrease ? '+' : ''}${change.toFixed(6)} (${percentChange.toFixed(2)}%)`,
              walletAddress,
              token,
              change,
              percentChange,
              showBrowser: true,
              severity: Math.abs(percentChange) > 20 ? 'high' : 'medium'
            });
          }
        }
      }

      // Update last known balances
      setLastKnownBalances(prev => new Map(prev.set(walletAddress, currentBalances)));
    } catch (error) {
      console.error('Error checking balance changes:', error);
    }
  }, [lastKnownBalances, addNotification]);

  // Check for new transactions
  const checkNewTransactions = useCallback(async (walletAddress) => {
    try {
      const walletData = await blockchainApi.getWalletData(walletAddress);
      const currentTransactions = walletData.recentTransactions;
      const lastTransactions = lastKnownTransactions.get(walletAddress) || [];
      
      // Find new transactions
      const newTransactions = currentTransactions.filter(tx => 
        !lastTransactions.some(lastTx => lastTx.hash === tx.hash)
      );

      // Process new transactions
      for (const tx of newTransactions) {
        const isOutgoing = tx.type === 'outgoing';
        const value = parseFloat(tx.value);
        
        // Only notify for significant transactions (>0.001 ETH or any token transfer)
        if (value > 0.001 || tx.token !== 'ETH') {
          addNotification({
            type: isOutgoing ? 'transfer_out' : 'transfer_in',
            title: `${tx.token} ${isOutgoing ? 'Sent' : 'Received'}`,
            message: `${value.toFixed(6)} ${tx.token} ${isOutgoing ? 'sent to' : 'received from'} ${(isOutgoing ? tx.to : tx.from).slice(0, 8)}...`,
            walletAddress,
            transaction: tx,
            showBrowser: true,
            severity: value > 1 ? 'high' : 'medium'
          });
        }
      }

      // Update last known transactions
      setLastKnownTransactions(prev => new Map(prev.set(walletAddress, currentTransactions)));
    } catch (error) {
      console.error('Error checking new transactions:', error);
    }
  }, [lastKnownTransactions, addNotification]);

  // Monitor wallet for changes
  const monitorWallet = useCallback(async (walletAddress) => {
    if (!monitoringWallets.has(walletAddress)) {
      setMonitoringWallets(prev => new Set(prev.add(walletAddress)));
      
      // Initial data fetch to establish baseline
      try {
        const walletData = await blockchainApi.getWalletData(walletAddress);
        const initialBalances = new Map();
        
        initialBalances.set('ETH', parseFloat(walletData.ethBalance.balance));
        walletData.tokenBalances.forEach(token => {
          initialBalances.set(token.token, parseFloat(token.balance));
        });
        
        setLastKnownBalances(prev => new Map(prev.set(walletAddress, initialBalances)));
        setLastKnownTransactions(prev => new Map(prev.set(walletAddress, walletData.recentTransactions)));
      } catch (error) {
        console.error('Error initializing wallet monitoring:', error);
      }
    }
  }, [monitoringWallets]);

  // Stop monitoring wallet
  const stopMonitoringWallet = useCallback((walletAddress) => {
    setMonitoringWallets(prev => {
      const newSet = new Set(prev);
      newSet.delete(walletAddress);
      return newSet;
    });
    
    setLastKnownBalances(prev => {
      const newMap = new Map(prev);
      newMap.delete(walletAddress);
      return newMap;
    });
    
    setLastKnownTransactions(prev => {
      const newMap = new Map(prev);
      newMap.delete(walletAddress);
      return newMap;
    });
  }, []);

  // Start monitoring all wallets
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);

  // Stop monitoring all wallets
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Monitoring loop
  useEffect(() => {
    if (!isMonitoring || monitoringWallets.size === 0) return;

    const monitoringInterval = setInterval(async () => {
      for (const walletAddress of monitoringWallets) {
        try {
          await Promise.all([
            checkBalanceChanges(walletAddress),
            checkNewTransactions(walletAddress)
          ]);
        } catch (error) {
          console.error(`Error monitoring wallet ${walletAddress}:`, error);
        }
      }
    }, POLLING_INTERVALS.BALANCE_CHECK);

    return () => clearInterval(monitoringInterval);
  }, [isMonitoring, monitoringWallets, checkBalanceChanges, checkNewTransactions]);

  // Initialize notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  const value = {
    // Notifications
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    addNotification,
    markAsRead,
    clearAllNotifications,
    
    // Alerts
    alerts,
    addAlert,
    removeAlert,
    toggleAlert,
    
    // Monitoring
    isMonitoring,
    monitoringWallets: Array.from(monitoringWallets),
    startMonitoring,
    stopMonitoring,
    monitorWallet,
    stopMonitoringWallet,
    
    // Permissions
    requestNotificationPermission
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
