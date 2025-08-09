import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { GenderPrediction } from '../types';
import Layout from './layout/Layout';
import Button from './ui/Button';
import { BarChart3, Users, Gift, LogOut, TrendingUp } from 'lucide-react';

// Componente Badge mejorado
interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  className = '',
  children,
}) => {
  const baseStyles = 'inline-flex items-center rounded-lg font-medium transition-colors';
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };
  const variantStyles = {
    default: 'bg-slate-700 text-slate-300 border border-slate-600',
    primary: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
    secondary: 'bg-purple-600/20 text-purple-400 border border-purple-500/30',
    success: 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-600/20 text-amber-400 border border-amber-500/30',
    error: 'bg-red-600/20 text-red-400 border border-red-500/30',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const { currentEvent, products, reservations, predictions, categories, stores } = useApp();
  const typedPredictions: GenderPrediction[] = [...predictions];
  const [activeTab, setActiveTab] = useState<'overview' | 'reservations' | 'predictions' | 'products'>('overview');
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticación al cargar
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    onLogout();
    navigate('/');
  };

  // Calculate statistics
  const stats = {
    totalProducts: products.length,
    totalReservations: reservations.length,
    totalPredictions: predictions.length,
    uniqueGuests: new Set(reservations.map(r => r.guestEmail)).size,
    boyPredictions: predictions.filter(p => p.predictedGender === 'boy').length,
    girlPredictions: predictions.filter(p => p.predictedGender === 'girl').length,
    completionRate: Math.round((reservations.length / products.length) * 100),
    totalValue: reservations.reduce((sum, r) => {
      const product = products.find(p => p.id === r.productId);
      return sum + (product ? product.price * r.quantity : 0);
    }, 0)
  };

  const popularProducts = products
    .map(product => ({
      product,
      reservations: reservations.filter(r => r.productId === product.id).length
    }))
    .sort((a, b) => b.reservations - a.reservations)
    .slice(0, 5);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2.5 bg-slate-800 rounded-lg text-blue-400">
                  <BarChart3 size={24} />
                </div>
                Panel de Administración
              </h1>
              <p className="text-slate-400 mt-1 text-sm">
                Gestiona las reservas, predicciones y productos del evento
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2 self-start md:self-center"
            >
              <LogOut size={16} />
              Cerrar Sesión
            </Button>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-1 p-1 bg-slate-800 rounded-lg border border-slate-700">
              {[
                { id: 'overview', label: 'Resumen', icon: BarChart3 },
                { id: 'reservations', label: 'Reservas', icon: Users },
                { id: 'predictions', label: 'Predicciones', icon: Gift },
                { id: 'products', label: 'Productos', icon: Gift }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === id
                      ? 'bg-slate-700 text-blue-400 shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon size={16} className={activeTab === id ? 'text-blue-400' : 'text-slate-400'} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
                  <div className="text-3xl font-bold text-blue-400">{stats.totalReservations}</div>
                  <div className="text-sm text-slate-400">Reservas</div>
                </div>
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
                  <div className="text-3xl font-bold text-pink-400">{stats.totalPredictions}</div>
                  <div className="text-sm text-slate-400">Predicciones</div>
                </div>
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
                  <div className="text-3xl font-bold text-emerald-400">${stats.totalValue.toFixed(0)}</div>
                  <div className="text-sm text-slate-400">Valor Total</div>
                </div>
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
                  <div className="text-3xl font-bold text-purple-400">{stats.uniqueGuests}</div>
                  <div className="text-sm text-slate-400">Invitados</div>
                </div>
              </div>

              {/* Gender Battle */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                <h4 className="font-semibold text-white text-center text-lg mb-6">
                  ⚔️ Batalla de Predicciones
                </h4>
                <div className="flex items-center justify-between max-w-md mx-auto">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-400">{stats.boyPredictions}</div>
                    <div className="text-sm text-slate-400 mt-2">🤴 Príncipe</div>
                  </div>
                  <div className="text-4xl text-slate-500">⚔️</div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-pink-400">{stats.girlPredictions}</div>
                    <div className="text-sm text-slate-400 mt-2">👸 Princesa</div>
                  </div>
                </div>
              </div>

              {/* Popular Products */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                <h4 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-blue-400" />
                  Productos más populares
                </h4>
                <div className="space-y-3">
                  {popularProducts.slice(0, 3).map(({ product, reservations: count }) => {
                    const progress = Math.min((count / 10) * 100, 100);
                    const maxQty = 10;
                    
                    return (
                      <div key={product.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-white">{product.name}</div>
                              <div className="text-xs text-slate-400">{count} reservas</div>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-blue-400">
                            {count}/{maxQty}
                          </div>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Reservations Tab */}
          {activeTab === 'reservations' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-semibold text-white">
                  Reservas Recientes
                </h4>
                <span className="text-sm text-slate-400">
                  {reservations.length} en total
                </span>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {reservations.slice(0, 10).map((reservation) => {
                  const product = products.find(p => p.id === reservation.productId);
                  return (
                    <div key={reservation.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                            <img
                              src={product?.imageUrl}
                              alt={product?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h5 className="font-medium text-white">{reservation.guestName}</h5>
                            <div className="text-sm text-slate-400">
                              {product?.name} × {reservation.quantity}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {new Date(reservation.createdAt).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant={reservation.status === 'confirmed' ? 'success' : 'default'}
                          className="text-xs px-2 py-1"
                        >
                          {reservation.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Predictions Tab */}
          {activeTab === 'predictions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-semibold text-white">
                  Predicciones y Nombres
                </h4>
                <span className="text-sm text-slate-400">
                  {predictions.length} en total
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {typedPredictions.slice(0, 10).map((prediction) => (
                  <div 
                    key={prediction.id} 
                    className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-white">
                        {prediction.guestName}
                      </h5>
                      <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        prediction.predictedGender === 'boy' 
                          ? 'bg-blue-900/30 text-blue-400' 
                          : 'bg-pink-900/30 text-pink-400'
                      }`}>
                        {prediction.predictedGender === 'boy' ? '👶 Niño' : '👧 Niña'}
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/50 p-3 rounded-lg mb-3">
                      <div className="text-sm text-slate-300 font-medium mb-1">
                        Nombre sugerido:
                      </div>
                      <div className="text-white font-medium">
                        {prediction.suggestedName || 'Sin nombre sugerido'}
                      </div>
                    </div>
                    
                    {prediction.message && (
                      <div className="text-sm text-slate-400 italic mb-3">
                        "{prediction.message}"
                      </div>
                    )}
                    
                    <div className="text-xs text-slate-500 flex justify-between items-center">
                      <span>
                        {new Date(prediction.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                        {prediction.predictedDate 
                          ? new Date(prediction.predictedDate).toLocaleDateString('es-ES')
                          : 'Sin fecha'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-semibold text-white">
                  Gestión de Productos
                </h4>
                <Button 
                  onClick={() => {}}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Agregar Producto
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => {
                  const productReservations = reservations.filter(r => r.productId === product.id);
                  const totalReserved = productReservations.reduce((sum, r) => sum + r.quantity, 0);
                  const maxQty = product.maxQuantity || 10;
                  const progress = Math.min((totalReserved / maxQty) * 100, 100);
                  const isLowStock = totalReserved >= maxQty * 0.8;
                  
                  return (
                    <div 
                      key={product.id} 
                      className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors"
                    >
                      <div className="h-36 bg-slate-700 overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-bold text-white text-lg">
                            {product.name}
                          </h5>
                          <span className="text-sm font-bold text-blue-400">
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Reservados: {totalReserved}/{maxQty}</span>
                            <span className={isLowStock ? 'text-red-400' : 'text-emerald-400'}>
                              {isLowStock ? '¡Poco Stock!' : 'Disponible'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isLowStock ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-blue-500 to-emerald-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500"
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500"
                          >
                            Ver Detalles
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminPanel;