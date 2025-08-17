import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import Button from '../../../components/ui/Button';
import { ThumbsUp, Vote } from 'lucide-react';

interface Activity {
  id: string;
  name: string;
  description: string;
}

interface ActivityVotingProps {
  theme: 'boy' | 'girl' | 'neutral';
}

const ActivityVoting: React.FC<ActivityVotingProps> = ({ theme }) => {
  const { currentEvent } = useApp();
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  
  // Get activities from the event configuration or use default ones
  const defaultActivities: Activity[] = [
    { id: '1', name: 'Juego de Adivinanzas', description: 'Adivina el peso y tamaño del bebé' },
    { id: '2', name: 'Dibuja el Bebé', description: 'Dibuja cómo crees que será el bebé' },
    { id: '3', name: 'Concurso de Pañales', description: 'Competencia para cambiar pañales' },
    { id: '4', name: 'Consejos para Padres', description: 'Comparte tus mejores consejos' },
  ];
  
  const activities: Activity[] = (currentEvent.sections?.['activity-voting']?.config as any)?.activities || defaultActivities;

  // Get max votes allowed from config or default to 3
  const maxVotes: number = (currentEvent.sections?.['activity-voting']?.config?.maxVotes as number) ?? 3;

  const toggleActivity = (activityId: string) => {
    if (hasVoted) return;
    
    setSelectedActivities(prev => {
      if (prev.includes(activityId)) {
        return prev.filter(id => id !== activityId);
      } else if (prev.length < maxVotes) {
        return [...prev, activityId];
      }
      return prev;
    });
  };

  const handleVote = () => {
    // In a real app, you would send this to your backend
    console.log('Voted for activities:', selectedActivities);
    setHasVoted(true);
  };

  const getButtonColors = () => {
    switch (theme) {
      case 'boy':
        return {
          primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
          outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
          ghost: 'text-blue-600 hover:bg-blue-50 border border-blue-100',
          iconBg: 'bg-blue-100 text-blue-600',
          iconHover: 'hover:bg-blue-200',
          focus: 'focus:ring-blue-500 focus:border-blue-500',
          gradient: 'from-blue-400 via-cyan-300 to-blue-300',
          shadow: 'shadow-lg shadow-blue-100/50 hover:shadow-blue-200/50',
          emoji: '🎫'
        };
      case 'girl':
        return {
          primary: 'bg-pink-600 hover:bg-pink-700 text-white border-pink-600',
          outline: 'border-2 border-pink-600 text-pink-600 hover:bg-pink-50',
          ghost: 'text-pink-600 hover:bg-pink-50 border border-pink-100',
          iconBg: 'bg-pink-100 text-pink-600',
          iconHover: 'hover:bg-pink-200',
          focus: 'focus:ring-pink-500 focus:border-pink-500',
          gradient: 'from-pink-400 via-rose-300 to-pink-300',
          shadow: 'shadow-lg shadow-pink-100/50 hover:shadow-pink-200/50',
          emoji: '🎫'
        };
      default:
        return {
          primary: 'bg-yellow-500 hover:bg-yellow-600 text-gray-900 border-yellow-500',
          outline: 'border-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50',
          ghost: 'text-yellow-700 hover:bg-yellow-50 border border-yellow-100',
          iconBg: 'bg-yellow-100 text-yellow-600',
          iconHover: 'hover:bg-yellow-200',
          focus: 'focus:ring-yellow-500 focus:border-yellow-500',
          gradient: 'from-yellow-400 via-indigo-300 to-yellow-300',
          shadow: 'shadow-lg shadow-yellow-100/50 hover:shadow-yellow-200/50',
          emoji: '🎫'
        };
    }
  };

  const themeColors = getButtonColors();
  
  const getThemeClasses = () => ({
    bg: theme === 'boy' ? 'bg-blue-50' : theme === 'girl' ? 'bg-pink-50' : 'bg-yellow-50',
    text: theme === 'boy' ? 'text-blue-800' : theme === 'girl' ? 'text-pink-800' : 'text-yellow-800',
    border: theme === 'boy' ? 'border-blue-200' : theme === 'girl' ? 'border-pink-200' : 'border-yellow-200',
    button: themeColors.primary,
    buttonText: 'text-white',
    selected: `ring-2 ${theme === 'boy' ? 'ring-blue-500 bg-blue-50' : theme === 'girl' ? 'ring-pink-500 bg-pink-50' : 'ring-yellow-500 bg-yellow-50'}`,
    iconBg: themeColors.iconBg,
    title: theme === 'boy' ? 'text-blue-700' : theme === 'girl' ? 'text-pink-700' : 'text-yellow-700',
    subtitle: theme === 'boy' ? 'text-blue-600' : theme === 'girl' ? 'text-pink-600' : 'text-yellow-600',
    cardHover: theme === 'boy' ? 'hover:shadow-blue-100 hover:border-blue-300' : theme === 'girl' ? 'hover:shadow-pink-100 hover:border-pink-300' : 'hover:shadow-yellow-100 hover:border-yellow-300',
    cardSelected: theme === 'boy' ? 'shadow-blue-100 border-blue-300' : theme === 'girl' ? 'shadow-pink-100 border-pink-300' : 'shadow-yellow-100 border-yellow-300',
    gradient: themeColors.gradient,
    shadow: themeColors.shadow,
    emoji: themeColors.emoji
  });

  const themeClasses = getThemeClasses();
  const buttonColors = getButtonColors();

  return (
    <div id="votacion-actividades" className={`py-12 ${themeClasses.bg} relative overflow-hidden`}>
      {/* Gradient Header */}
      <div className={`h-2 w-full bg-gradient-to-r ${themeClasses.gradient} mb-8`}></div>
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Decorative background elements */}
        <div className={`absolute top-0 right-0 w-20 h-20 ${
          theme === 'boy' ? 'bg-blue-100' : theme === 'girl' ? 'bg-pink-100' : 'bg-yellow-100'
        } bg-opacity-20 rounded-full blur-lg animate-pulse`}></div>
        <div className={`absolute bottom-1/3 -left-8 w-32 h-32 ${
          theme === 'boy' ? 'bg-blue-100' : theme === 'girl' ? 'bg-pink-100' : 'bg-yellow-100'
        } bg-opacity-10 rounded-full blur-xl animate-pulse delay-1000`}></div>
        <div className={`absolute -bottom-6 right-1/4 w-20 h-20 ${
          theme === 'boy' ? 'bg-blue-100' : theme === 'girl' ? 'bg-pink-100' : 'bg-yellow-100'
        } bg-opacity-15 rounded-full blur-lg animate-pulse delay-500`}></div>
        
        {/* Decorative emoji - positioned top-right */}
        <div className="absolute top-4 right-4 text-5xl opacity-30 animate-float">
          {themeClasses.emoji}
        </div>
        
        {/* Additional decorative element for visual interest */}
        <div className={`absolute top-16 left-1/4 text-4xl opacity-15 animate-float-delay-2`}>
          {theme === 'boy' ? '👶' : theme === 'girl' ? '👧' : '❓'}
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center p-3 rounded-full mb-4 bg-white shadow-sm ${themeClasses.shadow}`}>
            <div className={`flex items-center justify-center h-14 w-14 rounded-full ${buttonColors.iconBg} ${buttonColors.iconHover} transition-colors`}>
              <Vote size={28} className={theme === 'boy' ? 'text-blue-600' : theme === 'girl' ? 'text-pink-600' : 'text-yellow-600'} />
            </div>
          </div>
          <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${themeClasses.title}`}>
            Votación de Actividades
          </h2>
          <p className={`text-lg ${themeClasses.subtitle}`}>
            {hasVoted 
              ? '¡Gracias por votar! Tus votos han sido registrados.'
              : `Selecciona hasta ${maxVotes} actividades para el evento`}
          </p>
        </div>

        {!hasVoted && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {activities.map((activity: Activity) => (
              <div
                key={activity.id}
                onClick={() => toggleActivity(activity.id)}
                className={`cursor-pointer p-5 rounded-xl border ${themeClasses.border} bg-white shadow-sm transition-all duration-200 ${
                  selectedActivities.includes(activity.id)
                    ? `${themeClasses.cardSelected} transform -translate-y-1 shadow-md ${themeClasses.selected}`
                    : `hover:-translate-y-1 hover:shadow-md ${themeClasses.cardHover}`
                }`}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-full mr-3 ${selectedActivities.includes(activity.id) ? themeClasses.iconBg : 'bg-gray-50 text-gray-400'}`}>
                    <ThumbsUp size={18} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${selectedActivities.includes(activity.id) ? themeClasses.title : 'text-gray-800'}`}>
                      {activity.name}
                    </h3>
                    <p className={`text-sm ${selectedActivities.includes(activity.id) ? themeClasses.subtitle : 'text-gray-500'}`}>
                      {activity.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!hasVoted && (
          <div className="text-center">
            <Button
              onClick={handleVote}
              disabled={selectedActivities.length === 0}
              className={`${buttonColors.primary} px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                theme === 'boy' ? 'focus:ring-blue-500' : theme === 'girl' ? 'focus:ring-pink-500' : 'focus:ring-yellow-500'
              }`}
            >
              {selectedActivities.length > 0 
                ? `Votar por ${selectedActivities.length} actividad${selectedActivities.length !== 1 ? 'es' : ''}`
                : 'Selecciona al menos una actividad'}
            </Button>
            {selectedActivities.length > 0 && (
              <p className={`mt-2 text-sm ${themeClasses.subtitle}`}>
                {maxVotes - selectedActivities.length} voto{maxVotes - selectedActivities.length !== 1 ? 's' : ''} restante{maxVotes - selectedActivities.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityVoting;
