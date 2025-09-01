import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { toast } from 'sonner';

interface AdminLoginProps {
  onLogin?: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor ingresa tu correo y contraseña');
      return;
    }

    setIsLoading(true);
    
    try {
      await login(email, password);
      onLogin?.();
      toast.success('Inicio de sesión exitoso');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <Button
          onClick={() => setIsVisible(true)}
          className="rounded-full w-12 h-12 flex items-center justify-center shadow-lg bg-slate-700 hover:bg-slate-800 text-white transition-all duration-300 transform hover:scale-105"
          title="Acceso de administrador"
        >
          <Lock className="w-5 h-5" />
        </Button>
      ) : (
        <div 
          className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsVisible(false)}
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          <div 
            className="relative z-50 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-4 shadow-lg">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Panel de Administración</h3>
                <p className="text-slate-300 text-sm">Ingresa tus credenciales para continuar</p>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="tu@email.com"
                        autoComplete="username"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                        Contraseña
                      </label>
                      <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className={`w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <span className="relative">
                          <span className="absolute -inset-1.5" />
                          <span className="relative">Ingresar al Panel</span>
                        </span>
                      </>
                    )}
                  </Button>
                </div>
                <p className="mt-4 text-center text-sm text-slate-400">
                  ¿No tienes una cuenta?{' '}
                  <a href="#" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                    Contacta al administrador
                  </a>
                </p>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
