
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, Coins, User, Activity } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="gradient-bg text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Coins className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">TokenPlatform</h1>
                <p className="text-blue-200 text-sm">POC - Plataforma de Tokenización</p>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <Card className="bg-white/10 border-white/20 text-white px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <div className="text-sm">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-blue-200 text-xs">
                        {user.walletAddress.substring(0, 6)}...{user.walletAddress.substring(38)}
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Button
                  onClick={logout}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center space-x-2 mb-2">
            <Activity className="w-5 h-5" />
            <span className="font-medium">POC - Tokenización de Activos</span>
          </div>
          <p className="text-slate-400 text-sm">
            Desarrollado con React + TypeScript • Simulación de Blockchain
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
