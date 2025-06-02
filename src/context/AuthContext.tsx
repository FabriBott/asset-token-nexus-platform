
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '@/types';
import { toast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('tokenPlatformUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('tokenPlatformUser');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulación de llamada a API
      console.log('Attempting login for:', email);
      
      // Simular validación (en producción esto sería una llamada real a la API)
      if (email && password.length >= 6) {
        const userData: User = {
          id: 'user_' + Math.random().toString(36).substr(2, 9),
          email,
          name: email.split('@')[0],
          walletAddress: '0x' + Math.random().toString(16).substr(2, 40),
          createdAt: new Date().toISOString()
        };

        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('tokenPlatformUser', JSON.stringify(userData));
        
        toast({
          title: "Login exitoso",
          description: `Bienvenido ${userData.name}`,
        });

        return true;
      } else {
        toast({
          title: "Error de login",
          description: "Credenciales inválidas",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error de login",
        description: "Error interno del servidor",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      console.log('Attempting registration for:', email);
      
      // Validación básica
      if (!email || !password || !name || password.length < 6) {
        toast({
          title: "Error de registro",
          description: "Todos los campos son requeridos y la contraseña debe tener al menos 6 caracteres",
          variant: "destructive",
        });
        return false;
      }

      const userData: User = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email,
        name,
        walletAddress: '0x' + Math.random().toString(16).substr(2, 40),
        createdAt: new Date().toISOString()
      };

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('tokenPlatformUser', JSON.stringify(userData));
      
      toast({
        title: "Registro exitoso",
        description: `Cuenta creada para ${userData.name}`,
      });

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error de registro",
        description: "Error interno del servidor",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('tokenPlatformUser');
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    });
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
