
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, ShoppingCart, DollarSign, Loader2 } from 'lucide-react';
import { api } from '@/services/api';
import { Token, Transaction, MarketOrder } from '@/types';
import { toast } from '@/hooks/use-toast';

interface MarketPlaceProps {
  tokens: Token[];
  onTransactionCreated: (transaction: Transaction) => void;
}

const MarketPlace: React.FC<MarketPlaceProps> = ({ tokens, onTransactionCreated }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<MarketOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [orderForm, setOrderForm] = useState({
    tokenId: '',
    type: 'buy' as 'buy' | 'sell',
    amount: 1,
    price: 10
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const ordersData = await api.getMarketOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const selectedToken = tokens.find(t => t.id === orderForm.tokenId);
    if (!selectedToken) {
      toast({
        title: "Error",
        description: "Selecciona un token válido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Creating order:', orderForm);

      const newOrder = await api.createOrder({
        tokenId: orderForm.tokenId,
        userId: user.id,
        type: orderForm.type,
        amount: orderForm.amount,
        price: orderForm.price
      });

      setOrders(prev => [...prev, newOrder]);

      toast({
        title: "Orden creada",
        description: `Orden de ${orderForm.type === 'buy' ? 'compra' : 'venta'} creada exitosamente`,
      });

      // Intentar hacer matching automático
      await attemptOrderMatching(newOrder);

      setOrderForm({
        tokenId: '',
        type: 'buy',
        amount: 1,
        price: 10
      });

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Error al crear la orden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const attemptOrderMatching = async (newOrder: MarketOrder) => {
    const oppositeType = newOrder.type === 'buy' ? 'sell' : 'buy';
    const matchingOrders = orders.filter(order => 
      order.tokenId === newOrder.tokenId &&
      order.type === oppositeType &&
      order.status === 'open' &&
      order.userId !== newOrder.userId &&
      ((newOrder.type === 'buy' && order.price <= newOrder.price) ||
       (newOrder.type === 'sell' && order.price >= newOrder.price))
    );

    if (matchingOrders.length > 0) {
      const bestMatch = matchingOrders[0];
      
      try {
        const success = await api.matchOrders(newOrder.id, bestMatch.id);
        
        if (success) {
          // Crear transacción del match
          const transaction = await api.createTransaction({
            from: newOrder.type === 'sell' ? newOrder.userId : bestMatch.userId,
            to: newOrder.type === 'buy' ? newOrder.userId : bestMatch.userId,
            tokenId: newOrder.tokenId,
            amount: Math.min(newOrder.amount, bestMatch.amount),
            type: 'buy'
          });

          onTransactionCreated(transaction);
          await loadOrders(); // Recargar órdenes

          toast({
            title: "¡Match encontrado!",
            description: "Tu orden ha sido ejecutada automáticamente",
          });
        }
      } catch (error) {
        console.error('Error matching orders:', error);
      }
    }
  };

  const openOrders = orders.filter(order => order.status === 'open');
  const buyOrders = openOrders.filter(order => order.type === 'buy');
  const sellOrders = openOrders.filter(order => order.type === 'sell');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Mercado de Tokens
          </CardTitle>
          <CardDescription>
            Compra y vende tokens en el mercado descentralizado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create">Crear Orden</TabsTrigger>
              <TabsTrigger value="orders">Libro de Órdenes</TabsTrigger>
              <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6">
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="token">Token</Label>
                    <select
                      id="token"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={orderForm.tokenId}
                      onChange={(e) => setOrderForm({ ...orderForm, tokenId: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar token</option>
                      {tokens.map((token) => (
                        <option key={token.id} value={token.id}>
                          {token.name} ({token.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Orden</Label>
                    <select
                      id="type"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={orderForm.type}
                      onChange={(e) => setOrderForm({ ...orderForm, type: e.target.value as 'buy' | 'sell' })}
                    >
                      <option value="buy">Comprar</option>
                      <option value="sell">Vender</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Cantidad</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      value={orderForm.amount}
                      onChange={(e) => setOrderForm({ ...orderForm, amount: parseInt(e.target.value) || 1 })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Precio (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={orderForm.price}
                      onChange={(e) => setOrderForm({ ...orderForm, price: parseFloat(e.target.value) || 0.01 })}
                      required
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <DollarSign className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <h4 className="font-medium text-yellow-900 mb-1">Resumen de la Orden</h4>
                      <p className="text-yellow-700">
                        {orderForm.type === 'buy' ? 'Comprar' : 'Vender'} {orderForm.amount} tokens 
                        a ${orderForm.price} cada uno = ${(orderForm.amount * orderForm.price).toFixed(2)} total
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !orderForm.tokenId}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creando orden...
                    </>
                  ) : (
                    <>
                      {orderForm.type === 'buy' ? (
                        <ShoppingCart className="w-4 h-4 mr-2" />
                      ) : (
                        <DollarSign className="w-4 h-4 mr-2" />
                      )}
                      {orderForm.type === 'buy' ? 'Crear Orden de Compra' : 'Crear Orden de Venta'}
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Órdenes de Compra */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-green-700">
                      Órdenes de Compra ({buyOrders.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {buyOrders.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No hay órdenes de compra</p>
                    ) : (
                      <div className="space-y-3">
                        {buyOrders.map((order) => {
                          const token = tokens.find(t => t.id === order.tokenId);
                          return (
                            <div key={order.id} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium">{token?.name || 'Token'}</p>
                                  <p className="text-sm text-gray-500">{token?.symbol}</p>
                                </div>
                                <Badge variant="outline" className="text-green-700">COMPRA</Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <span>Cantidad: {order.amount}</span>
                                <span>Precio: ${order.price}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Órdenes de Venta */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-700">
                      Órdenes de Venta ({sellOrders.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sellOrders.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No hay órdenes de venta</p>
                    ) : (
                      <div className="space-y-3">
                        {sellOrders.map((order) => {
                          const token = tokens.find(t => t.id === order.tokenId);
                          return (
                            <div key={order.id} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium">{token?.name || 'Token'}</p>
                                  <p className="text-sm text-gray-500">{token?.symbol}</p>
                                </div>
                                <Badge variant="outline" className="text-red-700">VENTA</Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <span>Cantidad: {order.amount}</span>
                                <span>Precio: ${order.price}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{orders.length}</div>
                    <p className="text-sm text-muted-foreground">Total de Órdenes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{buyOrders.length}</div>
                    <p className="text-sm text-muted-foreground">Órdenes de Compra</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{sellOrders.length}</div>
                    <p className="text-sm text-muted-foreground">Órdenes de Venta</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Volumen por Token</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tokens.map((token) => {
                      const tokenOrders = orders.filter(order => order.tokenId === token.id);
                      const volume = tokenOrders.reduce((sum, order) => sum + (order.amount * order.price), 0);
                      
                      return (
                        <div key={token.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{token.name}</p>
                            <p className="text-sm text-gray-500">{token.symbol}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${volume.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">{tokenOrders.length} órdenes</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketPlace;
