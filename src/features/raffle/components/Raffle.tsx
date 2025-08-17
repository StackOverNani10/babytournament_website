import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import Button from '../../../components/ui/Button';
import { Ticket } from 'lucide-react';

interface Prize {
  id: string;
  name: string;
  description: string;
  image?: string;
  winner?: string;
}

const Raffle: React.FC = () => {
  const { selectedTheme } = useApp();
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [hasParticipated, setHasParticipated] = useState(false);

  // Mock data for prizes
  const prizes: Prize[] = [
    {
      id: '1',
      name: 'Cena para dos',
      description: 'Una cena romántica en el restaurante de tu elección',
    },
    {
      id: '2',
      name: 'Spa Day',
      description: 'Un día completo de relajación para dos personas',
    },
    {
      id: '3',
      name: 'Vino Especial',
      description: 'Botella de vino premium añejo',
    },
  ];

  const handleParticipate = (prize: Prize) => {
    setSelectedPrize(prize);
    // In a real app, you would make an API call here
    setTimeout(() => {
      setHasParticipated(true);
    }, 1500);
  };

  const getButtonColors = () => {
    switch (selectedTheme) {
      case 'boy':
        return {
          primary: 'bg-blue-600 hover:bg-blue-700 text-white',
          secondary: 'bg-blue-100 text-blue-800',
        };
      case 'girl':
        return {
          primary: 'bg-pink-600 hover:bg-pink-700 text-white',
          secondary: 'bg-pink-100 text-pink-800',
        };
      default:
        return {
          primary: 'bg-yellow-500 hover:bg-yellow-600 text-gray-900',
          secondary: 'bg-yellow-100 text-yellow-800',
        };
    }
  };

  const buttonColors = getButtonColors();

  return (
    <section className="py-12 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center p-3 rounded-full mb-4 bg-white shadow-sm`}>
            <div className={`flex items-center justify-center h-14 w-14 rounded-full ${
              selectedTheme === 'boy' ? 'bg-blue-100 text-blue-600' : 
              selectedTheme === 'girl' ? 'bg-pink-100 text-pink-600' : 
              'bg-yellow-100 text-yellow-600'
            }`}>
              <Ticket size={28} />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Sorteo Especial
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Participa en nuestro sorteo y gana increíbles premios para disfrutar juntos
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prizes.map((prize) => (
            <div 
              key={prize.id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className={`h-2 ${
                selectedTheme === 'boy' ? 'bg-blue-500' : 
                selectedTheme === 'girl' ? 'bg-pink-500' : 
                'bg-yellow-500'
              }`}></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{prize.name}</h3>
                <p className="text-gray-600 mb-4">{prize.description}</p>
                <Button 
                  onClick={() => handleParticipate(prize)}
                  disabled={hasParticipated}
                  className={`w-full ${
                    hasParticipated 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : buttonColors.primary
                  }`}
                >
                  {hasParticipated && selectedPrize?.id === prize.id
                    ? '¡Participaste!'
                    : 'Participar'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className={`absolute top-1/4 -right-20 w-64 h-64 ${
          selectedTheme === 'boy' ? 'bg-blue-100' : selectedTheme === 'girl' ? 'bg-pink-100' : 'bg-yellow-100'
        } bg-opacity-20 rounded-full blur-3xl`}></div>
      </div>
    </section>
  );
};

export default Raffle;
