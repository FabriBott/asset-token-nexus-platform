
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, Send, Loader2 } from 'lucide-react';
import { api, contractService } from '@/services/api';
import { Token, Transaction } from '@/types';
import { toast } from '@/hooks/use-toast';

interface TokenTransferProps {
  tokens: Token[];
  onTransactionCreated: (transaction: Transaction) => void;
}

const TokenTransfer: React.FC<TokenTransferProps> = ({ tokens, onTransactionCreated }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    tokenId: '',
    toAddress: '',
    amount: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const selectedToken = tokens.find(t => t.id === formData.tokenId);
    if (!selectedToken) {
      toast({
        title: "Error",
        description: "Selecciona un token válido",
        variant: "destructive",
      });
      return;
    }

    if (formData.amount > selectedToken.currentSupply) {
      toast({
        title: "Error",
        description: "No tienes suficientes tokens para transferir",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Initiating transfer:', formData);

      // Simular transferencia en el contrato
      const txHash = await contractService.transferTokens(
        selectedToken.contractAddress,
        user.walletAddress,
        formData.toAddress,
        formData.amount
      );

      // Registrar transacción en la API
      const transaction = await api.createTransaction({
        from: user.walletAddress,
        to: formData.toAddress,
        tokenId: formData.tokenId,
        amount: formData.amount,
        type: 'transfer'
      });

      console.log('Transfer completed:', transaction);
      onTransactionCreated(transaction);

      toast({
        title: "Transferencia exitosa",
        description: `${formData.amount} ${selectedToken.symbol} transferidos`,
      });

      // Limpiar formulario
      setFormData({
        tokenId: '',
        toAddress: '',
        amount: 1
      });

    } catch (error) {
      console.error('Error in transfer:', error);
      toast({
        title: "Error en transferencia",
        description: "Hubo un problema al transferir los tokens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedToken = tokens.find(t => t.id === formData.tokenId);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ArrowUpDown className="w-5 h-5 mr-2" />
          Transferir Tokens
        </CardTitle>
        <CardDescription>
          Envía tokens a otra dirección wallet
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tokens.length === 0 ? (
          <div className="text-center py-8">
            <ArrowUpDown className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No tienes tokens para transferir</p>
            <p className="text-sm text-gray-400">
              Crea tokens primero en la pestaña "Crear Tokens"
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="token">Seleccionar Token</Label>
              <Select 
                value={formData.tokenId} 
                onValueChange={(value) => setFormData({ ...formData, tokenId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un token para transferir" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.id} value={token.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{token.name} ({token.symbol})</span>
                        <span className="text-sm text-gray-500 ml-2">
                          Balance: {token.currentSupply}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedToken && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Información del Token</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Tipo:</span>
                    <span className="ml-2 font-medium">{selectedToken.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Balance disponible:</span>
                    <span className="ml-2 font-medium">{selectedToken.currentSupply}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Contrato:</span>
                    <span className="ml-2 font-mono text-xs">
                      {selectedToken.contractAddress.substring(0, 10)}...{selectedToken.contractAddress.substring(32)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="toAddress">Dirección de destino</Label>
              <Input
                id="toAddress"
                placeholder="0x742d35Cc69C77f5dA0d......"
                value={formData.toAddress}
                onChange={(e) => setFormData({ ...formData, toAddress: e.target.value })}
                pattern="^0x[a-fA-F0-9]{40}$"
                title="Debe ser una dirección Ethereum válida"
                required
              />
              <p className="text-xs text-gray-500">
                Dirección wallet de Ethereum (40 caracteres hexadecimales después de 0x)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Cantidad a transferir</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                max={selectedToken?.currentSupply || 1}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 1 })}
                required
              />
              {selectedToken && selectedToken.type === 'ERC-721' && (
                <p className="text-xs text-yellow-600">
                  ⚠️ NFTs (ERC-721) solo permiten transferir 1 unidad a la vez
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Send className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-medium text-blue-900 mb-1">Información de Transferencia</h4>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Las transferencias son irreversibles</li>
                    <li>• Verifica que la dirección de destino sea correcta</li>
                    <li>• Se generará un hash de transacción único</li>
                    <li>• El proceso puede tomar unos segundos</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setFormData({ ...formData, toAddress: '0x' + Math.random().toString(16).substr(2, 40) })}
                className="flex-1"
              >
                Generar Dirección Demo
              </Button>
              
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isLoading || !formData.tokenId || !formData.toAddress || formData.amount < 1}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Transfiriendo...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Transferir
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenTransfer;
