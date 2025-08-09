import React from 'react';
import { useApp } from '../../context/AppContext';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  forceTheme?: 'boy' | 'girl' | 'neutral';
}

const Layout: React.FC<LayoutProps> = ({ children, className = '', forceTheme }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { selectedTheme } = useApp();
  const theme = forceTheme || selectedTheme;

  const getThemeClasses = () => {
    if (isAdminRoute) {
      return 'min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white';
    }
    
    switch (theme) {
      case 'boy':
        return 'bg-gradient-to-br from-blue-50 via-cyan-25 to-blue-100 text-blue-900';
      case 'girl':
        return 'bg-gradient-to-br from-pink-50 via-rose-25 to-pink-100 text-pink-900';
      default:
        return 'bg-gradient-to-br from-yellow-50 via-indigo-25 to-yellow-50 text-yellow-900';
    }
  };

  const getButtonThemeClasses = () => {
    const themes = {
      boy: {
        primary: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500',
        secondary: 'bg-cyan-500 hover:bg-cyan-600 focus:ring-cyan-500',
        outline: 'border-2 border-blue-400 text-blue-700 hover:bg-blue-50',
        ghost: 'text-blue-700 hover:bg-blue-50'
      },
      girl: {
        primary: 'bg-pink-500 hover:bg-pink-600 focus:ring-pink-500',
        secondary: 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-500',
        outline: 'border-2 border-pink-400 text-pink-700 hover:bg-pink-50',
        ghost: 'text-pink-700 hover:bg-pink-50'
      },
      neutral: {
        primary: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500',
        secondary: 'bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-500',
        outline: 'border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50',
        ghost: 'text-yellow-700 hover:bg-yellow-50'
      }
    };

    return themes[theme as keyof typeof themes] || themes.neutral;
  };

  // Aplicar estilos globales basados en el tema
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Actualizar los colores de los botones basados en el tema
    const style = document.documentElement.style;
    const buttonThemes = getButtonThemeClasses();
    
    // Aplicar estilos de botones
    Object.entries(buttonThemes).forEach(([variant, classes]) => {
      if (typeof classes === 'string') {
        const [bgColor, hoverColor, focusRing] = classes.split(' ');
        if (bgColor) style.setProperty(`--btn-${variant}-bg`, `var(--${bgColor.split('-')[0]}-500)`);
        if (hoverColor) style.setProperty(`--btn-${variant}-hover`, `var(--${hoverColor.split('-')[1]}-600)`);
        if (focusRing) style.setProperty(`--btn-${variant}-ring`, `var(--${focusRing.split('-')[2]}-500)`);
      }
    });
  }, [theme]);

  return (
    <div className={`min-h-screen ${getThemeClasses()} ${className}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </div>
    </div>
  );
};

export default Layout;