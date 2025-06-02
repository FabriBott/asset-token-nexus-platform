
// Simulación de API REST para el POC
import { Token, Transaction, MarketOrder } from '@/types';

// Base de datos simulada
const mockDatabase = {
  tokens: [] as Token[],
  transactions: [] as Transaction[],
  orders: [] as MarketOrder[]
};

// Simular delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Endpoints de tokens
  async getTokens(): Promise<Token[]> {
    await delay(500);
    console.log('API: Fetching tokens');
    return mockDatabase.tokens;
  },

  async createToken(tokenData: Omit<Token, 'id' | 'createdAt'>): Promise<Token> {
    await delay(800);
    const newToken: Token = {
      ...tokenData,
      id: 'token_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    
    mockDatabase.tokens.push(newToken);
    console.log('API: Token created:', newToken);
    return newToken;
  },

  // Endpoints de transacciones
  async getTransactions(): Promise<Transaction[]> {
    await delay(300);
    console.log('API: Fetching transactions');
    return mockDatabase.transactions;
  },

  async createTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt' | 'status' | 'txHash'>): Promise<Transaction> {
    await delay(1000);
    const newTransaction: Transaction = {
      ...transactionData,
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      status: 'completed',
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
      createdAt: new Date().toISOString()
    };
    
    mockDatabase.transactions.push(newTransaction);
    console.log('API: Transaction created:', newTransaction);
    return newTransaction;
  },

  // Endpoints de órdenes de mercado
  async getMarketOrders(): Promise<MarketOrder[]> {
    await delay(400);
    console.log('API: Fetching market orders');
    return mockDatabase.orders;
  },

  async createOrder(orderData: Omit<MarketOrder, 'id' | 'createdAt' | 'status'>): Promise<MarketOrder> {
    await delay(600);
    const newOrder: MarketOrder = {
      ...orderData,
      id: 'order_' + Math.random().toString(36).substr(2, 9),
      status: 'open',
      createdAt: new Date().toISOString()
    };
    
    mockDatabase.orders.push(newOrder);
    console.log('API: Order created:', newOrder);
    return newOrder;
  },

  async matchOrders(buyOrderId: string, sellOrderId: string): Promise<boolean> {
    await delay(800);
    console.log('API: Matching orders:', buyOrderId, sellOrderId);
    
    // Simular matching de órdenes
    const buyOrder = mockDatabase.orders.find(o => o.id === buyOrderId);
    const sellOrder = mockDatabase.orders.find(o => o.id === sellOrderId);
    
    if (buyOrder && sellOrder) {
      buyOrder.status = 'filled';
      sellOrder.status = 'filled';
      return true;
    }
    
    return false;
  }
};

// Simulación de contrato inteligente
export const contractService = {
  async mintTokens(tokenAddress: string, to: string, amount: number): Promise<string> {
    await delay(2000);
    const txHash = '0x' + Math.random().toString(16).substr(2, 64);
    console.log(`Contract: Minting ${amount} tokens to ${to}. TxHash: ${txHash}`);
    return txHash;
  },

  async transferTokens(tokenAddress: string, from: string, to: string, amount: number): Promise<string> {
    await delay(1500);
    const txHash = '0x' + Math.random().toString(16).substr(2, 64);
    console.log(`Contract: Transferring ${amount} tokens from ${from} to ${to}. TxHash: ${txHash}`);
    return txHash;
  },

  async getBalance(tokenAddress: string, userAddress: string): Promise<number> {
    await delay(500);
    const balance = Math.floor(Math.random() * 1000);
    console.log(`Contract: Balance for ${userAddress}: ${balance}`);
    return balance;
  }
};
