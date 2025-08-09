import React from 'react';
import { useApp } from '../context/AppContext';

// Extender las propiedades del botón para incluir las propiedades CSS personalizadas
declare module 'react' {
  interface CSSProperties {
    '--btn-primary-bg'?: string;
    '--btn-outline-text'?: string;
    '--btn-outline-hover'?: string;
    '--btn-outline-ring'?: string;
  }
}

interface GenderSwitcherProps {
  selectedGender: 'boy' | 'girl' | 'neutral';
  onGenderChange: (gender: 'boy' | 'girl' | 'neutral') => void;
}

const GenderSwitcher: React.FC<GenderSwitcherProps> = ({ selectedGender, onGenderChange }) => {
  const { selectedTheme } = useApp();
  
  const getThemeClasses = () => {
    switch (selectedTheme) {
      case 'boy':
        return {
          girl: {
            selected: 'from-blue-100 to-blue-50 border-blue-200 text-blue-800',
            unselected: 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50',
            icon: 'text-blue-500'
          },
          neutral: {
            selected: 'from-blue-50 to-white border-blue-100 text-blue-700',
            unselected: 'bg-white border-blue-100 text-blue-500 hover:bg-blue-50',
            icon: 'text-blue-400'
          },
          boy: {
            selected: 'from-blue-500 to-blue-600 text-white shadow-lg',
            unselected: 'bg-white border-blue-300 text-blue-600 hover:bg-blue-50',
            icon: 'text-white'
          }
        };
      case 'girl':
        return {
          girl: {
            selected: 'from-pink-500 to-rose-500 text-white shadow-lg',
            unselected: 'bg-white border-pink-300 text-pink-600 hover:bg-pink-50',
            icon: 'text-white'
          },
          neutral: {
            selected: 'from-pink-50 to-white border-pink-100 text-pink-700',
            unselected: 'bg-white border-pink-100 text-pink-500 hover:bg-pink-50',
            icon: 'text-pink-400'
          },
          boy: {
            selected: 'from-pink-100 to-pink-50 border-pink-200 text-pink-800',
            unselected: 'bg-white border-pink-200 text-pink-600 hover:bg-pink-50',
            icon: 'text-pink-500'
          }
        };
      default:
        return {
          girl: {
            selected: 'from-yellow-100 to-yellow-50 border-yellow-200 text-yellow-800',
            unselected: 'bg-white border-yellow-200 text-yellow-600 hover:bg-yellow-50',
            icon: 'text-yellow-500'
          },
          neutral: {
            selected: 'from-yellow-400 to-yellow-500 text-white shadow-lg',
            unselected: 'bg-white border-yellow-200 text-yellow-600 hover:bg-yellow-50',
            icon: 'text-white'
          },
          boy: {
            selected: 'from-yellow-50 to-white border-yellow-100 text-yellow-700',
            unselected: 'bg-white border-yellow-100 text-yellow-500 hover:bg-yellow-50',
            icon: 'text-yellow-400'
          }
        };
    }
  };
  
  const theme = getThemeClasses();
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ¿Qué crees que será? 
          <span className="animate-bounce inline-block">🤔</span>
        </h2>
        <p className="text-gray-600">
          Selecciona una opción para personalizar la experiencia
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { 
              id: 'boy', 
              label: 'Niño', 
              emoji: '👶',
              description: 'Ropa y accesorios para niño'
            },
            { 
              id: 'girl', 
              label: 'Niña', 
              emoji: '👧',
              description: 'Ropa y accesorios para niña'
            },
            { 
              id: 'neutral', 
              label: 'Sorpresa', 
              emoji: '✨',
              description: 'Déjate sorprender'
            }
          ].map((option) => {
            const isSelected = selectedGender === option.id;
            const themeColor = selectedTheme === option.id ? 
              (option.id === 'boy' ? 'blue' : option.id === 'girl' ? 'pink' : 'yellow') :
              (selectedTheme === 'boy' ? 'blue' : selectedTheme === 'girl' ? 'pink' : 'yellow');
              
            const buttonClasses = `
              w-full h-full p-4 rounded-xl transition-all duration-300
              flex flex-col items-center justify-center text-center
              border-2
              ${isSelected 
                ? `bg-gradient-to-br shadow-md text-white
                   ${themeColor === 'blue' ? 'from-blue-500 to-blue-600 border-blue-500' :
                     themeColor === 'pink' ? 'from-pink-500 to-rose-500 border-pink-500' :
                     'from-amber-400 to-yellow-500 border-amber-400'}`
                : `bg-white hover:bg-gray-50
                   ${themeColor === 'blue' ? 'border-blue-100 text-blue-700' :
                     themeColor === 'pink' ? 'border-pink-100 text-pink-700' :
                     'border-amber-100 text-amber-700'}`}
            `;
            
            return (
              <button
                key={option.id}
                onClick={() => onGenderChange(option.id as 'boy' | 'girl' | 'neutral')}
                className={buttonClasses}
              >
                <span className="text-3xl mb-2">{option.emoji}</span>
                <span className="font-semibold text-lg">{option.label}</span>
                <span className={`text-sm mt-1 ${
                  isSelected ? 'text-white/90' : 'text-gray-500'
                }`}>
                  {option.description}
                </span>
                {isSelected && (
                  <div className="mt-3 px-3 py-1 rounded-full bg-white/20 text-xs font-medium">
                    Seleccionado
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Puedes cambiar esta opción en cualquier momento
          </p>
        </div>
      </div>
    </div>
  );
};

export default GenderSwitcher;