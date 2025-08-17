import React from 'react';
import { Calendar, MapPin, Clock, Share2, QrCode } from 'lucide-react';
import { Event } from '../../../types';
import Button from '../../../components/ui/Button';

interface EventHeaderProps {
  event: Event;
  theme?: 'boy' | 'girl' | 'neutral';
}

const EventHeader: React.FC<EventHeaderProps> = ({ event, theme = 'neutral' }) => {
  
  const getButtonColors = () => {
    switch (theme) {
      case 'boy':
        return {
          primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
          outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
          ghost: 'text-blue-600 hover:bg-blue-50 border border-blue-100',
          iconBg: 'bg-blue-100 text-blue-600',
          iconHover: 'hover:bg-blue-200',
          focus: 'focus:ring-blue-500 focus:border-blue-500'
        };
      case 'girl':
        return {
          primary: 'bg-pink-600 hover:bg-pink-700 text-white border-pink-600',
          outline: 'border-2 border-pink-600 text-pink-600 hover:bg-pink-50',
          ghost: 'text-pink-600 hover:bg-pink-50 border border-pink-100',
          iconBg: 'bg-pink-100 text-pink-600',
          iconHover: 'hover:bg-pink-200',
          focus: 'focus:ring-pink-500 focus:border-pink-500'
        };
      default:
        return {
          primary: 'bg-yellow-500 hover:bg-yellow-600 text-gray-900 border-yellow-500',
          outline: 'border-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50',
          ghost: 'text-yellow-700 hover:bg-yellow-50 border border-yellow-100',
          iconBg: 'bg-yellow-100 text-yellow-600',
          iconHover: 'hover:bg-yellow-200',
          focus: 'focus:ring-yellow-500 focus:border-yellow-500'
        };
    }
  };
  
  const buttonColors = getButtonColors();
  
  // Eliminamos las variables de predicciones ya que se movieron a App.tsx
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventTypeColor = () => {
    switch (theme) {
      case 'boy':
        return 'from-blue-400 via-cyan-300 to-blue-300';
      case 'girl':
        return 'from-pink-400 via-rose-300 to-pink-300';
      default:
        return 'from-yellow-400 via-indigo-300 to-yellow-300';
    }
  };

  const getShadowColor = () => {
    switch (theme) {
      case 'boy':
        return 'shadow-lg shadow-blue-100/50 hover:shadow-blue-200/50';
      case 'girl':
        return 'shadow-lg shadow-pink-100/50 hover:shadow-pink-200/50';
      default:
        return 'shadow-lg shadow-yellow-100/50 hover:shadow-yellow-200/50';
    }
  };

  const getThemeEmoji = () => {
    switch (theme) {
      case 'boy': return '🤴';
      case 'girl': return '👸';
      default: return '🎭';
    }
  };

  const shareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `¡Estás invitado a ${event.title}! 🎉`,
        url: window.location.href,
      });
    } else {
      // Fallback para escritorio
      navigator.clipboard.writeText(window.location.href);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  return (
    <div className={`relative overflow-hidden mb-1 rounded-2xl bg-white border border-gray-100 transition-all duration-300 ${getShadowColor()} hover:shadow-xl hover:-translate-y-0.5`}>
      {/* Gradient Header */}
      <div className={`h-2 w-full bg-gradient-to-r ${getEventTypeColor()}`}></div>
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white bg-opacity-20 rounded-full blur-lg animate-pulse"></div>
        <div className="absolute top-1/2 -left-8 w-32 h-32 bg-white bg-opacity-10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-6 right-1/4 w-20 h-20 bg-white bg-opacity-15 rounded-full blur-lg animate-pulse delay-500"></div>
        <div className="absolute top-1/4 right-1/3 text-6xl opacity-10 animate-bounce">
          {getThemeEmoji()}
        </div>
      </div>

      <div className="relative z-10 bg-white/95 backdrop-blur-sm p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Event Image */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img 
                src={event.imageUrl || 'https://images.pexels.com/photos/1556652/pexels-photo-1556652.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1'} 
                alt={event.title}
                className="w-40 h-40 lg:w-48 lg:h-48 object-cover rounded-2xl shadow-lg border-4 border-white"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 to-transparent"></div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-4xl animate-bounce">
                {theme === 'boy' ? '👶' : theme === 'girl' ? '👧' : '❓'}
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="flex-1 text-left sm:text-center lg:text-left">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              {event.title}
            </h1>
            {event.subtitle && (
              <p className="text-lg lg:text-xl text-gray-600 mb-4 font-light">
                {event.subtitle}
              </p>
            )}
            
            {event.description && (
              <p className="text-gray-600 text-base mb-6 leading-relaxed max-w-3xl text-left sm:text-center lg:text-left">
                {event.description}
              </p>
            )}

            {/* Event Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 text-left sm:text-center lg:text-left">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${buttonColors.iconBg} ${buttonColors.iconHover} transition-colors`}>
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fecha</p>
                  <p className="text-sm font-medium text-gray-800">{formatDate(event.date)}</p>
                </div>
              </div>
              
              {event.time && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${buttonColors.iconBg} ${buttonColors.iconHover} transition-colors`}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Hora</p>
                    <p className="text-sm font-medium text-gray-800">{event.time}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${buttonColors.iconBg === 'bg-blue-100' ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : buttonColors.iconBg} ${buttonColors.iconHover} transition-colors`}>
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ubicación</p>
                  <p className="text-sm font-medium text-gray-800">{event.location}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={shareEvent}
                variant="primary"
                size="md"
                icon={Share2}
                className={`flex-1 sm:flex-none justify-center ${buttonColors.primary} transition-colors ${buttonColors.focus}`}
              >
                Compartir Evento
              </Button>
              
              <Button 
                variant="outline"
                size="md"
                icon={QrCode}
                className={`flex-1 sm:flex-none justify-center ${buttonColors.outline} transition-colors ${buttonColors.focus}`}
              >
                Código QR
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventHeader;