import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Coins, Loader2 } from 'lucide-react';
import { api, contractService } from '@/services/api';
import { Token } from '@/types';
import { toast } from '@/hooks/use-toast';

interface TokenMinterProps {
  onTokenCreated: (token: Token) => void;
}

const TokenMinter: React.FC<TokenMinterProps> = ({ onTokenCreated }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    type: 'ERC-20' as 'ERC-20' | 'ERC-721',
    totalSupply: 1000,
    description: '',
    assetType: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      // Simular dirección de contrato
      const contractAddress = '0x' + Math.random().toString(16).substr(2, 40);
      
      console.log('Creating token:', formData);

      // Crear token en la API con el supply ya establecido
      const newToken = await api.createToken({
        ...formData,
        currentSupply: formData.totalSupply, // Establecer el supply desde el inicio
        owner: user.walletAddress,
        contractAddress
      });

      // Simular mint inicial en el contrato
      const txHash = await contractService.mintTokens(
        contractAddress,
        user.walletAddress,
        formData.totalSupply
      );

      console.log('Token created successfully:', newToken);
      
      // Solo llamar onTokenCreated una vez con el token completo
      onTokenCreated(newToken);

      toast({
        title: "Token creado exitosamente",
        description: `${formData.name} (${formData.symbol}) ha sido tokenizado`,
      });

      // Limpiar formulario
      setFormData({
        name: '',
        symbol: '',
        type: 'ERC-20',
        totalSupply: 1000,
        description: '',
        assetType: ''
      });

    } catch (error) {
      console.error('Error creating token:', error);
      toast({
        title: "Error al crear token",
        description: "Hubo un problema al crear el token. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const assetTypes = [
    'Inmobiliario',
    'Arte y Coleccionables',
    'Metales Preciosos',
    'Acciones',
    'Bonos',
    'Commodities',
    'Propiedad Intelectual',
    'Otros'
  ];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <PlusCircle className="w-5 h-5 mr-2" />
          Crear Nuevo Token
        </CardTitle>
        <CardDescription>
          Tokeniza un activo físico creando un token ERC-20 o ERC-721
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Token</Label>
              <Input
                id="name"
                placeholder="ej: Gold Reserve Token"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="symbol">Símbolo</Label>
              <Input
                id="symbol"
                placeholder="ej: GOLD"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Token</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'ERC-20' | 'ERC-721') => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ERC-20">ERC-20 (Fungible)</SelectItem>
                  <SelectItem value="ERC-721">ERC-721 (NFT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalSupply">Supply Total</Label>
              <Input
                id="totalSupply"
                type="number"
                min="1"
                value={formData.totalSupply}
                onChange={(e) => setFormData({ ...formData, totalSupply: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assetType">Tipo de Activo</Label>
            <Select 
              value={formData.assetType} 
              onValueChange={(value) => setFormData({ ...formData, assetType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de activo" />
              </SelectTrigger>
              <SelectContent>
                {assetTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción del Activo</Label>
            <Textarea
              id="description"
              placeholder="Describe el activo que estás tokenizando..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Coins className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-medium text-blue-900 mb-1">Información Técnica</h4>
                <ul className="text-blue-700 space-y-1">
                  <li>• ERC-20: Tokens fungibles (divisibles, intercambiables)</li>
                  <li>• ERC-721: NFTs únicos (no fungibles, únicos)</li>
                  <li>• Los contratos se desplegarán en la red local (Ganache)</li>
                  <li>• Se generará automáticamente la dirección del contrato</li>
                </ul>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !formData.name || !formData.symbol || !formData.assetType}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando Token...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 mr-2" />
                Crear Token
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TokenMinter;
