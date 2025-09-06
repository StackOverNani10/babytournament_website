import React, { useState, useRef, useEffect } from 'react';
import { X, Gift, User, Mail, Check } from 'lucide-react';
import { Product } from '../../../types';
import { useApp } from '../../../context/AppContext';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

const getThemeColors = (theme: string) => {
  switch (theme) {
    case 'boy':
      return {
        primary: 'bg-blue-600 hover:bg-blue-700',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
        gradient: 'from-blue-50 to-blue-100',
        icon: 'text-blue-500',
        focus: 'focus:ring-blue-500 focus:border-blue-500',
        success: 'text-blue-500',
        border: 'border-blue-200',
        text: 'text-gray-800',
        ring: 'ring-blue-500',
        hover: 'hover:bg-blue-50',
        active: 'bg-blue-100'
      };
    case 'girl':
      return {
        primary: 'bg-pink-600 hover:bg-pink-700',
        outline: 'border-2 border-pink-600 text-pink-600 hover:bg-pink-50',
        gradient: 'from-pink-50 to-pink-100',
        icon: 'text-pink-500',
        focus: 'focus:ring-pink-500 focus:border-pink-500',
        success: 'text-pink-500',
        border: 'border-pink-200',
        text: 'text-gray-800',
        ring: 'ring-pink-500',
        hover: 'hover:bg-pink-50',
        active: 'bg-pink-100'
      };
    default:
      return {
        primary: 'bg-yellow-500 hover:bg-yellow-600',
        outline: 'border-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50',
        gradient: 'from-yellow-50 to-yellow-100',
        icon: 'text-yellow-500',
        focus: 'focus:ring-yellow-500 focus:border-yellow-500',
        success: 'text-yellow-500',
        border: 'border-yellow-200',
        text: 'text-gray-800',
        ring: 'ring-yellow-500',
        hover: 'hover:bg-yellow-50',
        active: 'bg-yellow-100'
      };
  }
};

interface ReservationModalProps {
  product: Product;
  onClose: () => void;
  maxQuantity: number;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ product, onClose, maxQuantity }) => {
  const { selectedTheme, addReservation, currentEvent, stores: allStores } = useApp();
  const theme = selectedTheme || 'neutral';
  const themeColors = getThemeColors(theme);
  const [isQuantityOpen, setIsQuantityOpen] = useState(false);
  const quantityRef = useRef<HTMLDivElement>(null);
  const store = allStores.find(s => s.id === product.storeId);
  
  // Cerrar el menú al hacer clic o tocar fuera
  useEffect(() => {
    const handleInteractionOutside = (event: MouseEvent | TouchEvent) => {
      if (quantityRef.current && !quantityRef.current.contains(event.target as Node)) {
        setIsQuantityOpen(false);
      }
    };

    // Agregar los event listeners cuando el menú está abierto
    if (isQuantityOpen) {
      // Para interacciones con mouse
      document.addEventListener('mousedown', handleInteractionOutside);
      // Para interacciones táctiles
      document.addEventListener('touchstart', handleInteractionOutside);
      // Prevenir el scroll cuando el menú está abierto
      document.body.style.overflow = 'hidden';
    }

    // Limpiar los event listeners
    return () => {
      document.removeEventListener('mousedown', handleInteractionOutside);
      document.removeEventListener('touchstart', handleInteractionOutside);
      document.body.style.overflow = '';
    };
  }, [isQuantityOpen]);
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    quantity: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Debug current state
    console.log('Submitting reservation with currentEvent:', currentEvent);
    console.log('Product:', product);
    console.log('Form data:', formData);
    
    // Check if we have a current event
    if (!currentEvent) {
      const errorMsg = 'No hay un evento activo. Por favor, actualiza la página e intenta de nuevo.';
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }
    
    // Basic validation
    if (!formData.guestName.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }
    
    if (!formData.guestEmail.trim()) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guestEmail.trim())) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }
    
    if (formData.quantity < 1) {
      setError('La cantidad debe ser al menos 1');
      return;
    }
    
    if (formData.quantity > maxQuantity) {
      const errorMsg = `No hay suficiente disponibilidad. Máximo disponible: ${maxQuantity}`;
      console.warn(errorMsg, { requested: formData.quantity, available: maxQuantity });
      setError(errorMsg);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const reservationData = {
        eventId: currentEvent.id,
        productId: product.id,
        guestName: formData.guestName.trim(),
        guestEmail: formData.guestEmail.trim(),
        quantity: formData.quantity,
        status: 'reserved' as const,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Creating reservation with data:', reservationData);
      await addReservation(reservationData);
      
      setIsSuccess(true);
      
    } catch (error) {
      console.error('Reservation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Hubo un error al procesar tu reserva. Intenta nuevamente.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateWhatsAppMessage = () => {
    const eventTitle = currentEvent?.title || 'el evento';
    const message = `¡Hola! He reservado el regalo "${product.name}" para ${eventTitle}. 

Detalles:
- Producto: ${product.name}
- Cantidad: ${formData.quantity}
- Precio: $${product.price.toFixed(2)}
- Tienda: ${store?.name}
- Invitado: ${formData.guestName}

¡Nos vemos en el evento! 🎉`;
    
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md text-center" shadow="lg">
          <div className={`${themeColors.success} mb-4`}>
            <Check size={64} className="mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Reserva Confirmada!
          </h3>
          <p className="text-gray-600 mb-4">
            Tu regalo ha sido reservado exitosamente
          </p>
          <div className="space-y-2">
            <Button
              onClick={() => window.open(generateWhatsAppMessage(), '_blank')}
              variant="secondary"
              className="w-full mb-2"
            >
              Compartir por WhatsApp
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Cerrar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" shadow="lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Gift className={themeColors.icon} />
            Reservar Regalo
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Product Summary */}
        <div className={`bg-gradient-to-r ${themeColors.gradient} rounded-lg p-4 mb-6`}>
          <div className="flex items-center gap-4">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
              <p className="text-gray-600">
                <span className={`text-2xl font-bold ${theme === 'boy' ? 'text-blue-600' : theme === 'girl' ? 'text-pink-600' : 'text-yellow-600'}`}>
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-sm ml-2">en {store?.name}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Disponibles: {maxQuantity} unidades
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          {/* Guest Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-1" />
              Tu Nombre *
            </label>
            <input
              type="text"
              required
              value={formData.guestName}
              onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
              className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-colors ${themeColors.focus}`}
              placeholder="Ingresa tu nombre completo"
            />
          </div>

          {/* Guest Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail size={16} className="inline mr-1" />
              Tu Email *
            </label>
            <input
              type="email"
              required
              value={formData.guestEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, guestEmail: e.target.value }))}
              className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-colors ${themeColors.focus}`}
              placeholder="tu-email@ejemplo.com"
            />
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad
            </label>
            <div className="relative" ref={quantityRef}>
              {/* Hidden select for form submission */}
              <select 
                name="quantity" 
                value={formData.quantity} 
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                className="sr-only"
              >
                {Array.from({ length: Math.min(maxQuantity, 10) }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'unidad' : 'unidades'}
                  </option>
                ))}
              </select>
              
              {/* Custom select button */}
              <button
                type="button"
                onClick={() => setIsQuantityOpen(!isQuantityOpen)}
                className={`relative w-full pl-4 pr-10 py-3 text-left bg-white border ${themeColors.border} rounded-xl shadow-sm ${themeColors.text} focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeColors.ring} transition-all duration-200`}
              >
                <span className="block truncate">
                  {formData.quantity} {formData.quantity === 1 ? 'unidad' : 'unidades'}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className={`h-5 w-5 ${themeColors.icon}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </button>

              {/* Custom dropdown options */}
              {isQuantityOpen && (
                <>
                  {/* Overlay semi-transparente para cerrar al hacer clic o tocar fuera */}
                  <div 
                    className="fixed inset-0 z-10 bg-black bg-opacity-10"
                    onClick={() => setIsQuantityOpen(false)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      setIsQuantityOpen(false);
                    }}
                  />
                  
                  <div className="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    <div className="max-h-60 overflow-auto py-1">
                      {Array.from({ length: Math.min(maxQuantity, 10) }, (_, i) => i + 1).map((num) => {
                        const isSelected = formData.quantity === num;
                        return (
                          <div
                            key={num}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, quantity: num }));
                              setIsQuantityOpen(false);
                            }}
                            className={`px-4 py-3 cursor-pointer transition-colors ${
                              isSelected
                                ? theme === 'boy'
                                  ? 'bg-blue-50 text-blue-900 font-medium'
                                  : theme === 'girl'
                                  ? 'bg-pink-50 text-pink-900 font-medium'
                                  : 'bg-yellow-50 text-yellow-900 font-medium'
                                : 'text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>
                                {num} {num === 1 ? 'unidad' : 'unidades'}
                              </span>
                              {isSelected && (
                                <svg
                                  className={`h-5 w-5 ${
                                    theme === 'boy'
                                      ? 'text-blue-600'
                                      : theme === 'girl'
                                      ? 'text-pink-600'
                                      : 'text-yellow-600'
                                  }`}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total:</span>
              <span className={`text-2xl font-bold ${
                theme === 'boy' 
                  ? 'text-blue-600' 
                  : theme === 'girl' 
                    ? 'text-pink-600' 
                    : 'text-yellow-600'
              }`}>
                ${(product.price * formData.quantity).toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {formData.quantity} × ${product.price.toFixed(2)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'} ${theme === 'boy' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : theme === 'girl' ? 'bg-pink-100 text-pink-700 hover:bg-pink-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-white transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'} ${theme === 'boy' ? 'bg-blue-600 hover:bg-blue-700' : theme === 'girl' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
            >
              {isSubmitting ? 'Reservando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ReservationModal;