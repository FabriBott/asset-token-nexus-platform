
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, TrendingUp, Activity, PlusCircle, ArrowUpDown } from 'lucide-react';
import { api } from '@/services/api';
import { Token, Transaction } from '@/types';
import TokenMinter from './TokenMinter';
import TokenTransfer from './TokenTransfer';
import MarketPlace from './MarketPlace';
import TransactionLogs from './TransactionLogs';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [tokensData, transactionsData] = await Promise.all([
        api.getTokens(),
        api.getTransactions()
      ]);
      
      setTokens(tokensData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenCreated = (newToken: Token) => {
    setTokens(prev => [...prev, newToken]);
  };

  const handleTransactionCreated = (newTransaction: Transaction) => {
    setTransactions(prev => [...prev, newTransaction]);
  };

  // Estadísticas del dashboard
  const userTokens = tokens.filter(token => token.owner === user?.walletAddress);
  const userTransactions = transactions.filter(tx => 
    tx.from === user?.walletAddress || tx.to === user?.walletAddress
  );
  const totalPortfolioValue = userTokens.reduce((total, token) => total + (token.currentSupply * 10), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header del Dashboard */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Tokenización</h1>
        <p className="text-gray-600">Gestiona tus tokens y transacciones</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="crypto-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mis Tokens</CardTitle>
            <Coins className="h-4 w-4 text-crypto-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userTokens.length}</div>
            <p className="text-xs text-muted-foreground">
              {userTokens.filter(t => t.type === 'ERC-20').length} ERC-20, {userTokens.filter(t => t.type === 'ERC-721').length} ERC-721
            </p>
          </CardContent>
        </Card>

        <Card className="crypto-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor del Portfolio</CardTitle>
            <TrendingUp className="h-4 w-4 text-crypto-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPortfolioValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Valor estimado de tokens
            </p>
          </CardContent>
        </Card>

        <Card className="crypto-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
            <Activity className="h-4 w-4 text-crypto-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Últimas transacciones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pestañas principales */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="mint">Crear Tokens</TabsTrigger>
          <TabsTrigger value="transfer">Transferir</TabsTrigger>
          <TabsTrigger value="market">Mercado</TabsTrigger>
          <TabsTrigger value="logs">Transacciones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Lista de tokens del usuario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coins className="w-5 h-5 mr-2" />
                Mis Tokens
              </CardTitle>
              <CardDescription>
                Tokens que posees y has creado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userTokens.length === 0 ? (
                <div className="text-center py-8">
                  <Coins className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No tienes tokens aún</p>
                  <Button onClick={() => document.querySelector('[value="mint"]')?.click()}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Crear tu primer token
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userTokens.map((token) => (
                    <Card key={token.id} className="border-2 hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{token.name}</CardTitle>
                            <CardDescription>{token.symbol}</CardDescription>
                          </div>
                          <Badge variant={token.type === 'ERC-20' ? 'default' : 'secondary'}>
                            {token.type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Supply:</span>
                            <span className="font-medium">{token.currentSupply}/{token.totalSupply}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Tipo de Activo:</span>
                            <span className="font-medium">{token.assetType}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-3">{token.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mint">
          <TokenMinter onTokenCreated={handleTokenCreated} />
        </TabsContent>

        <TabsContent value="transfer">
          <TokenTransfer 
            tokens={userTokens} 
            onTransactionCreated={handleTransactionCreated}
          />
        </TabsContent>

        <TabsContent value="market">
          <MarketPlace 
            tokens={tokens}
            onTransactionCreated={handleTransactionCreated}
          />
        </TabsContent>

        <TabsContent value="logs">
          <TransactionLogs transactions={userTransactions} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
