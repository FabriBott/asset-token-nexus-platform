
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, ArrowUpRight, ArrowDownLeft, Coins, ShoppingCart } from 'lucide-react';
import { Transaction } from '@/types';

interface TransactionLogsProps {
  transactions: Transaction[];
}

const TransactionLogs: React.FC<TransactionLogsProps> = ({ transactions }) => {
  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'mint':
        return <Coins className="w-4 h-4" />;
      case 'transfer':
        return <ArrowUpRight className="w-4 h-4" />;
      case 'buy':
      case 'sell':
        return <ShoppingCart className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'mint':
        return 'bg-blue-100 text-blue-800';
      case 'transfer':
        return 'bg-green-100 text-green-800';
      case 'buy':
        return 'bg-purple-100 text-purple-800';
      case 'sell':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'mint':
        return 'Emisión';
      case 'transfer':
        return 'Transferencia';
      case 'buy':
        return 'Compra';
      case 'sell':
        return 'Venta';
      default:
        return type;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Registro de Transacciones
        </CardTitle>
        <CardDescription>
          Historial completo de todas tus transacciones de tokens
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No hay transacciones aún</p>
            <p className="text-sm text-gray-400">
              Las transacciones aparecerán aquí cuando crees, transfieras o negocies tokens
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getTransactionColor(transaction.type)}`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getTransactionColor(transaction.type)}>
                          {getTransactionLabel(transaction.type)}
                        </Badge>
                        <Badge 
                          variant={transaction.status === 'completed' ? 'default' : 
                                  transaction.status === 'pending' ? 'secondary' : 'destructive'}
                        >
                          {transaction.status === 'completed' ? 'Completada' :
                           transaction.status === 'pending' ? 'Pendiente' : 'Fallida'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {transaction.amount} tokens
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            De: {formatAddress(transaction.from)}
                          </span>
                          <span className="flex items-center">
                            <ArrowDownLeft className="w-3 h-3 mr-1" />
                            A: {formatAddress(transaction.to)}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          TxHash: 
                          <span className="font-mono ml-1">
                            {formatAddress(transaction.txHash)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {transactions.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-medium text-blue-900 mb-1">Información de Transacciones</h4>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Total de transacciones: {transactions.length}</li>
                    <li>• Completadas: {transactions.filter(t => t.status === 'completed').length}</li>
                    <li>• Pendientes: {transactions.filter(t => t.status === 'pending').length}</li>
                    <li>• Todas las transacciones se registran en la blockchain</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionLogs;
