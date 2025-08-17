import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Heart, DollarSign } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import StoreFilter from './StoreFilter';
import Card from '../../../components/ui/Card';

interface GiftCatalogProps {
  theme?: 'boy' | 'girl' | 'neutral';
}

const GiftCatalog: React.FC<GiftCatalogProps> = ({ theme = 'neutral' }) => {
  const { products, categories, stores, currentEvent } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [isMounted, setIsMounted] = useState(false);

  // Filter products based on event type
  const eventProducts = useMemo(() => {
    return products.filter(product =>
      !product.eventType || product.eventType.includes(currentEvent.type)
    );
  }, [products, currentEvent.type]);

  // Calculate max price
  const maxPrice = useMemo(() =>
    eventProducts.length > 0 ? Math.max(...eventProducts.map(p => p.price)) : 0,
    [eventProducts]
  );

  // Initialize price range after maxPrice is available
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice || 0]);

  // Update price range when maxPrice changes
  useEffect(() => {
    if (maxPrice > 0 && priceRange[1] !== maxPrice) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice]);

  // Efecto para manejar el montaje del componente
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'popularity'>('name');

  // Cerrar el menú desplegable al hacer clic fuera
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Apply filters
  const filteredProducts = useMemo(() => {
    let filtered = eventProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
      const matchesStore = selectedStore === 'all' || product.storeId === selectedStore;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesStore && matchesPrice;
    });

    // Sort products
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'popularity':
          // This would be based on actual reservation data
          return b.suggestedQuantity - a.suggestedQuantity;
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [eventProducts, searchTerm, selectedCategory, selectedStore, priceRange, sortBy]);

  const getThemeColors = () => {
    switch (theme) {
      case 'boy':
        return {
          primary: 'text-blue-600',
          secondary: 'text-cyan-500',
          bg: 'from-blue-50 to-cyan-50',
          button: 'focus:ring-blue-500 focus:border-blue-500'
        };
      case 'girl':
        return {
          primary: 'text-pink-600',
          secondary: 'text-rose-500',
          bg: 'from-pink-50 to-rose-50',
          button: 'focus:ring-pink-500 focus:border-pink-500'
        };
      default:
        return {
          primary: 'text-yellow-600',
          secondary: 'text-indigo-500',
          bg: 'from-yellow-50 to-indigo-50',
          button: 'focus:ring-yellow-500 focus:border-yellow-500'
        };
    }
  };

  const themeColors = getThemeColors();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className={`bg-gradient-to-r ${themeColors.bg} border-0`}>
        <div className="text-center">
          <h2 className={`text-3xl font-bold ${themeColors.primary} mb-2`}>
            🎁 Catálogo de Regalos
          </h2>
          <p className="text-gray-700 text-lg">
            Ayuda a preparar la llegada del bebé de Rocío y Moisés
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Heart className={themeColors.secondary} size={16} />
              {filteredProducts.length} productos disponibles
            </span>
            <span className="flex items-center gap-1">
              <ShoppingCart className={themeColors.secondary} size={16} />
              Lista actualizada en tiempo real
            </span>
          </div>
        </div>
      </Card>

      {/* Search and Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 ${themeColors.button} transition-colors`}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 w-full sm:w-auto
                ${showFilters
                  ? theme === 'boy'
                    ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                    : theme === 'girl'
                      ? 'bg-pink-600 text-white shadow-md hover:bg-pink-700'
                      : 'bg-yellow-500 text-white shadow-md hover:bg-yellow-600'
                  : `border-2 ${theme === 'boy'
                    ? 'border-blue-200 text-blue-700 hover:bg-blue-50'
                    : theme === 'girl'
                      ? 'border-pink-200 text-pink-700 hover:bg-pink-50'
                      : 'border-yellow-200 text-yellow-700 hover:bg-yellow-50'}`}
              `}
            >
              <Filter size={18} />
              {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              {(selectedCategory !== 'all' || selectedStore !== 'all') && (
                <span className={`ml-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${theme === 'boy' ? 'bg-blue-100 text-blue-800' :
                    theme === 'girl' ? 'bg-pink-100 text-pink-800' :
                      'bg-yellow-100 text-yellow-800'
                  }`}>
                  !
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative w-full sm:w-64" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className={`w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border-2 focus:outline-none transition-all duration-200 ${theme === 'boy'
                    ? 'border-blue-200 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-blue-700'
                    : theme === 'girl'
                      ? 'border-pink-200 hover:bg-pink-50 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 text-pink-700'
                      : 'border-yellow-200 hover:bg-yellow-50 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 text-yellow-700'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className={`w-5 h-5 ${theme === 'boy' ? 'text-blue-500' :
                      theme === 'girl' ? 'text-pink-500' :
                        'text-yellow-500'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                  <span className="block truncate font-medium">
                    {sortBy === 'name' ? 'Ordenar por: Nombre' :
                      sortBy === 'price' ? 'Ordenar por: Precio' :
                        'Ordenar por: Popularidad'}
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 transition-transform duration-200 ${showSortDropdown ? 'transform rotate-180' : ''
                    } ${theme === 'boy' ? 'text-blue-500' :
                      theme === 'girl' ? 'text-pink-500' :
                        'text-yellow-500'
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showSortDropdown && (
                <div className={`absolute z-10 mt-1 w-full bg-white shadow-lg rounded-xl border-2 overflow-hidden ${theme === 'boy'
                    ? 'border-blue-200 ring-2 ring-blue-500 ring-opacity-50'
                    : theme === 'girl'
                      ? 'border-pink-200 ring-2 ring-pink-500 ring-opacity-50'
                      : 'border-yellow-200 ring-2 ring-yellow-500 ring-opacity-50'
                  }`}>
                  {[
                    { value: 'name', label: 'Ordenar por: Nombre' },
                    { value: 'price', label: 'Ordenar por: Precio' },
                    { value: 'popularity', label: 'Ordenar por: Popularidad' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSortBy(option.value as 'name' | 'price' | 'popularity');
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${sortBy === option.value
                          ? theme === 'boy'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : theme === 'girl'
                              ? 'bg-pink-50 text-pink-700 font-medium'
                              : 'bg-yellow-50 text-yellow-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <CategoryFilter
                  categories={categories}
                  selected={selectedCategory}
                  onSelect={setSelectedCategory}
                />
              </div>

              {/* Store Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tienda
                </label>
                <StoreFilter
                  stores={stores}
                  selected={selectedStore}
                  onSelect={setSelectedStore}
                />
              </div>

              {/* Price Range */}
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <DollarSign size={16} className="text-gray-500" />
                    Rango de Precio
                  </label>
                  <div className="px-3 py-1.5 text-xs font-medium rounded-full flex items-center gap-1 transition-all duration-200"
                    style={{
                      backgroundColor: theme === 'boy' ? 'rgba(37, 99, 235, 0.1)' :
                        theme === 'girl' ? 'rgba(236, 72, 153, 0.1)' :
                          'rgba(234, 179, 8, 0.1)',
                      color: theme === 'boy' ? '#1d4ed8' :
                        theme === 'girl' ? '#db2777' :
                          '#b45309',
                      border: `1px solid ${theme === 'boy' ? 'rgba(37, 99, 235, 0.2)' :
                          theme === 'girl' ? 'rgba(236, 72, 153, 0.2)' :
                            'rgba(234, 179, 8, 0.2)'
                        }`
                    }}>
                    <DollarSign size={12} />
                    <span>Hasta {priceRange[1].toFixed(2)}</span>
                  </div>
                </div>

                <div className="relative w-full px-4">
                  {/* Contenedor principal con ancho fijo */}
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    margin: '0 auto',
                    maxWidth: '100%',
                    padding: '0 12px' // Espacio para el control deslizante
                  }}>
                    {/* Track */}
                    <div
                      className={`h-2.5 rounded-full transition-colors duration-200 ${theme === 'boy' ? 'bg-blue-100' :
                          theme === 'girl' ? 'bg-pink-100' :
                            'bg-yellow-100'
                        }`}
                      style={{
                        position: 'relative',
                        opacity: isMounted ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                        width: '100%',
                        margin: '0 auto',
                        height: '10px',
                        pointerEvents: 'none' // Evitar que el track interfiera con los eventos
                      }}>
                      {/* Progress */}
                      <div
                        className={`absolute top-0 h-full rounded-full ${theme === 'boy' ? 'bg-blue-500' :
                            theme === 'girl' ? 'bg-pink-500' :
                              'bg-yellow-500'
                          }`}
                        style={{
                          width: `${(priceRange[1] / maxPrice) * 100}%`,
                          transition: 'width 0.2s ease',
                          left: 0,
                          right: 0,
                          maxWidth: '100%'
                        }}
                      ></div>
                    </div>

                    {/* Custom Thumb with Dollar Icon */}
                    <div
                      className="absolute -top-2 flex items-center justify-center w-8 h-8 rounded-full shadow-md cursor-pointer transition-all duration-100 active:scale-110 active:shadow-lg"
                      style={{
                        left: `calc(12px + (${(priceRange[1] / maxPrice) * 100}% * 0.88))`,
                        backgroundColor: theme === 'boy' ? '#2563eb' :
                          theme === 'girl' ? '#ec4899' :
                            '#eab308',
                        transform: 'translateX(-50%)',
                        touchAction: 'none',
                        userSelect: 'none',
                        opacity: isMounted ? 1 : 0,
                        transition: 'opacity 0.3s ease, transform 0.1s ease, box-shadow 0.1s ease, left 0.1s ease',
                        // Asegurarse de que el pulgar no se salga del contenedor
                        minWidth: '32px',
                        zIndex: 1, // Reducido de 10 a 1 para que no se superponga al menú
                        boxSizing: 'border-box'
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const slider = (e.currentTarget as HTMLElement)?.parentElement?.parentElement;
                        if (!slider) return;

                        // Agregar clase para transición suave
                        slider.classList.add('slider-dragging');

                        const rect = slider.getBoundingClientRect();
                        const updatePosition = (clientX: number) => {
                          requestAnimationFrame(() => {
                            let newLeft = ((clientX - rect.left) / rect.width) * 100;
                            newLeft = Math.min(Math.max(0, newLeft), 100);
                            const newValue = Math.round((newLeft / 100) * maxPrice);
                            setPriceRange(prev => [prev[0], newValue]);
                          });
                        };

                        const onMouseMove = (e: MouseEvent) => {
                          e.preventDefault();
                          updatePosition(e.clientX);
                        };

                        const onMouseUp = () => {
                          slider.classList.remove('slider-dragging');
                          document.removeEventListener('mousemove', onMouseMove);
                          document.removeEventListener('mouseup', onMouseUp);
                        };

                        updatePosition(e.clientX);
                        document.addEventListener('mousemove', onMouseMove, { passive: false });
                        document.addEventListener('mouseup', onMouseUp, { once: true });
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        const slider = (e.currentTarget as HTMLElement)?.parentElement?.parentElement;
                        if (!slider) return;

                        // Agregar clase para transición suave
                        slider.classList.add('slider-dragging');

                        const rect = slider.getBoundingClientRect();
                        const updatePosition = (clientX: number) => {
                          requestAnimationFrame(() => {
                            let newLeft = ((clientX - rect.left) / rect.width) * 100;
                            newLeft = Math.min(Math.max(0, newLeft), 100);
                            const newValue = Math.round((newLeft / 100) * maxPrice);
                            setPriceRange(prev => [prev[0], newValue]);
                          });
                        };

                        const onTouchMove = (e: TouchEvent) => {
                          e.preventDefault();
                          const touch = e.touches[0];
                          updatePosition(touch.clientX);
                        };

                        const onTouchEnd = () => {
                          slider.classList.remove('slider-dragging');
                          document.removeEventListener('touchmove', onTouchMove);
                          document.removeEventListener('touchend', onTouchEnd);
                        };

                        updatePosition(e.touches[0].clientX);
                        document.addEventListener('touchmove', onTouchMove, { passive: false });
                        document.addEventListener('touchend', onTouchEnd, { once: true });
                      }}
                    >
                      <DollarSign size={14} className="text-white" />
                    </div>

                    {/* Hidden input for accessibility */}
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      step="1"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Rango de precio"
                    />
                  </div>

                  <div className="flex items-center justify-between mt-4 px-2">
                    <span className="text-xs font-medium text-gray-500">
                      $0
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span className="font-medium">${priceRange[1].toFixed(2)}</span>
                      <span className="text-gray-400">/ ${maxPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-500">
              Intenta ajustar los filtros o buscar otros términos
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} theme={theme} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GiftCatalog;