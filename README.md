
# TokenPlatform - POC Plataforma de Tokenización de Activos

## 🔹 Descripción

Proof of Concept (POC) funcional que demuestra una plataforma completa de tokenización de activos físicos. El proyecto incluye registro de usuarios, emisión y transferencia de tokens ERC-20/ERC-721, y operaciones básicas de mercado.

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS** para estilos
- **shadcn/ui** para componentes
- **React Router** para navegación
- **Context API** para estado global

### Backend Simulado
- **API REST simulada** con endpoints principales
- **Base de datos simulada** en memoria
- **Autenticación JWT** simulada
- **Contratos inteligentes** simulados

### Integración Blockchain (Simulada)
- Contratos **ERC-20** y **ERC-721**
- Conexión a red local (preparado para Ganache)
- Operaciones de mint y transfer
- Generación de hashes de transacción

## ✨ Funcionalidades Implementadas

### 🔐 Autenticación
- Registro e inicio de sesión simulado
- Generación automática de wallet addresses
- Persistencia en localStorage
- Sistema de contexto React

### 🪙 Gestión de Tokens
- **Creación de tokens** ERC-20 y ERC-721
- **Emisión (mint)** de tokens a usuarios
- **Transferencia** entre wallets
- **Consulta de balances** y metadatos

### 📊 Dashboard Completo
- Resumen de portfolio y estadísticas
- Lista de tokens propios
- Historial de transacciones
- Interfaz responsiva y moderna

### 🏪 Mercado (MarketPlace)
- Creación de órdenes de compra/venta
- **Matching automático** de órdenes
- Libro de órdenes en tiempo real
- Estadísticas de volumen

### 📝 Sistema de Logs
- Registro completo de transacciones
- Estados: pending, completed, failed
- Hashes de transacción únicos
- Filtros y búsquedas

## 🛠️ Instalación y Ejecución

### Requisitos Previos
- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <URL_DEL_REPOSITORIO>
cd token-platform-poc
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar el proyecto**
```bash
npm run dev
```

4. **Abrir en navegador**
```
http://localhost:8080
```

## 🧪 Uso del POC

### 1. Registro/Login
- Usar cualquier email válido
- Contraseña mínimo 6 caracteres
- Se genera automáticamente una wallet address

### 2. Crear Tokens
- Navegar a "Crear Tokens"
- Llenar formulario (nombre, símbolo, tipo, etc.)
- El sistema simula el despliegue del contrato

### 3. Transferir Tokens
- Seleccionar token a transferir
- Ingresar dirección de destino (o usar "Generar Dirección Demo")
- Confirmar transferencia

### 4. Operar en el Mercado
- Crear órdenes de compra/venta
- Ver libro de órdenes
- El sistema hace matching automático

### 5. Ver Transacciones
- Revisar historial completo
- Ver estados y hashes
- Filtrar por tipo de transacción

## 📚 API Endpoints (Simulados)

### Tokens
```typescript
GET    /api/tokens           // Listar tokens
POST   /api/tokens           // Crear token
```

### Transacciones
```typescript
GET    /api/transactions     // Listar transacciones
POST   /api/transactions     // Crear transacción
```

### Órdenes de Mercado
```typescript
GET    /api/orders           // Listar órdenes
POST   /api/orders           // Crear orden
POST   /api/orders/match     // Hacer matching
```

### Contratos (Simulados)
```typescript
POST   /contract/mint        // Mint tokens
POST   /contract/transfer    // Transferir tokens
GET    /contract/balance     // Consultar balance
```

## 🔗 Integración con Blockchain Real

Para conectar con una blockchain real (Ganache/Hardhat):

### 1. Configurar Red Local
```bash
# Instalar Ganache CLI
npm install -g ganache-cli

# Ejecutar red local
ganache-cli --host 0.0.0.0 --port 8545
```

### 2. Desplegar Contratos
```solidity
// Ejemplo de contrato ERC-20
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AssetToken is ERC20 {
    constructor() ERC20("AssetToken", "AST") {}
    
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
```

### 3. Actualizar Configuración
```typescript
// src/services/blockchain.ts
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
const contract = new ethers.Contract(contractAddress, contractABI, provider);
```

## 🎯 Características Técnicas

### Arquitectura
- **Componentes modulares** y reutilizables
- **Separación de responsabilidades** clara
- **Estado centralizado** con Context API
- **Servicios simulados** para APIs y contratos

### Diseño
- **Responsive design** para todos los dispositivos
- **Tema profesional** con colores crypto
- **Animaciones suaves** y micro-interacciones
- **UX optimizada** para operaciones blockchain

### Código
- **TypeScript** para type safety
- **Interfaces bien definidas** para todos los datos
- **Error handling** completo
- **Console logs** para debugging

## 📋 Ejemplos de Código

### Crear Token
```typescript
const newToken = await api.createToken({
  name: "Gold Reserve Token",
  symbol: "GOLD",
  type: "ERC-20",
  totalSupply: 1000,
  description: "Token respaldado por oro físico",
  assetType: "Metales Preciosos",
  owner: user.walletAddress,
  contractAddress: generatedAddress
});
```

### Transferir Tokens
```typescript
const txHash = await contractService.transferTokens(
  tokenAddress,
  fromAddress,
  toAddress,
  amount
);

const transaction = await api.createTransaction({
  from: fromAddress,
  to: toAddress,
  tokenId: selectedToken.id,
  amount: amount,
  type: 'transfer'
});
```

### Crear Orden de Mercado
```typescript
const order = await api.createOrder({
  tokenId: selectedToken.id,
  userId: user.id,
  type: 'buy', // o 'sell'
  amount: 10,
  price: 25.50
});
```

## 🚀 Próximos Pasos

### Para Desarrollo Completo:
1. **Integrar con Hardhat** para contratos reales
2. **Implementar backend real** con Node.js + Express
3. **Añadir base de datos** PostgreSQL/MongoDB
4. **Implementar WebSockets** para updates en tiempo real
5. **Añadir autenticación real** con JWT
6. **Integrar con MetaMask** para wallets reales

### Para Producción:
1. **Auditoría de contratos** inteligentes
2. **Tests unitarios** y de integración
3. **Optimización de rendimiento**
4. **Medidas de seguridad** avanzadas
5. **Compliance regulatorio**

## 📞 Soporte

Para dudas o problemas:
- Revisar la consola del navegador para logs detallados
- Verificar que todos los campos estén completos
- Probar con datos de ejemplo proporcionados

---

**POC Desarrollado con ❤️ usando React + TypeScript**

*Este es un proyecto de demostración para fines educativos y de prototipado.*
