import React, { useState, useCallback, useEffect } from 'react';
import { X, Heart, Crown, Sparkles, User, Mail, MessageSquare } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import ConfirmationDialog from '../../../components/ui/ConfirmationDialog';

interface PredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGender: 'boy' | 'girl';
}

const PredictionModal: React.FC<PredictionModalProps> = ({ isOpen, onClose, selectedGender }) => {
  const { addPrediction, currentEvent } = useApp();
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    suggestedName: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  
  // Obtener las clases de enfoque basadas en el género seleccionado
  const getFocusClasses = () => {
    switch(selectedGender) {
      case 'boy':
        return 'focus:ring-blue-500 focus:border-blue-500';
      case 'girl':
        return 'focus:ring-pink-500 focus:border-pink-500';
      default:
        return 'focus:ring-yellow-500 focus:border-yellow-500';
    }
  };

  const focusClasses = getFocusClasses();

  const handleCloseSuccess = useCallback(() => {
    setShowSuccessDialog(false);
    onClose();
    // Reset form
    setFormData({
      guestName: '',
      guestEmail: '',
      suggestedName: '',
      message: ''
    });
  }, [onClose]);

  const handleCloseError = useCallback(() => {
    setShowErrorDialog(false);
  }, []);

  // Reset submitting state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación de campos requeridos
    if (!formData.guestName.trim() || !formData.guestEmail.trim() || !formData.suggestedName.trim()) {
      setDialogMessage('Por favor completa todos los campos requeridos');
      setShowErrorDialog(true);
      return;
    }

    // Validación de formato de correo electrónico
    if (!validateEmail(formData.guestEmail.trim())) {
      setDialogMessage('Por favor ingresa un correo electrónico válido');
      setShowErrorDialog(true);
      return;
    }

    // Verificación de evento activo
    if (!currentEvent) {
      setDialogMessage('No hay un evento activo. Por favor, inténtalo de nuevo.');
      setShowErrorDialog(true);
      return;
    }

    // Generar un ID de invitado temporal basado en timestamp y un número aleatorio
    const generateGuestId = () => {
      return `guest-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    };

    setIsSubmitting(true);
    
    try {
      // Crear o actualizar la predicción
      const result = await addPrediction({
        event_id: currentEvent.id,
        guest_id: generateGuestId(),
        prediction: selectedGender,
        name_suggestion: formData.suggestedName.trim(),
        message: formData.message?.trim() || '',
        created_at: new Date().toISOString()
      });
      
      // Si result es null, significa que el usuario canceló la actualización
      if (result === null) {
        return; // No hacer nada más, el usuario canceló
      }
      
      // Si hay un resultado, mostrar mensaje de éxito
      if (result) {
        setDialogMessage('¡Tu predicción ha sido registrada con éxito! 🎉');
        setShowSuccessDialog(true);
        setFormData({
          guestName: '',
          guestEmail: '',
          suggestedName: '',
          message: ''
        });
      }
      
    } catch (error) {
      console.error('Error al registrar la predicción:', error);
      setDialogMessage('Hubo un error al procesar tu predicción. Por favor, inténtalo de nuevo más tarde.');
      setShowErrorDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getThemeColors = () => {
    return selectedGender === 'girl' 
      ? { 
          gradient: 'from-pink-500 to-rose-500',
          bg: 'from-pink-50 to-rose-50',
          icon: Heart,
          title: 'Predicción: ¡Será una Princesa! 👑',
          emoji: '👸'
        }
      : { 
          gradient: 'from-blue-500 to-cyan-500',
          bg: 'from-blue-50 to-cyan-50',
          icon: Crown,
          title: 'Predicción: ¡Será un Príncipe! 👑',
          emoji: '🤴'
        };
  };

  const theme = getThemeColors();
  const ThemeIcon = theme.icon;

  return (
    <>
      <ConfirmationDialog
        isOpen={showSuccessDialog}
        onClose={handleCloseSuccess}
        onConfirm={handleCloseSuccess}
        title="¡Éxito!"
        message={dialogMessage}
        confirmText="Cerrar"
        variant="success"
        hideCancelButton
      />
      
      <ConfirmationDialog
        isOpen={showErrorDialog}
        onClose={handleCloseError}
        onConfirm={handleCloseError}
        title="Error"
        message={dialogMessage}
        confirmText="Entendido"
        variant="danger"
        hideCancelButton
      />

      
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" shadow="lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ThemeIcon className={`text-transparent bg-gradient-to-r ${theme.gradient} bg-clip-text`} />
            Haz tu Predicción
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Prediction Summary */}
        <div className={`bg-gradient-to-r ${theme.bg} rounded-lg p-6 mb-6 text-center`}>
          <div className="text-6xl mb-3">{theme.emoji}</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {theme.title}
          </h3>
          <p className="text-gray-600">
            ¡Comparte tu predicción y sugiere un nombre para el bebé de Rocío y Moisés!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Guest Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-1" />
              Tu Nombre *
            </label>
            <input
              type="text"
              required
              value={formData.guestName}
              onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
              className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 ${focusClasses} transition-colors`}
              placeholder="Ingresa tu nombre completo"
            />
          </div>

          {/* Guest Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail size={16} className="inline mr-1" />
              Tu Email *
            </label>
            <input
              type="email"
              required
              value={formData.guestEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, guestEmail: e.target.value }))}
              className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 ${focusClasses} transition-colors`}
              placeholder="tu-email@ejemplo.com"
            />
          </div>

          {/* Suggested Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Sparkles size={16} className="inline mr-1" />
              Nombre Sugerido *
            </label>
            <input
              type="text"
              required
              value={formData.suggestedName}
              onChange={(e) => setFormData(prev => ({ ...prev, suggestedName: e.target.value }))}
              className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 ${focusClasses} transition-colors`}
              placeholder={selectedGender === 'girl' ? 'Ej: Isabella, Sofía, Valentina...' : 'Ej: Santiago, Sebastián, Mateo...'}
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare size={16} className="inline mr-1" />
              Mensaje de Cariño (Opcional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors resize-none"
              placeholder="Deja un mensaje especial para Rocío y Moisés..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className={`flex-1 bg-gradient-to-r ${theme.gradient} hover:opacity-90`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registrando...' : 'Confirmar Predicción'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
    </>
  );
};

export default PredictionModal;