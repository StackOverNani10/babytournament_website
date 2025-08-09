import React from 'react';
import { Heart, Instagram, Facebook, Mail } from 'lucide-react';

interface FooterProps {
  theme?: 'boy' | 'girl' | 'neutral';
  scrollToSection: (id: string) => void;
}

const Footer: React.FC<FooterProps> = ({ theme = 'neutral', scrollToSection }) => {
  // Obtener colores según el tema
  const getThemeColors = () => {
    switch (theme) {
      case 'boy':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          hover: 'hover:text-blue-600',
          icon: 'text-blue-500',
        };
      case 'girl':
        return {
          bg: 'bg-gradient-to-r from-pink-50 to-rose-50',
          text: 'text-pink-700',
          border: 'border-pink-200',
          hover: 'hover:text-pink-600',
          icon: 'text-pink-500',
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
          hover: 'hover:text-yellow-600',
          icon: 'text-yellow-500',
        };
    }
  };

  const colors = getThemeColors();

  return (
    <footer className={`${colors.bg} ${colors.border} border-t mt-16`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sección de información */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Sobre el Evento</h3>
            <p className="text-sm text-gray-600">
              Comparte la emoción de la llegada de nuestro bebé y forma parte de este momento tan especial para nosotros.
            </p>
            <div className="group flex items-center space-x-2 text-sm text-gray-500 cursor-pointer">
              <Heart className={`h-4 w-4 ${colors.icon} group-hover:fill-current`} />
              <span>Hecho con amor por Nani</span>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => scrollToSection('inicio')}
                  className={`text-sm ${colors.text} hover:underline text-left`}
                >
                  Inicio
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('regalos')}
                  className={`text-sm ${colors.text} hover:underline text-left`}
                >
                  Lista de Regalos
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('predicciones')}
                  className={`text-sm ${colors.text} hover:underline text-left`}
                >
                  Predicciones
                </button>
              </li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`${colors.text} ${colors.hover} transition-colors`}
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`${colors.text} ${colors.hover} transition-colors`}
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="mailto:longearscooper@gmail.com" 
                className={`${colors.text} ${colors.hover} transition-colors`}
                aria-label="Correo electrónico"
              >
                <Mail size={20} />
              </a>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                ¿Tienes alguna pregunta? Escríbenos a:
              </p>
              <a 
                href="mailto:longearscooper@gmail.com" 
                className={`text-sm font-medium ${colors.text} ${colors.hover} transition-colors`}
              >
                longearscooper@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Derechos de autor */}
        <div className={`mt-12 pt-8 border-t ${colors.border} text-center`}>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Daniel Domínguez - Todos los derechos reservados
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Diseñado con ❤️ para celebrar la llegada de nuestro bebé
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
