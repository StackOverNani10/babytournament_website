import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../../../context/events/EventsContext';
import { useReservations } from '../../../context/reservations/ReservationsContext';
import { useApp } from '../../../context/AppContext';
import { Event, EventType } from '../../event/types/events';
import { Product } from '../../gifts/types/products';
import type { GenderPrediction } from '../../predictions/types/predictions';
import Layout from '../../../components/layout/Layout';
import Button from '../../../components/ui/Button';
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
  const { 
    events, 
    updateEvent,
    setActiveEvent,
    currentEvent
  } = useEvents();
  
  const { 
    reservations, 
    getProductReservations
  } = useReservations();
  
  const { products } = useApp();
  
  // Mock predictions until we move them to their own context
  const [predictions, setPredictions] = useState<GenderPrediction[]>([]);
  type TabType = 'overview' | 'reservations' | 'predictions' | 'products' | 'events';
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTabInEditor, setActiveTabInEditor] = useState<'details' | 'sections'>('details');
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticación al cargar
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    console.log('AdminPanel - isAuthenticated:', isAuthenticated);
    if (!isAuthenticated) {
      console.log('AdminPanel - Redirecting to home');
      navigate('/');
    } else {
      console.log('AdminPanel - Authenticated, loading data...');
      console.log('Products:', products);
      console.log('Reservations:', reservations);
      console.log('Events:', events);
    }
  }, [navigate, products, reservations, events]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    onLogout();
    navigate('/');
  };

  // Calculate statistics
  const stats = {
    totalProducts: products?.length || 0,
    totalReservations: reservations?.length || 0,
    totalPredictions: predictions?.length || 0,
    uniqueGuests: new Set(reservations?.map(r => r.guestEmail) || []).size,
    boyPredictions: predictions?.filter(p => p.predictedGender === 'boy').length || 0,
    girlPredictions: predictions?.filter(p => p.predictedGender === 'girl').length || 0,
    completionRate: products?.length 
      ? Math.round(((reservations?.length || 0) / products.length) * 100) 
      : 0,
    totalValue: reservations?.reduce((sum, r) => {
      const product = products?.find((p: Product) => p.id === r.productId);
      return sum + (product ? product.price * r.quantity : 0);
    }, 0) || 0
  };

  const popularProducts = (products || [])
    .map((product: Product) => ({
      product,
      reservations: getProductReservations(product.id).length
    }))
    .sort((a: { product: Product; reservations: number }, b: { product: Product; reservations: number }) => b.reservations - a.reservations)
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
                { id: 'products', label: 'Productos', icon: Gift },
                { id: 'events', label: 'Eventos', icon: TrendingUp }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as TabType)}
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
                {predictions.slice(0, 10).map((prediction) => (
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
          
          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="mt-8 bg-slate-800/50 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Gestión de Eventos</h2>
                <button
                  onClick={() => {
                    setEditingEvent({
                      id: Date.now().toString(),
                      type: 'gender-reveal',
                      title: '',
                      subtitle: '',
                      date: new Date().toISOString().split('T')[0],
                      time: '15:00',
                      location: '',
                      description: '',
                      isActive: false,
                      createdAt: new Date().toISOString(),
                      sections: {
                        'countdown': { 
                          id: 'countdown', 
                          title: 'Cuenta Regresiva',
                          description: 'Muestra un contador para el inicio del evento',
                          enabled: true, 
                          order: 1 
                        },
                        'predictions': { 
                          id: 'predictions', 
                          title: 'Predicciones de Género',
                          description: 'Permite a los invitados predecir el género del bebé',
                          enabled: true, 
                          order: 2 
                        },
                        'gift-catalog': { 
                          id: 'gift-catalog', 
                          title: 'Lista de Regalos',
                          description: 'Muestra los regalos disponibles para el evento',
                          enabled: true, 
                          order: 3 
                        },
                        'activity-voting': { 
                          id: 'activity-voting', 
                          title: 'Votación de Actividades',
                          description: 'Permite votar por actividades para el evento',
                          enabled: true, 
                          order: 4 
                        },
                        'raffle': { 
                          id: 'raffle', 
                          title: 'Sorteos',
                          description: 'Gestiona los sorteos del evento',
                          enabled: true, 
                          order: 5 
                        },
                        'wishes': { 
                          id: 'wishes', 
                          title: 'Mensajes de Deseos',
                          description: 'Recopila mensajes de buenos deseos para los padres',
                          enabled: true, 
                          order: 6 
                        }
                      }
                    });
                    setIsEditing(true);
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Nuevo Evento
                </button>
              </div>
              
              <div className="space-y-4">
                {events.map(event => (
                  <div 
                    key={event.id} 
                    className={`p-4 rounded-lg border ${event.isActive ? 'border-blue-500 bg-blue-900/20' : 'border-slate-700 bg-slate-800/50'} transition-colors`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-white">
                          {event.title} 
                          <span className="ml-2 text-sm font-normal px-2 py-0.5 rounded-full bg-slate-700">
                            {event.type === 'gender-reveal' ? 'Gender Reveal' : 'Baby Shower'}
                          </span>
                          {event.isActive && (
                            <span className="ml-2 text-sm font-normal px-2 py-0.5 rounded-full bg-green-600 text-white">
                              Activo
                            </span>
                          )}
                        </h3>
                        <p className="text-slate-300">{event.subtitle}</p>
                        <p className="text-sm text-slate-400 mt-1">
                          {new Date(event.date).toLocaleDateString()} • {event.time} • {event.location}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            // Asegurarse de que todas las propiedades necesarias estén presentes
                            const sections = event.sections || {};
                            const defaultSections = {
                              'countdown': { 
                                id: 'countdown', 
                                title: 'Cuenta Regresiva',
                                description: 'Muestra un contador para el inicio del evento',
                                enabled: true, 
                                order: 1 
                              },
                              'predictions': { 
                                id: 'predictions', 
                                title: 'Predicciones de Género',
                                description: 'Permite a los invitados predecir el género del bebé',
                                enabled: true, 
                                order: 2 
                              },
                              'gift-catalog': { 
                                id: 'gift-catalog', 
                                title: 'Lista de Regalos',
                                description: 'Muestra los regalos disponibles para el evento',
                                enabled: true, 
                                order: 3 
                              },
                              'activity-voting': { 
                                id: 'activity-voting', 
                                title: 'Votación de Actividades',
                                description: 'Permite votar por actividades para el evento',
                                enabled: true, 
                                order: 4 
                              },
                              'raffle': { 
                                id: 'raffle', 
                                title: 'Sorteos',
                                description: 'Gestiona los sorteos del evento',
                                enabled: true, 
                                order: 5 
                              },
                              'wishes': { 
                                id: 'wishes', 
                                title: 'Mensajes de Deseos',
                                description: 'Recopila mensajes de buenos deseos para los padres',
                                enabled: true, 
                                order: 6 
                              }
                            };
                            
                            // Combinar las secciones existentes con los valores por defecto
                            const mergedSections = Object.keys(defaultSections).reduce((acc, key) => ({
                              ...acc,
                              [key]: {
                                ...defaultSections[key as keyof typeof defaultSections],
                                ...sections[key as keyof typeof sections],
                                // Asegurar que los campos requeridos estén presentes
                                id: key,
                                enabled: sections[key as keyof typeof sections]?.enabled ?? defaultSections[key as keyof typeof defaultSections].enabled,
                                order: sections[key as keyof typeof sections]?.order ?? defaultSections[key as keyof typeof defaultSections].order
                              }
                            }), {});
                            
                            setEditingEvent({
                              ...event,
                              sections: mergedSections
                            });
                            setIsEditing(true);
                          }}
                          className="p-2 text-blue-400 hover:bg-slate-700 rounded-full"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        {!event.isActive && (
                          <button
                            onClick={() => setActiveEvent(event.id)}
                            className="p-2 text-green-400 hover:bg-slate-700 rounded-full"
                            title="Activar evento"
                          >
                            ✅
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Event Form Modal */}
              {isEditing && editingEvent && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                    {/* Sticky Header */}
                    <div className="sticky top-0 z-10 bg-slate-800 pt-6 px-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">
                          {editingEvent.id === 'new' ? 'Nuevo Evento' : 'Editar Evento'}
                        </h3>
                        <button 
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          <span className="sr-only">Cerrar</span>
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Tabs */}
                      <div className="flex space-x-4 border-b border-slate-700 -mx-6 px-6">
                        <button
                          type="button"
                          onClick={() => setActiveTabInEditor('details')}
                          className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                            activeTabInEditor === 'details' 
                              ? 'border-blue-500 text-blue-400' 
                              : 'border-transparent text-gray-400 hover:text-white'
                          }`}
                        >
                          Detalles del Evento
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTabInEditor('sections')}
                          className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                            activeTabInEditor === 'sections' 
                              ? 'border-blue-500 text-blue-400' 
                              : 'border-transparent text-gray-400 hover:text-white'
                          }`}
                        >
                          Secciones
                        </button>
                      </div>
                    </div>
                    
                    {/* Scrollable Content */}
                    <div className="p-6 overflow-y-auto flex-1">
                      <form 
                        id="event-form" 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!editingEvent?.id) return;
                          updateEvent(editingEvent.id, editingEvent);
                          setIsEditing(false);
                        }}
                      >
                      {activeTabInEditor === 'details' ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Tipo de Evento
                          </label>
                          <select
                            value={editingEvent.type}
                            onChange={(e) => setEditingEvent({
                              ...editingEvent,
                              type: e.target.value as EventType
                            })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                            required
                          >
                            <option value="gender-reveal">Gender Reveal</option>
                            <option value="baby-shower">Baby Shower</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Título
                          </label>
                          <input
                            type="text"
                            value={editingEvent.title}
                            onChange={(e) => setEditingEvent({
                              ...editingEvent,
                              title: e.target.value
                            })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Subtítulo
                          </label>
                          <input
                            type="text"
                            value={editingEvent.subtitle || ''}
                            onChange={(e) => setEditingEvent({
                              ...editingEvent,
                              subtitle: e.target.value
                            })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Fecha
                            </label>
                            <input
                              type="date"
                              value={editingEvent.date}
                              onChange={(e) => setEditingEvent({
                                ...editingEvent,
                                date: e.target.value
                              })}
                              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Hora
                            </label>
                            <input
                              type="time"
                              value={editingEvent.time || '15:00'}
                              onChange={(e) => setEditingEvent({
                                ...editingEvent,
                                time: e.target.value
                              })}
                              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Ubicación
                          </label>
                          <input
                            type="text"
                            value={editingEvent.location}
                            onChange={(e) => setEditingEvent({
                              ...editingEvent,
                              location: e.target.value
                            })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Descripción
                          </label>
                          <textarea
                            value={editingEvent.description || ''}
                            onChange={(e) => setEditingEvent({
                              ...editingEvent,
                              description: e.target.value
                            })}
                            rows={4}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            URL de la Imagen
                          </label>
                          <input
                            type="url"
                            value={editingEvent.imageUrl || ''}
                            onChange={(e) => setEditingEvent({
                              ...editingEvent,
                              imageUrl: e.target.value
                            })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                          />
                        </div>
                        
                        {/* Contenido del formulario - sin botones aquí */}
                      </div>
                      ) : (
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-white mb-4">Gestionar Secciones</h4>
                          <div className="space-y-4">
                        {editingEvent?.sections && Object.entries(editingEvent.sections).map(([sectionKey, section]) => (
                              <div key={section.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                <div className="flex-1">
                                  <h5 className="font-medium text-white">{section.title}</h5>
                                  <p className="text-sm text-slate-400">{section.description}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={section.enabled}
                                    onChange={() => {
                                      if (!editingEvent?.sections) return;
                                      setEditingEvent({
                                        ...editingEvent,
                                        sections: {
                                          ...editingEvent.sections,
                                          [sectionKey]: {
                                            ...section,
                                            enabled: !section.enabled
                                          }
                                        }
                                      });
                                    }}
                                    className="sr-only peer"
                                    aria-label={`${section.title} - ${section.enabled ? 'Desactivar' : 'Activar'} sección`}
                                  />
                                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 peer-checked:ring-2 peer-checked:ring-blue-500/50 transition-colors duration-200 ease-in-out relative">
                                    <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform duration-200 ease-in-out ${section.enabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    <span className="sr-only">
                                      {section.enabled ? 'Activado' : 'Desactivado'}
                                    </span>
                                  </div>
                                  <span className="ml-2 text-sm font-medium text-slate-400">
                                    {section.enabled ? 'Activado' : 'Desactivado'}
                                  </span>
                                </label>
                              </div>
                            ))}
                          </div>
                          
                          <div className="pt-4 border-t border-slate-700 mt-6">
                            <h5 className="text-sm font-medium text-slate-400 mb-3">Configuración Avanzada</h5>
                            {editingEvent?.sections['gift-catalog']?.enabled && (
                              <div className="space-y-3 bg-slate-800/50 p-4 rounded-lg mb-4">
                                <h6 className="font-medium text-white">Configuración de Lista de Regalos</h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={(editingEvent.sections['gift-catalog'].config?.showCategories as boolean) ?? true}
                                      onChange={(e) => {
                                        const newConfig = {
                                          ...editingEvent.sections['gift-catalog'].config,
                                          showCategories: e.target.checked
                                        };
                                        setEditingEvent({
                                          ...editingEvent,
                                          sections: {
                                            ...editingEvent.sections,
                                            'gift-catalog': {
                                              ...editingEvent.sections['gift-catalog'],
                                              config: newConfig
                                            }
                                          }
                                        });
                                      }}
                                      className="rounded border-slate-600 text-blue-500 focus:ring-blue-400"
                                    />
                                    <span className="text-sm text-slate-300">Mostrar categorías</span>
                                  </label>
                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={(editingEvent.sections['gift-catalog'].config?.showStores as boolean) ?? true}
                                      onChange={(e) => {
                                        const newConfig = {
                                          ...editingEvent.sections['gift-catalog'].config,
                                          showStores: e.target.checked
                                        };
                                        setEditingEvent({
                                          ...editingEvent,
                                          sections: {
                                            ...editingEvent.sections,
                                            'gift-catalog': {
                                              ...editingEvent.sections['gift-catalog'],
                                              config: newConfig
                                            }
                                          }
                                        });
                                      }}
                                      className="rounded border-slate-600 text-blue-500 focus:ring-blue-400"
                                    />
                                    <span className="text-sm text-slate-300">Mostrar tiendas</span>
                                  </label>
                                </div>
                              </div>
                            )}
                            
                            {editingEvent?.sections?.['predictions']?.enabled && (
                              <div className="space-y-3 bg-slate-800/50 p-4 rounded-lg">
                                <h6 className="font-medium text-white">Configuración de Predicciones</h6>
                                <div className="space-y-2">
                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={(editingEvent.sections['predictions']?.config?.allowNameSuggestions as boolean) ?? true}
                                      onChange={(e) => {
                                        if (!editingEvent?.sections?.['predictions']) return;
                                        
                                        const newConfig = {
                                          ...editingEvent.sections['predictions']?.config,
                                          allowNameSuggestions: e.target.checked
                                        } as Record<string, unknown>;
                                        
                                        setEditingEvent(prev => {
                                          if (!prev) return prev;
                                          return {
                                            ...prev,
                                            sections: {
                                              ...prev.sections,
                                              predictions: {
                                                ...prev.sections?.['predictions'],
                                                config: newConfig
                                              }
                                            }
                                          };
                                        });
                                      }}
                                      className="rounded border-slate-600 text-blue-500 focus:ring-blue-400"
                                    />
                                    <span className="text-sm text-slate-300">Permitir sugerencias de nombres</span>
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      </form>
                    </div>
                    
                    {/* Sticky Footer */}
                    <div className="sticky bottom-0 border-t border-slate-700 p-4 bg-slate-800">
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 text-gray-300 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          form="event-form"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          Guardar Cambios
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminPanel;