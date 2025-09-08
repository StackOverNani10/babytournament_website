import React, { useState } from 'react';
import { ShoppingBag, Users, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { Product } from '../../../types';
import { useApp } from '../../../context/AppContext';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Card from '../../../components/ui/Card';
import ReservationModal from '../../reservation/components/ReservationModal';

interface ProductCardProps {
  product: Product;
  theme?: 'boy' | 'girl' | 'neutral';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, theme = 'neutral' }) => {
  const { categories, stores, getAvailableQuantity, isProductAvailable, getProductReservations } = useApp();
  const [showModal, setShowModal] = useState(false);

  // Helper function to determine text color based on background color
  const getContrastColor = (hexColor?: string) => {
    if (!hexColor) return 'white';
    
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Use black text for light colors, white for dark colors
    return luminance > 0.5 ? 'black' : 'white';
  };

  const store = stores.find(s => s.id === product.storeId);
  const category = categories.find(c => c.id === product.categoryId);
  const availableQuantity = getAvailableQuantity(product.id);
  const isAvailable = isProductAvailable(product.id);
  const productReservations = getProductReservations(product.id);
  const totalReserved = productReservations
    .filter(r => r.status !== 'cancelled')
    .reduce((sum, r) => sum + r.quantity, 0);
  
  // Get the appropriate URL for the product
  const productUrl = product.productUrl || store?.website;

  const getAvailabilityStatus = () => {
    if (!isAvailable) {
      return { color: 'error', text: 'Objetivo Cubierto', icon: CheckCircle };
    }
    if (availableQuantity <= 2) {
      return { color: 'warning', text: `Solo ${availableQuantity} disponibles`, icon: AlertTriangle };
    }
    return { color: 'success', text: `${availableQuantity} disponibles`, icon: CheckCircle };
  };

  const status = getAvailabilityStatus();
  const StatusIcon = status.icon;

  const getThemeColors = () => {
    switch (theme) {
      case 'boy':
        return {
          hover: 'group-hover:text-blue-600',
          primary: 'text-blue-600',
          gradient: 'from-blue-500 to-blue-400',
          bgHover: 'hover:bg-blue-50',
          border: 'border-blue-200',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          buttonOutline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
          badge: 'bg-blue-100 text-blue-800',
          price: 'text-blue-600',
          icon: 'text-blue-500',
          overlay: 'from-blue-500/20 to-transparent'
        };
      case 'girl':
        return {
          hover: 'group-hover:text-pink-600',
          primary: 'text-pink-600',
          gradient: 'from-pink-500 to-pink-400',
          bgHover: 'hover:bg-pink-50',
          border: 'border-pink-200',
          button: 'bg-pink-600 hover:bg-pink-700 text-white',
          buttonOutline: 'border-2 border-pink-600 text-pink-600 hover:bg-pink-50',
          badge: 'bg-pink-100 text-pink-800',
          price: 'text-pink-600',
          icon: 'text-pink-500',
          overlay: 'from-pink-500/20 to-transparent'
        };
      default:
        return {
          hover: 'group-hover:text-yellow-600',
          primary: 'text-yellow-600',
          gradient: 'from-yellow-500 to-yellow-400',
          bgHover: 'hover:bg-yellow-50',
          border: 'border-yellow-200',
          button: 'bg-yellow-500 hover:bg-yellow-600 text-gray-900',
          buttonOutline: 'border-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50',
          badge: 'bg-yellow-100 text-yellow-800',
          price: 'text-yellow-600',
          icon: 'text-yellow-500',
          overlay: 'from-yellow-500/20 to-transparent'
        };
    }
  };

  const themeColors = getThemeColors();

  return (
    <>
      <Card className={`group flex flex-col h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden ${themeColors.border} border`} shadow="sm">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${themeColors.overlay} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge className={`${themeColors.badge} font-medium`} size="sm">
              {category?.name}
            </Badge>
          </div>
          
          {/* Availability Status */}
          <div className="absolute top-3 right-3">
            <Badge variant={status.color as any} size="sm">
              <StatusIcon size={12} className="mr-1" />
              {availableQuantity}
            </Badge>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col p-4 h-full">
          {/* Contenido superior - Ocupa el espacio disponible */}
          <div className="space-y-3 flex-grow">
            <div>
              <h3 className={`font-semibold text-lg text-gray-800 line-clamp-2 ${themeColors.hover} transition-colors min-h-[3rem]`}>
                {product.name}
              </h3>
              {product.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2 min-h-[2.5rem]">
                  {product.description}
                </p>
              )}
            </div>

            {/* Price and Store */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${themeColors.price}`}>${product.price.toFixed(2)}</span>
              </div>
              {store && (
                <div className="mt-1">
                  <Badge 
                    className={`font-medium ${!store.color ? themeColors.badge : ''}`}
                    size="sm"
                    customColor={store.color ? {
                      background: store.color,
                      text: getContrastColor(store.color)
                    } : undefined}
                  >
                    {store.name}
                  </Badge>
                </div>
              )}
            </div>

            {/* Suggested Quantity */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users size={16} />
              <span>Sugerido: {product.suggestedQuantity} unidades</span>
            </div>

            {/* Progress Bar */}
            {product.maxQuantity && (
              <div className="space-y-1 mt-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progreso</span>
                  <span>{totalReserved}/{product.maxQuantity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${themeColors.gradient} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${(totalReserved / product.maxQuantity) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Sección fija en la parte inferior */}
          <div className="pt-2 border-t border-gray-100">
            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => setShowModal(true)}
                disabled={!isAvailable}
                className={`flex-1 ${
                  theme === 'boy' ? 'bg-blue-600 hover:bg-blue-700' :
                  theme === 'girl' ? 'bg-pink-600 hover:bg-pink-700' :
                  'bg-yellow-600 hover:bg-yellow-700'
                }`}
                size="sm"
                icon={ShoppingBag}
              >
                {isAvailable ? 'Seleccionar' : 'Completo'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                icon={ExternalLink}
                onClick={(e) => {
                  e.stopPropagation();
                  const url = product.productUrl || store?.website;
                  if (url) {
                    // Ensure the URL has a protocol
                    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
                    window.open(formattedUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
                disabled={!productUrl}
                title={productUrl ? 'Ver producto en la tienda' : 'No hay enlace disponible'}
                className={`px-3 ${
                  !productUrl ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  theme === 'boy' ? 'border-blue-600 text-blue-600 hover:bg-blue-50' :
                  theme === 'girl' ? 'border-pink-600 text-pink-600 hover:bg-pink-50' :
                  'border-yellow-600 text-yellow-600 hover:bg-yellow-50'
                }`}
              >
                Ver
              </Button>
            </div>

            {/* Reserved by count */}
            {productReservations.filter(r => r.status !== 'cancelled').length > 0 && (
              <div className="text-xs text-gray-500 text-center pt-2 mt-2">
                Reservado por {productReservations.filter(r => r.status !== 'cancelled').length} 
                {productReservations.filter(r => r.status !== 'cancelled').length === 1 ? ' invitado' : ' invitados'}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Reservation Modal */}
      {showModal && (
        <ReservationModal
          product={product}
          onClose={() => setShowModal(false)}
          maxQuantity={availableQuantity}
        />
      )}
    </>
  );
};

export default ProductCard;