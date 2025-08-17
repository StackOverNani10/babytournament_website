import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import Button from '../../../components/ui/Button';
import { MessageSquare, Send } from 'lucide-react';

interface Wish {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

const Wishes: React.FC = () => {
  const { selectedTheme } = useApp();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newWish: Wish = {
        id: Date.now().toString(),
        name: name.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString(),
      };
      
      setWishes(prev => [newWish, ...prev]);
      setName('');
      setMessage('');
      setIsSubmitting(false);
    }, 800);
  };

  const getThemeClasses = () => {
    switch (selectedTheme) {
      case 'boy':
        return {
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          inputBorder: 'border-blue-300 focus:border-blue-500',
          card: 'border-blue-100',
          text: 'text-blue-600',
        };
      case 'girl':
        return {
          button: 'bg-pink-600 hover:bg-pink-700 text-white',
          inputBorder: 'border-pink-300 focus:border-pink-500',
          card: 'border-pink-100',
          text: 'text-pink-600',
        };
      default: // neutral
        return {
          button: 'bg-yellow-500 hover:bg-yellow-600 text-gray-900',
          inputBorder: 'border-yellow-300 focus:border-yellow-500',
          card: 'border-yellow-100',
          text: 'text-yellow-600',
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <section className="py-12 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 rounded-full mb-4 bg-white shadow-sm">
            <div className={`flex items-center justify-center h-14 w-14 rounded-full ${
              selectedTheme === 'boy' ? 'bg-blue-100 text-blue-600' : 
              selectedTheme === 'girl' ? 'bg-pink-100 text-pink-600' : 
              'bg-yellow-100 text-yellow-600'
            }`}>
              <MessageSquare size={28} />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Mensajes de Deseos
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Deja un mensaje especial para los futuros padres y el bebé
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-8">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Tu nombre
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 ${
                  themeClasses.inputBorder
                } focus:ring-opacity-50 transition`}
                placeholder="Tu nombre"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Tu mensaje
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 ${
                  themeClasses.inputBorder
                } focus:ring-opacity-50 transition min-h-[120px]`}
                placeholder="Escribe tu mensaje de felicitación o deseo..."
                required
                maxLength={500}
              />
              <p className="text-xs text-gray-500 text-right mt-1">
                {message.length}/500 caracteres
              </p>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || !name.trim() || !message.trim()}
                className={`${themeClasses.button} px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2`}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                <Send size={18} className="text-white" />
              </Button>
            </div>
          </form>
        </div>

        {wishes.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-6 text-center">Mensajes recientes</h3>
            <div className="space-y-4">
              {wishes.map((wish) => (
                <div 
                  key={wish.id} 
                  className={`bg-white p-6 rounded-lg shadow-sm border ${themeClasses.card} transition-all hover:shadow-md`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{wish.name}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(wish.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-gray-600 whitespace-pre-line">{wish.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className={`absolute top-1/4 -right-20 w-64 h-64 ${
          selectedTheme === 'boy' ? 'bg-blue-100' : 
          selectedTheme === 'girl' ? 'bg-pink-100' : 
          'bg-yellow-100'
        } bg-opacity-20 rounded-full blur-3xl`}></div>
      </div>
    </section>
  );
};

export default Wishes;
