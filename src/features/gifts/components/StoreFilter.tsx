import React, { useState, useRef, useEffect } from 'react';
import { Store } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { ChevronDown, Store as StoreIcon, X } from 'lucide-react';

interface StoreFilterProps {
  stores: Store[];
  selected: string;
  onSelect: (storeId: string) => void;
}

const StoreFilter: React.FC<StoreFilterProps> = ({ stores, selected, onSelect }) => {
  const { selectedTheme } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getThemeClasses = () => {
    switch (selectedTheme) {
      case 'boy':
        return {
          bg: 'bg-white',
          text: 'text-gray-800',
          border: 'border-blue-200',
          hover: 'hover:bg-blue-50',
          active: 'bg-blue-100',
          primary: 'text-blue-600',
          ring: 'ring-blue-500',
          icon: 'text-blue-500',
          shadow: 'shadow-blue-100'
        };
      case 'girl':
        return {
          bg: 'bg-white',
          text: 'text-gray-800',
          border: 'border-pink-200',
          hover: 'hover:bg-pink-50',
          active: 'bg-pink-100',
          primary: 'text-pink-600',
          ring: 'ring-pink-500',
          icon: 'text-pink-500',
          shadow: 'shadow-pink-100'
        };
      default:
        return {
          bg: 'bg-white',
          text: 'text-gray-800',
          border: 'border-yellow-200',
          hover: 'hover:bg-yellow-50',
          active: 'bg-yellow-100',
          primary: 'text-yellow-600',
          ring: 'ring-yellow-500',
          icon: 'text-yellow-500',
          shadow: 'shadow-yellow-100'
        };
    }
  };

  const theme = getThemeClasses();

  const selectedStore = selected === 'all' 
    ? { id: 'all', name: 'Todas las tiendas' } 
    : stores.find(store => store.id === selected);

  const handleSelect = (storeId: string) => {
    onSelect(storeId);
    setIsOpen(false);
  };

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 ${theme.bg} ${theme.border} border rounded-xl shadow-sm ${theme.text} focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.ring} transition-all duration-200`}
      >
        <div className="flex items-center space-x-3">
          <StoreIcon size={18} className={theme.icon} />
          <span className="block truncate font-medium">
            {selectedStore?.name || 'Seleccionar tienda'}
          </span>
        </div>
        <ChevronDown size={18} className={`${theme.icon} transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-10 mt-1 w-full ${theme.bg} shadow-lg rounded-xl border ${theme.border} max-h-60 overflow-auto focus:outline-none`}>
          <div 
            className={`cursor-pointer px-4 py-3 flex items-center space-x-3 ${theme.hover} ${selected === 'all' ? theme.active : ''} transition-colors duration-150`}
            onClick={() => handleSelect('all')}
          >
            <StoreIcon size={16} className={theme.icon} />
            <span className="block">Todas las tiendas</span>
            {selected === 'all' && (
              <span className="ml-auto">
                <svg className={`h-5 w-5 ${theme.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </div>
          
          {stores.map((store) => (
            <div 
              key={store.id}
              className={`cursor-pointer px-4 py-3 flex items-center space-x-3 ${theme.hover} ${selected === store.id ? theme.active : ''} transition-colors duration-150`}
              onClick={() => handleSelect(store.id)}
            >
              <StoreIcon size={16} className={theme.icon} />
              <span className="block">{store.name}</span>
              {selected === store.id && (
                <span className="ml-auto">
                  <svg className={`h-5 w-5 ${theme.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreFilter;