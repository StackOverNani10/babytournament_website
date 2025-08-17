import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (password === 'admin123') {
      onLogin();
      navigate('/admin');
    } else {
      alert('Contraseña incorrecta');
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700 mb-4">
                  <Lock className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Panel de Administración</h3>
                <p className="text-slate-400 text-sm">Ingresa tus credenciales para continuar</p>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pl-12 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  Ingresar al Panel
                </Button>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
