
// Tipos principales para el POC de tokenización

export interface User {
  id: string;
  email: string;
  name: string;
  walletAddress: string;
  createdAt: string;
}

export interface Token {
  id: string;
  name: string;
  symbol: string;
  type: 'ERC-20' | 'ERC-721';
  totalSupply: number;
  currentSupply: number;
  owner: string;
  contractAddress: string;
  description: string;
  assetType: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  tokenId: string;
  amount: number;
  type: 'mint' | 'transfer' | 'buy' | 'sell';
  status: 'pending' | 'completed' | 'failed';
  txHash: string;
  createdAt: string;
}

export interface MarketOrder {
  id: string;
  tokenId: string;
  userId: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  status: 'open' | 'filled' | 'cancelled';
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}
