import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../../../context/events/EventsContext';
import { useReservations } from '../../../context/reservations/ReservationsContext';
import { useApp } from '../../../context/AppContext';
import { usePredictions } from '../../../context/predictions/PredictionsContext';
import { Event, EventType } from '../../event/types/events';
import { Product, Category, Store } from '../../gifts/types/products';
import Layout from '../../../components/layout/Layout';
import Button from '../../../components/ui/Button';
import { BarChart3, Users, Gift, LogOut, TrendingUp, Filter, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

// Interfaces para las secciones
interface Section {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  order: number;
  config?: Record<string, any>;
  [key: string]: any; // Para permitir propiedades adicionales
}

interface Sections {
  [key: string]: Section;
}

// Standalone interface for predictions with guest info
interface Guest {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

interface AdminPanelProps {
  onLogout: () => void;
}

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
    cancelReservation,
    confirmReservation,
    refreshReservations,
    getProductReservations
  } = useReservations();

  const { products } = useApp();

  // Get predictions and guests data
  const { predictions: rawPredictions, loading: predictionsLoading, refreshPredictions } = usePredictions();
  const [guests, setGuests] = useState<Guest[]>([]);

  // Fetch guests data
  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const { data, error } = await supabase
          .from('guests')
          .select('*');

        if (error) throw error;

        setGuests(data || []);
      } catch (error) {
        console.error('Error fetching guests:', error);
      }
    };

    fetchGuests();
  }, []);

  // Process predictions to include guest information
  const predictions = useMemo(() => {
    return rawPredictions.map((prediction: any) => {
      // Find the guest for this prediction
      const guest = guests.find(g => g.id === prediction.guest_id);

      return {
        ...prediction,
        guest,
        guest_name: guest?.name || '',
        name_suggestion: prediction.name_suggestion || '',
        created_at: prediction.created_at || new Date().toISOString()
      };
    });
  }, [rawPredictions, guests]);

  // Load predictions when event changes
  useEffect(() => {
    refreshPredictions();
  }, [currentEvent?.id, refreshPredictions]);

  // Format date helper function
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Sin fecha';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';

      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Fecha inválida';
    }
  };

  // Helper function to format date for input[type="date"]
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    try {
      // If the date is already in YYYY-MM-DD format, return it as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }

      // Create a date object in the local timezone
      let date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      // Adjust for timezone offset to get the correct local date
      const timezoneOffset = date.getTimezoneOffset() * 60000;
      const localDate = new Date(date.getTime() + timezoneOffset);

      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error('Error formatting date for input:', e);
      return '';
    }
  };
  type TabType = 'overview' | 'reservations' | 'predictions' | 'products' | 'events';
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showFilter, setShowFilter] = useState(false);
  const [visiblePredictions, setVisiblePredictions] = useState(10);
  const [filters, setFilters] = useState({
    eventType: '' as EventType | '',
    storeId: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    lowStock: false
  });

  // State for product management
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewingProduct, setIsViewingProduct] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);

  // Initialize a new product with default values
  const initializeNewProduct = () => {
    const defaultProduct: Product = {
      id: '',
      name: '',
      categoryId: '',
      storeId: '',
      price: 0,
      imageUrl: '',
      description: '',
      suggestedQuantity: 1,
      maxQuantity: 10,
      eventType: [],
      isActive: true,
      productUrl: ''
    };

    setSelectedProduct(defaultProduct);
    setIsEditingProduct(true);
    setIsViewingProduct(false);
  };

  // Helper function to get product details
  const getProductDetails = (product: Product) => {
    const productReservations = reservations.filter(r => r.productId === product.id);
    const totalReserved = productReservations.reduce((sum, r) => sum + r.quantity, 0);
    const maxQty = product.maxQuantity || 10;
    const progress = Math.min((totalReserved / maxQty) * 100, 100);
    const isLowStock = totalReserved >= maxQty * 0.8;

    return { totalReserved, maxQty, progress, isLowStock };
  };
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
    boyPredictions: predictions?.filter(p => p.prediction === 'boy').length || 0,
    girlPredictions: predictions?.filter(p => p.prediction === 'girl').length || 0,
    totalNameSuggestions: predictions?.filter(p => p.name_suggestion).length || 0,
    totalMessages: predictions?.filter(p => p.message).length || 0,
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

  // State for data management
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);


  // Fetch categories, stores, and events
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        // Fetch stores
        const { data: storesData, error: storesError } = await supabase
          .from('stores')
          .select('*')
          .order('name');

        // We don't need to fetch events here since we're using them from the useEvents hook
        if (categoriesError) throw categoriesError;
        if (storesError) throw storesError;

        setCategories(categoriesData || []);
        setStores(storesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSaveProduct = async (e?: React.FormEvent) => {
    // Prevenir el comportamiento por defecto del formulario
    if (e) {
      e.preventDefault();
    }
    if (!selectedProduct) {
      console.error('No product selected');
      return;
    }

    try {
      // Validar campos requeridos
      if (!selectedProduct.name.trim()) {
        throw new Error('El nombre del producto es requerido');
      }
      if (selectedProduct.price === undefined || selectedProduct.price < 0) {
        throw new Error('El precio debe ser un número positivo');
      }
      if (!selectedProduct.imageUrl) {
        throw new Error('La URL de la imagen es requerida');
      }

      // Prepare the product data with proper types and field names
      const productData: any = {
        // Only include the ID if it exists (for updates)
        ...(selectedProduct.id && { id: selectedProduct.id }),

        // Required fields
        name: selectedProduct.name.trim(),
        price: Number(selectedProduct.price) || 0,

        // Optional fields with proper snake_case names
        ...(selectedProduct.categoryId && { category_id: selectedProduct.categoryId }),
        ...(selectedProduct.storeId && { store_id: selectedProduct.storeId }),
        image_url: selectedProduct.imageUrl, // Hacer obligatorio
        ...(selectedProduct.description && { description: selectedProduct.description }),
        suggested_quantity: selectedProduct.suggestedQuantity !== undefined
          ? Number(selectedProduct.suggestedQuantity)
          : 1,
        max_quantity: selectedProduct.maxQuantity !== undefined
          ? Number(selectedProduct.maxQuantity)
          : 10,
        event_type: Array.isArray(selectedProduct.eventType)
          ? selectedProduct.eventType.filter(Boolean)
          : [],
        is_active: selectedProduct.isActive !== false,

        // Include product_url if it exists
        ...(selectedProduct.productUrl && { product_url: selectedProduct.productUrl })
      };

      console.log('Saving product:', productData);

      let result;
      if (selectedProduct.id) {
        // Actualizar producto existente
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', selectedProduct.id)
          .select();

        if (error) throw error;
        result = data?.[0];
      } else {
        // Crear nuevo producto
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select();

        if (error) throw error;
        result = data?.[0];
      }

      if (!result) {
        throw new Error('No se pudo guardar el producto');
      }

      // Mostrar mensaje de éxito
      toast.success(selectedProduct.id
        ? '¡Producto actualizado exitosamente!'
        : '¡Producto creado exitosamente!');

      // Cerrar el formulario y actualizar la lista de productos
      setIsEditingProduct(false);
      setSelectedProduct(null);

      // Recargar los productos para reflejar los cambios
      // Esto asume que tienes una función para cargar los productos
      // Si no la tienes, puedes recargar la página o implementar otra lógica de actualización
      window.location.reload();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(`Error al guardar el producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);

      // Mantener el formulario abierto para que el usuario pueda corregir los errores
      return;
    }
  };

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
                  className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === id
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
                            className={`h-full rounded-full transition-all duration-500 ${progress >= 80 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-blue-500 to-emerald-500'
                              }`}
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
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={reservation.status === 'confirmed' ? 'success' : 'default'}
                            className="text-xs px-2 py-1"
                          >
                            {reservation.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                          </Badge>
                          {reservation.status === 'pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmReservation(reservation.id);
                              }}
                              className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              title="Confirmar reserva"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Confirmar
                            </button>
                          )}
                        </div>
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

              {predictions.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-slate-800/50 rounded-lg">
                  No hay predicciones aún
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {predictions.slice(0, visiblePredictions).map((prediction: any) => {
                      const guestName = prediction.guest_name || prediction.guest?.name || 'Invitado';
                      const isBoy = prediction.prediction === 'boy';

                      return (
                        <div
                          key={prediction.id}
                          className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-white">
                              Por: {guestName}
                            </h5>
                            <div
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${isBoy
                                ? 'bg-blue-900/30 text-blue-400'
                                : 'bg-pink-900/30 text-pink-400'
                                }`}
                            >
                              {isBoy ? '👶 Niño' : '👧 Niña'}
                            </div>
                          </div>

                          <div className="bg-slate-900/50 p-3 rounded-lg mb-3">
                            <div className="space-y-2">
                              <div>
                                <div className="text-sm text-slate-300 font-medium">
                                  Nombre sugerido:
                                </div>
                                <div className="text-white font-medium">
                                  {prediction.name_suggestion || 'Sin nombre sugerido'}
                                </div>
                              </div>

                            </div>
                          </div>

                          <div className="flex justify-between items-center gap-4 text-xs text-slate-500">
                            <div className="flex-1 min-w-0">
                              {prediction.message && (
                                <div className="text-sm text-slate-300 italic break-words whitespace-pre-wrap max-h-24 overflow-y-auto pr-2">
                                  <span className="font-medium">Mensaje:</span> {prediction.message}
                                </div>
                              )}
                            </div>
                            {prediction.created_at && (
                              <div className="flex-shrink-0 whitespace-nowrap">
                                {new Date(prediction.created_at).toLocaleDateString('es-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {predictions.length > visiblePredictions && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setVisiblePredictions(prev => prev + 10)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Mostrar más predicciones
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {visiblePredictions > 10 && (
                    <div className="mt-2 text-center">
                      <button
                        onClick={() => setVisiblePredictions(10)}
                        className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
                      >
                        Mostrar menos
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h4 className="text-xl font-semibold text-white">
                  Gestión de Productos
                </h4>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilter(!showFilter)}
                    className="flex items-center gap-2 text-slate-300 border-slate-600 hover:bg-slate-700"
                  >
                    {showFilter ? (
                      <>
                        <X size={16} />
                        Ocultar Filtros
                      </>
                    ) : (
                      <>
                        <Filter size={16} />
                        Filtrar Productos
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={initializeNewProduct}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Agregar Producto
                  </Button>
                </div>
              </div>

              {/* Filtros */}
              {showFilter && (
                <div className="bg-slate-800/50 p-4 rounded-lg mb-6 border border-slate-700">
                  <h5 className="text-sm font-medium text-slate-300 mb-3">Filtros de Productos</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="w-full md:w-auto">
                      <label className="block text-sm font-medium text-slate-400 mb-1">Tipo de Evento</label>
                      <select
                        value={filters.eventType}
                        onChange={(e) => setFilters({ ...filters, eventType: e.target.value as EventType })}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Todos los eventos</option>
                        {events.map((event) => (
                          <option key={event.id} value={event.type}>
                            {event.title} ({event.type})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full md:w-auto">
                      <label className="block text-sm font-medium text-slate-400 mb-1">Tienda</label>
                      <select
                        value={filters.storeId}
                        onChange={(e) => setFilters({ ...filters, storeId: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Todas las tiendas</option>
                        {stores.map((store) => (
                          <option key={store.id} value={store.id}>
                            {store.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Precio Mínimo</label>
                      <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                        placeholder="Mínimo"
                        className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Precio Máximo</label>
                      <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                        placeholder="Máximo"
                        className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-end gap-4">
                      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.inStock}
                          onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                          className="rounded border-slate-600 text-blue-500 focus:ring-blue-500"
                        />
                        Solo en stock
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.lowStock}
                          onChange={(e) => setFilters({ ...filters, lowStock: e.target.checked })}
                          className="rounded border-slate-600 text-orange-500 focus:ring-orange-500"
                        />
                        Bajo stock
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products
                  .filter(product => {
                    // Si hay un filtro de tipo de evento aplicado
                    if (filters.eventType) {
                      // Verificar si el producto tiene el tipo de evento seleccionado
                      const hasMatchingEventType = product.eventType &&
                        (Array.isArray(product.eventType)
                          ? product.eventType.includes(filters.eventType)
                          : product.eventType === filters.eventType);

                      if (!hasMatchingEventType) return false;
                    }

                    // Filtrar por tienda
                    if (filters.storeId && product.storeId !== filters.storeId) return false;

                    // Filtrar por rango de precios
                    if (filters.minPrice && product.price < Number(filters.minPrice)) return false;
                    if (filters.maxPrice && product.price > Number(filters.maxPrice)) return false;

                    // Filtrar por disponibilidad
                    const productReservations = reservations.filter(r => r.productId === product.id);
                    const totalReserved = productReservations.reduce((sum, r) => sum + r.quantity, 0);
                    const maxQty = product.maxQuantity || 10;

                    if (filters.inStock && totalReserved >= maxQty) return false;
                    if (filters.lowStock && totalReserved < maxQty * 0.8) return false;

                    return true;
                  })
                  .map((product) => {
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
                            className="w-full h-full object-cover"
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
                                className={`h-full rounded-full transition-all duration-500 ${isLowStock ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-blue-500 to-emerald-500'
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
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsEditingProduct(true);
                              }}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500"
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsViewingProduct(true);
                              }}
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

          {/* Edit Product Modal */}
          {isEditingProduct && selectedProduct && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
              <div className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-slate-800 pt-6 px-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">
                      Editar Producto
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProduct(false);
                        setSelectedProduct(null);
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <span className="sr-only">Cerrar</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                  <form onSubmit={handleSaveProduct} className="space-y-6">
                    {/* Sección de información básica */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white border-b border-slate-700 pb-2">Información Básica</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                              Nombre del Producto <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={selectedProduct.name}
                              onChange={(e) =>
                                setSelectedProduct({
                                  ...selectedProduct,
                                  name: e.target.value,
                                })
                              }
                              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                              Categoría
                            </label>
                            <select
                              value={selectedProduct.categoryId || ''}
                              onChange={(e) =>
                                setSelectedProduct({
                                  ...selectedProduct,
                                  categoryId: e.target.value,
                                })
                              }
                              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                              <option value="">Seleccionar categoría</option>
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                              Tienda
                            </label>
                            <select
                              value={selectedProduct.storeId || ''}
                              onChange={(e) =>
                                setSelectedProduct({
                                  ...selectedProduct,
                                  storeId: e.target.value,
                                })
                              }
                              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                              <option value="">Seleccionar tienda</option>
                              {stores.map((store) => (
                                <option key={store.id} value={store.id}>
                                  {store.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                              URL del Producto
                            </label>
                            <input
                              type="url"
                              value={selectedProduct.productUrl || ''}
                              onChange={(e) =>
                                setSelectedProduct({
                                  ...selectedProduct,
                                  productUrl: e.target.value,
                                })
                              }
                              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              placeholder="https://ejemplo.com/producto"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sección de precios e inventario */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white border-b border-slate-700 pb-2">Precio e Inventario</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">
                            Precio <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                            <input
                              type="number"
                              value={selectedProduct.price === 0 ? '' : selectedProduct.price}
                              onChange={(e) => {
                                const value = e.target.value;
                                setSelectedProduct({
                                  ...selectedProduct,
                                  price: value === '' ? 0 : parseFloat(value) || 0,
                                });
                              }}
                              onBlur={(e) => {
                                if (e.target.value === '') {
                                  setSelectedProduct({
                                    ...selectedProduct,
                                    price: 0
                                  });
                                }
                              }}
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-8 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">
                            Cantidad Sugerida
                          </label>
                          <input
                            type="number"
                            value={selectedProduct.suggestedQuantity ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setSelectedProduct({
                                ...selectedProduct,
                                suggestedQuantity: value === '' ? undefined : Math.max(1, parseInt(value) || 1),
                              });
                            }}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                setSelectedProduct({
                                  ...selectedProduct,
                                  suggestedQuantity: 1
                                });
                              }
                            }}
                            min="1"
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="1"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">
                            Cantidad Máxima <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={selectedProduct.maxQuantity === undefined ? '' : selectedProduct.maxQuantity}
                            onChange={(e) => {
                              const value = e.target.value;
                              setSelectedProduct({
                                ...selectedProduct,
                                maxQuantity: value === '' ? undefined : Math.max(1, parseInt(value) || 1),
                              });
                            }}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                setSelectedProduct({
                                  ...selectedProduct,
                                  maxQuantity: 10
                                });
                              }
                            }}
                            min="1"
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="10"
                            required
                          />
                        </div>

                        <div className="flex items-end">
                          <div className="flex items-center space-x-3 bg-slate-800/50 rounded-lg p-4 w-full h-[60px]">
                            <input
                              type="checkbox"
                              id="isActive"
                              checked={selectedProduct.isActive !== false}
                              onChange={(e) =>
                                setSelectedProduct({
                                  ...selectedProduct,
                                  isActive: e.target.checked,
                                })
                              }
                              className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="isActive" className="block text-sm font-medium text-slate-300">
                              Producto Activo
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sección de medios y descripción */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white border-b border-slate-700 pb-2">Medios y Descripción</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">
                            URL de la Imagen <span className="text-red-500">*</span>
                            <span className="text-xs text-slate-500 block mt-1">Ingresa una URL de imagen válida</span>
                          </label>
                          <input
                            type="url"
                            value={selectedProduct.imageUrl}
                            onChange={(e) =>
                              setSelectedProduct({
                                ...selectedProduct,
                                imageUrl: e.target.value,
                              })
                            }
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">
                            Descripción
                            <span className="text-xs text-slate-500 block mt-1">Agrega una descripción detallada del producto</span>
                          </label>
                          <textarea
                            value={selectedProduct.description || ''}
                            onChange={(e) =>
                              setSelectedProduct({
                                ...selectedProduct,
                                description: e.target.value,
                              })
                            }
                            rows={4}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Describe el producto en detalle..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sección de eventos */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white border-b border-slate-700 pb-2">
                        Eventos Asociados <span className="text-red-500">*</span>
                        <span className="text-xs font-normal text-slate-400 block mt-1">
                          Selecciona los eventos para los que este producto está disponible
                        </span>
                      </h3>

                      <div className="space-y-2">
                        <div className="space-y-2 max-h-48 overflow-y-auto p-3 border border-slate-700 rounded-lg bg-slate-800/50">
                          {events.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">No hay eventos disponibles</p>
                          ) : (
                            events.map((event) => {
                              const isSelected = Array.isArray(selectedProduct.eventType)
                                ? selectedProduct.eventType.includes(event.type)
                                : false;

                              return (
                                <label key={event.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors">
                                  <div className={`flex-shrink-0 w-5 h-5 rounded border-2 ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-500'} flex items-center justify-center`}>
                                    {isSelected && (
                                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-white">{event.title}</span>
                                    <span className="text-xs text-slate-400 block">{event.type}</span>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      const currentEventTypes = Array.isArray(selectedProduct.eventType)
                                        ? [...selectedProduct.eventType]
                                        : [];

                                      let newEventTypes: EventType[];
                                      if (e.target.checked) {
                                        if (!currentEventTypes.includes(event.type)) {
                                          newEventTypes = [...currentEventTypes, event.type];
                                        } else {
                                          newEventTypes = currentEventTypes;
                                        }
                                      } else {
                                        newEventTypes = currentEventTypes.filter(et => et !== event.type);
                                      }

                                      setSelectedProduct({
                                        ...selectedProduct,
                                        eventType: newEventTypes
                                      });
                                    }}
                                    className="sr-only"
                                  />
                                </label>
                              );
                            })
                          )}
                        </div>

                        {selectedProduct.eventType && selectedProduct.eventType.length > 0 && (
                          <div className="mt-3">
                            <span className="text-xs font-medium text-slate-400 block mb-2">Eventos seleccionados:</span>
                            <div className="flex flex-wrap gap-2">
                              {selectedProduct.eventType.map((type, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-100"
                                >
                                  {type}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newEventTypes = selectedProduct.eventType?.filter((_, i) => i !== index);
                                      setSelectedProduct({
                                        ...selectedProduct,
                                        eventType: newEventTypes
                                      });
                                    }}
                                    className="ml-1.5 text-blue-300 hover:text-white transition-colors"
                                    aria-label="Quitar evento"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones del formulario */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-slate-700">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProduct(false);
                          setSelectedProduct(null);
                        }}
                        className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Guardar Cambios</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* View Product Details Modal */}
          {isViewingProduct && selectedProduct && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
              <div className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-slate-800 pt-6 px-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Detalles del Producto</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsViewingProduct(false);
                        setSelectedProduct(null);
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <span className="sr-only">Cerrar</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64 bg-slate-700 rounded-lg overflow-hidden">
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-white mb-2">{selectedProduct.name}</h4>
                      <p className="text-blue-400 text-xl font-bold mb-4">${selectedProduct.price.toFixed(2)}</p>

                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-slate-400 mb-1">Descripción</h5>
                        <p className="text-slate-300">
                          {selectedProduct.description || 'No hay descripción disponible'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h5 className="text-sm font-medium text-slate-400 mb-1">Categoría</h5>
                          <p className="text-slate-300">
                            {categories.find((c: Category) => c.id === selectedProduct.categoryId)?.name || 'No especificada'}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-slate-400 mb-1">Tienda</h5>
                          <p className="text-slate-300">
                            {stores.find((s: Store) => s.id === selectedProduct.storeId)?.name || 'No especificada'}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-slate-400 mb-1">Status</h5>
                        <p className="text-slate-300">
                          {selectedProduct.isActive ? 'Activo ✅' : 'Inactivo ❌'}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-slate-400 mb-2">Disponibilidad</h5>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2.5 rounded-full"
                            style={{ width: `${getProductDetails(selectedProduct).progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-slate-400 mt-1">
                          <span>{getProductDetails(selectedProduct).totalReserved} reservados</span>
                          <span>{getProductDetails(selectedProduct).maxQty - getProductDetails(selectedProduct).totalReserved} disponibles</span>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <Button
                          variant="outline"
                          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500"
                          onClick={() => {
                            setIsViewingProduct(false);
                            setSelectedProduct(selectedProduct);
                            setIsEditingProduct(true);
                          }}
                        >
                          Editar Producto
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
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

                            // Convertir sections de string a objeto si es necesario
                            let parsedSections: Record<string, any> = {};
                            if (typeof sections === 'string') {
                              try {
                                parsedSections = JSON.parse(sections);
                              } catch (error) {
                                console.error('Error al parsear las secciones:', error);
                                parsedSections = {};
                              }
                            } else if (sections && typeof sections === 'object') {
                              parsedSections = { ...sections };
                            }

                            // Combinar las secciones existentes con los valores por defecto
                            const mergedSections = Object.entries(defaultSections).reduce<Record<string, Section>>((acc, [key, defaultSection]) => {
                              const dbSection = parsedSections[key];

                              // Crear una nueva sección combinando los valores por defecto con los de la base de datos
                              const section: Section = {
                                ...defaultSection,
                                id: key,
                                // For 'enabled', only use the default if it's not defined in the database
                                enabled: dbSection?.enabled !== undefined ? dbSection.enabled : defaultSection.enabled,
                                // For order, use database value or default
                                order: dbSection?.order ?? defaultSection.order
                              };

                              // Manejar config solo si existe en alguna de las dos fuentes
                              if (dbSection?.config || (defaultSection as any).config) {
                                section.config = {
                                  ...((defaultSection as any).config || {}),
                                  ...(dbSection?.config || {})
                                };
                              }

                              return {
                                ...acc,
                                [key]: section
                              };
                            }, {});

                            setEditingEvent({
                              ...event,
                              sections: mergedSections as any // Usamos 'as any' temporalmente para evitar problemas de tipo
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
                          className={`pb-3 px-1 border-b-2 font-medium text-sm ${activeTabInEditor === 'details'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                        >
                          Detalles del Evento
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTabInEditor('sections')}
                          className={`pb-3 px-1 border-b-2 font-medium text-sm ${activeTabInEditor === 'sections'
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
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!editingEvent?.id) return;

                          try {
                            // Create a new object with only the fields we want to update
                            const { id, createdAt, isActive, imageUrl, ...updateData } = editingEvent;

                            // Prepare the data for the API call
                            const formattedData = {
                              ...updateData,
                              // Convert field names to match database schema
                              is_active: isActive,
                              image_url: imageUrl,
                              // Format date as YYYY-MM-DD string
                              date: (() => {
                                // If the date is already in YYYY-MM-DD format, return it as is
                                if (/^\d{4}-\d{2}-\d{2}$/.test(editingEvent.date)) {
                                  return editingEvent.date;
                                }

                                // Otherwise, parse the date and format it as YYYY-MM-DD
                                const date = new Date(editingEvent.date);
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');

                                return `${year}-${month}-${day}`;
                              })(),
                              // Only include time if it exists
                              ...(editingEvent.time && { time: editingEvent.time }),
                              // Ensure we're not sending any undefined values
                              ...Object.fromEntries(
                                Object.entries({
                                  title: updateData.title,
                                  subtitle: updateData.subtitle,
                                  location: updateData.location,
                                  description: updateData.description,
                                  type: updateData.type,
                                  sections: updateData.sections ?
                                    Object.entries(updateData.sections).reduce((acc, [key, value]) => {
                                      // Convert section keys to snake_case for the API
                                      const snakeKey = key.replace(/-/g, '_');
                                      return { ...acc, [snakeKey]: value };
                                    }, {}) : undefined
                                }).filter(([_, v]) => v !== undefined)
                              )
                            };

                            console.log('Updating event with data:', formattedData);

                            // Update the event
                            await updateEvent(editingEvent.id, formattedData);
                            setIsEditing(false);
                          } catch (error) {
                            console.error('Error al actualizar el evento:', error);
                            // Mostrar mensaje de error al usuario
                            toast.error('Error al guardar el evento. Por favor, verifica los datos e inténtalo de nuevo.');
                          }
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
                                <option value="">Selecciona un tipo de evento</option>
                                {events.map((event) => (
                                  <option key={event.id} value={event.type}>
                                    {event.title} ({event.type})
                                  </option>
                                ))}
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
                                  value={formatDateForInput(editingEvent.date)}
                                  onChange={(e) => {
                                    // Get the date string directly from the input (YYYY-MM-DD format)
                                    const dateString = e.target.value;

                                    // Update the date in the event
                                    setEditingEvent({
                                      ...editingEvent,
                                      date: dateString
                                    });
                                  }}
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

                                        // Crear una copia profunda de las secciones
                                        const updatedSections = { ...editingEvent.sections };

                                        // Actualizar el estado de la sección específica
                                        updatedSections[sectionKey] = {
                                          ...section,
                                          enabled: !section.enabled
                                        };

                                        // Actualizar el estado del evento
                                        setEditingEvent({
                                          ...editingEvent,
                                          sections: updatedSections
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