// API Configuration for multiple blockchain data providers
export const API_PROVIDERS = {
  ETHERSCAN: 'etherscan',
  ALCHEMY: 'alchemy',
  SHAPE: 'shape',
  MORALIS: 'moralis'
};

export const API_CONFIG = {
  [API_PROVIDERS.ETHERSCAN]: {
    baseUrl: 'https://api.etherscan.io/api',
    rateLimit: 5, // requests per second
    apiKey: null, // Free tier without API key
    endpoints: {
      balance: '?module=account&action=balance',
      tokenBalance: '?module=account&action=tokenbalance',
      transactions: '?module=account&action=txlist',
      tokenTransactions: '?module=account&action=tokentx',
      tokenInfo: '?module=token&action=tokeninfo'
    }
  },
  [API_PROVIDERS.ALCHEMY]: {
    baseUrl: 'https://eth-mainnet.g.alchemy.com/v2',
    rateLimit: 5, // requests per second for free tier
    apiKey: 'demo', // Using demo key for free tier
    endpoints: {
      balance: '/getBalance',
      tokenBalances: '/getTokenBalances',
      transactions: '/getAssetTransfers'
    }
  },
  [API_PROVIDERS.SHAPE]: {
    baseUrl: 'https://shape-mainnet.g.alchemy.com/v2/rKW5eowuMyjYNJnjj-isXTNd1wAMRBPN',
    rateLimit: 10, // requests per second
    apiKey: 'rKW5eowuMyjYNJnjj-isXTNd1wAMRBPN',
    endpoints: {
      balance: '/getBalance',
      tokenBalances: '/getTokenBalances',
      transactions: '/getAssetTransfers',
      blockNumber: '/getBlockNumber'
    }
  },
  [API_PROVIDERS.MORALIS]: {
    baseUrl: 'https://deep-index.moralis.io/api/v2',
    rateLimit: 3, // requests per second for free tier
    apiKey: null, // Free tier without API key
    endpoints: {
      balance: '/balance',
      tokenBalances: '/erc20',
      transactions: '/transactions'
    }
  }
};

export const CACHE_CONFIG = {
  BALANCE_TTL: 30000, // 30 seconds
  TRANSACTION_TTL: 60000, // 1 minute
  TOKEN_INFO_TTL: 300000, // 5 minutes
  PRICE_TTL: 30000 // 30 seconds
};

export const POLLING_INTERVALS = {
  BALANCE_CHECK: 30000, // 30 seconds
  TRANSACTION_CHECK: 60000, // 1 minute
  PRICE_UPDATE: 30000 // 30 seconds
};

// Common ERC-20 tokens for better UX
export const COMMON_TOKENS = {
  '0xA0b86a33E6441b8C4505E2c8c5E6e8b8C4505E2c8': {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6
  },
  '0xdAC17F958D2ee523a2206206994597C13D831ec7': {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6
  },
  '0x514910771AF9Ca656af840dff83E8264EcF986CA': {
    symbol: 'LINK',
    name: 'Chainlink',
    decimals: 18
  },
  '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984': {
    symbol: 'UNI',
    name: 'Uniswap',
    decimals: 18
  }
};
