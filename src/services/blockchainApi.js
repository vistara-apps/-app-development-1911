import axios from 'axios';
import { API_PROVIDERS, API_CONFIG, CACHE_CONFIG, COMMON_TOKENS } from './apiConfig.js';
import { apiCache, generateCacheKey, CACHE_KEYS } from '../utils/cache.js';

class BlockchainApiService {
  constructor() {
    this.currentProvider = API_PROVIDERS.SHAPE; // Use Shape as primary provider
    this.rateLimiters = new Map();
    this.initializeRateLimiters();
  }

  initializeRateLimiters() {
    Object.keys(API_PROVIDERS).forEach(provider => {
      const providerKey = API_PROVIDERS[provider];
      const config = API_CONFIG[providerKey];
      
      if (config && config.rateLimit) {
        this.rateLimiters.set(provider, {
          requests: [],
          limit: config.rateLimit
        });
      } else {
        // Fallback rate limit if config is missing
        this.rateLimiters.set(provider, {
          requests: [],
          limit: 5 // Default to 5 requests per second
        });
      }
    });
  }

  async checkRateLimit(provider) {
    const limiter = this.rateLimiters.get(provider);
    const now = Date.now();
    
    // Remove requests older than 1 second
    limiter.requests = limiter.requests.filter(time => now - time < 1000);
    
    if (limiter.requests.length >= limiter.limit) {
      // Wait until we can make another request
      const oldestRequest = Math.min(...limiter.requests);
      const waitTime = 1000 - (now - oldestRequest);
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    limiter.requests.push(now);
  }

  async makeRequest(url, provider = this.currentProvider) {
    try {
      await this.checkRateLimit(provider);
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'WalletWatch/1.0'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`API request failed for ${provider}:`, error.message);
      throw new Error(`Failed to fetch data from ${provider}: ${error.message}`);
    }
  }

  // Get ETH balance for a wallet
  async getWalletBalance(address) {
    const cacheKey = generateCacheKey(CACHE_KEYS.WALLET_BALANCE, address);
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const config = API_CONFIG[this.currentProvider];
      const url = `${config.baseUrl}${config.endpoints.balance}&address=${address}&tag=latest`;
      
      const data = await this.makeRequest(url);
      
      if (data.status === '1') {
        const balanceWei = data.result;
        const balanceEth = (parseInt(balanceWei) / Math.pow(10, 18)).toFixed(6);
        const result = {
          balance: balanceEth,
          balanceWei: balanceWei,
          symbol: 'ETH'
        };
        
        apiCache.set(cacheKey, result, CACHE_CONFIG.BALANCE_TTL);
        return result;
      } else {
        throw new Error(data.message || 'Failed to fetch balance');
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      // Return mock data as fallback
      return {
        balance: '0.000000',
        balanceWei: '0',
        symbol: 'ETH'
      };
    }
  }

