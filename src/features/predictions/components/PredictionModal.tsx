import React, { useState, useCallback, useEffect } from 'react';
import { X, Heart, Crown, Sparkles, User, Mail, MessageSquare } from 'lucide-react';
import { usePredictions } from '../../../context/predictions/PredictionsContext';
import { useGuests } from '../../../context/guests/GuestsContext';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import ConfirmationDialog from '../../../components/ui/ConfirmationDialog';
import { GenderPrediction } from '../types/predictions';

interface PredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGender: 'boy' | 'girl';
}

const PredictionModal: React.FC<PredictionModalProps> = ({ isOpen, onClose, selectedGender }) => {
  const { addPrediction, updatePrediction, getPredictionByGuest, refreshPredictions } = usePredictions();
  const { getGuestByEmail, addGuest, currentEvent } = useGuests();
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [existingPrediction, setExistingPrediction] = useState<GenderPrediction | null>(null);
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
  const [updateDialogMessage, setUpdateDialogMessage] = useState('');

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
    setFormData({ guestName: '', guestEmail: '', suggestedName: '', message: '' });
  }, [onClose]);

  const handleCloseError = useCallback(() => {
    setShowErrorDialog(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleUpdate = async () => {
    if (!existingPrediction) return;

    setIsSubmitting(true);
    try {
      const result = await updatePrediction(existingPrediction.id, existingPrediction);
      if (result) {
        await refreshPredictions(); // Refresh predictions after update
        setDialogMessage('¡Tu predicción ha sido actualizada con éxito! 🎉');
        setShowSuccessDialog(true);
      }
    } catch (error) {
      console.error('Error updating prediction:', error);
      setDialogMessage('Hubo un error al actualizar tu predicción.');
      setShowErrorDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.guestName.trim() || !formData.guestEmail.trim() || !formData.suggestedName.trim()) {
      setDialogMessage('Por favor completa todos los campos requeridos');
      setShowErrorDialog(true);
      return;
    }

    if (!validateEmail(formData.guestEmail.trim())) {
      setDialogMessage('Por favor ingresa un correo electrónico válido');
      setShowErrorDialog(true);
      return;
    }

    if (!currentEvent) {
      setDialogMessage('No hay un evento activo. Por favor, inténtalo de nuevo.');
      setShowErrorDialog(true);
      return;
    }

    setIsSubmitting(true);

    try {
      let guest = await getGuestByEmail(formData.guestEmail.trim());

      if (!guest) {
        guest = await addGuest({
          event_id: currentEvent.id,
          name: formData.guestName.trim(),
          email: formData.guestEmail.trim(),
        });
      }

      if (!guest) {
        throw new Error('No se pudo crear o encontrar al invitado.');
      }

      const existing = await getPredictionByGuest(guest.id);

      const predictionData = {
        event_id: currentEvent.id,
        guest_id: guest.id,
        prediction: selectedGender,
        name_suggestion: formData.suggestedName.trim(),
        message: formData.message?.trim() || '',
      };

      if (existing) {
        const finalPredictionData = {
          ...predictionData,
          message: formData.message?.trim() || existing.message,
        };

        const formatGender = (gender: 'boy' | 'girl') => gender === 'boy' ? 'Niño 👦' : 'Niña 👧';

        const message = `Ya tienes una predicción registrada. ¿Deseas actualizarla?\n\n` +
                        `Predicción Actual:\n` +
                        `- Género: ${formatGender(existing.prediction)}\n` +
                        `- Nombre: ${existing.name_suggestion}\n\n` +
                        `Nueva Predicción:\n` +
                        `- Género: ${formatGender(finalPredictionData.prediction)}\n` +
                        `- Nombre: ${finalPredictionData.name_suggestion}`;

        setUpdateDialogMessage(message);
        setExistingPrediction({ ...existing, ...finalPredictionData });
        setShowUpdateDialog(true);
      } else {
        const result = await addPrediction(predictionData);
        if (result) {
          await refreshPredictions(); // Refresh predictions after adding
          setDialogMessage('¡Tu predicción ha sido registrada con éxito! 🎉');
          setShowSuccessDialog(true);
          setFormData({ guestName: '', guestEmail: '', suggestedName: '', message: '' });
        }
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

      <ConfirmationDialog
        isOpen={showUpdateDialog}
        onClose={() => setShowUpdateDialog(false)}
        onConfirm={handleUpdate}
        title="Actualizar Predicción"
        message={updateDialogMessage}
        confirmText="Actualizar"
        cancelText="Cancelar"
        variant={selectedGender}
      />

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" shadow="lg">
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

          <div className={`bg-gradient-to-r ${theme.bg} rounded-lg p-6 mb-6 text-center`}>
            <div className="text-6xl mb-3">{theme.emoji}</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {theme.title}
            </h3>
            <p className="text-gray-600">
              ¡Comparte tu predicción y sugiere un nombre para el bebé de Rocío y Moisés!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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