  // Get token balances for a wallet
  async getTokenBalances(address, tokenAddresses = []) {
    const cacheKey = generateCacheKey(CACHE_KEYS.TOKEN_BALANCE, address, tokenAddresses.join(','));
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const balances = [];
      const config = API_CONFIG[this.currentProvider];

      // If no specific tokens provided, use common tokens
      const tokensToCheck = tokenAddresses.length > 0 ? tokenAddresses : Object.keys(COMMON_TOKENS);

      for (const tokenAddress of tokensToCheck) {
        try {
          const url = `${config.baseUrl}${config.endpoints.tokenBalance}&contractaddress=${tokenAddress}&address=${address}&tag=latest`;
          const data = await this.makeRequest(url);
          
          if (data.status === '1') {
            const tokenInfo = COMMON_TOKENS[tokenAddress] || await this.getTokenInfo(tokenAddress);
            const balanceRaw = data.result;
            const balance = (parseInt(balanceRaw) / Math.pow(10, tokenInfo.decimals || 18)).toFixed(6);
            
            if (parseFloat(balance) > 0) {
              balances.push({
                token: tokenInfo.symbol || 'UNKNOWN',
                balance: balance,
                balanceRaw: balanceRaw,
                contractAddress: tokenAddress,
                name: tokenInfo.name || 'Unknown Token',
                decimals: tokenInfo.decimals || 18
              });
            }
          }
        } catch (tokenError) {
          console.warn(`Failed to fetch balance for token ${tokenAddress}:`, tokenError.message);
        }
      }

      apiCache.set(cacheKey, balances, CACHE_CONFIG.BALANCE_TTL);
      return balances;
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return [];
    }
  }

  // Get token information
  async getTokenInfo(tokenAddress) {
    const cacheKey = generateCacheKey(CACHE_KEYS.TOKEN_INFO, tokenAddress);
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const config = API_CONFIG[this.currentProvider];
      const url = `${config.baseUrl}${config.endpoints.tokenInfo}&contractaddress=${tokenAddress}`;
      const data = await this.makeRequest(url);
      
      if (data.status === '1') {
        const result = data.result[0] || {};
        const tokenInfo = {
          symbol: result.symbol || 'UNKNOWN',
          name: result.tokenName || 'Unknown Token',
          decimals: parseInt(result.divisor) || 18
        };
        
        apiCache.set(cacheKey, tokenInfo, CACHE_CONFIG.TOKEN_INFO_TTL);
        return tokenInfo;
      }
    } catch (error) {
      console.warn('Error fetching token info:', error);
    }

    // Return default token info
    return {
      symbol: 'UNKNOWN',
      name: 'Unknown Token',
      decimals: 18
    };
  }

  // Get transaction history for a wallet
  async getTransactionHistory(address, page = 1, offset = 10) {
    const cacheKey = generateCacheKey(CACHE_KEYS.TRANSACTIONS, address, page, offset);
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const config = API_CONFIG[this.currentProvider];
      const startBlock = 0;
      const endBlock = 99999999;
      const sort = 'desc';
      
      const url = `${config.baseUrl}${config.endpoints.transactions}&address=${address}&startblock=${startBlock}&endblock=${endBlock}&page=${page}&offset=${offset}&sort=${sort}`;
      const data = await this.makeRequest(url);
      
      if (data.status === '1') {
        const transactions = data.result.map(tx => ({
          id: tx.hash,
          hash: tx.hash,
          timestamp: new Date(parseInt(tx.timeStamp) * 1000),
          from: tx.from,
          to: tx.to,
          value: (parseInt(tx.value) / Math.pow(10, 18)).toFixed(6),
          valueWei: tx.value,
          gasUsed: tx.gasUsed,
          gasPrice: tx.gasPrice,
          type: tx.from.toLowerCase() === address.toLowerCase() ? 'outgoing' : 'incoming',
          status: tx.txreceipt_status === '1' ? 'success' : 'failed',
          blockNumber: tx.blockNumber,
          token: 'ETH'
        }));
        
        apiCache.set(cacheKey, transactions, CACHE_CONFIG.TRANSACTION_TTL);
        return transactions;
      } else {
        throw new Error(data.message || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  // Get token transaction history
  async getTokenTransactionHistory(address, contractAddress = null, page = 1, offset = 10) {
    const cacheKey = generateCacheKey(CACHE_KEYS.TRANSACTIONS, 'token', address, contractAddress, page, offset);
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const config = API_CONFIG[this.currentProvider];
      let url = `${config.baseUrl}${config.endpoints.tokenTransactions}&address=${address}&page=${page}&offset=${offset}&sort=desc`;
      
      if (contractAddress) {
        url += `&contractaddress=${contractAddress}`;
      }
      
      const data = await this.makeRequest(url);
      
      if (data.status === '1') {
        const transactions = await Promise.all(data.result.map(async (tx) => {
          const tokenInfo = COMMON_TOKENS[tx.contractAddress] || await this.getTokenInfo(tx.contractAddress);
          const value = (parseInt(tx.value) / Math.pow(10, tokenInfo.decimals || 18)).toFixed(6);
          
          return {
            id: tx.hash,
            hash: tx.hash,
            timestamp: new Date(parseInt(tx.timeStamp) * 1000),
            from: tx.from,
            to: tx.to,
            value: value,
            valueRaw: tx.value,
            type: tx.from.toLowerCase() === address.toLowerCase() ? 'outgoing' : 'incoming',
            token: tokenInfo.symbol || 'UNKNOWN',
            tokenName: tokenInfo.name || 'Unknown Token',
            contractAddress: tx.contractAddress,
            blockNumber: tx.blockNumber
          };
        }));
        
        apiCache.set(cacheKey, transactions, CACHE_CONFIG.TRANSACTION_TTL);
        return transactions;
      } else {
        throw new Error(data.message || 'Failed to fetch token transactions');
      }
    } catch (error) {
      console.error('Error fetching token transaction history:', error);
      return [];
    }
  }

  // Get combined wallet data (balance + tokens + recent transactions)
  async getWalletData(address) {
    try {
      const [ethBalance, tokenBalances, recentTransactions, recentTokenTransactions] = await Promise.all([
        this.getWalletBalance(address),
        this.getTokenBalances(address),
        this.getTransactionHistory(address, 1, 5),
        this.getTokenTransactionHistory(address, null, 1, 5)
      ]);

      // Combine and sort transactions by timestamp
      const allTransactions = [...recentTransactions, ...recentTokenTransactions]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

      return {
        address,
        ethBalance,
        tokenBalances,
        recentTransactions: allTransactions,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      throw error;
    }
  }

  // Get simple price data (mock implementation for now)
  async getTokenPrices(symbols) {
    const cacheKey = generateCacheKey(CACHE_KEYS.PRICE_DATA, symbols.join(','));
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    // Mock price data - in production, you'd use CoinGecko or similar
    const mockPrices = {
      'ETH': 1800,
      'USDC': 1.00,
      'USDT': 1.00,
      'LINK': 15.00,
      'UNI': 8.50
    };

    const prices = {};
    symbols.forEach(symbol => {
      prices[symbol] = mockPrices[symbol] || 0;
    });

    apiCache.set(cacheKey, prices, CACHE_CONFIG.PRICE_TTL);
    return prices;
  }

  // Clear all cached data
  clearCache() {
    apiCache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return apiCache.getStats();
  }
}

// Create and export singleton instance
export const blockchainApi = new BlockchainApiService();
export default blockchainApi;
