import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { GenderPrediction } from '../../features/predictions/types/predictions';

interface PredictionsContextType {
  predictions: GenderPrediction[];
  loading: boolean;
  error: string | null;
  addPrediction: (prediction: Omit<GenderPrediction, 'id' | 'created_at'>) => Promise<GenderPrediction | null>;
  refreshPredictions: () => Promise<void>;
  getPredictionsByEvent: (eventId: string) => GenderPrediction[];
}

const PredictionsContext = createContext<PredictionsContextType | undefined>(undefined);

interface PredictionsProviderProps {
  children: ReactNode;
  initialPredictions?: GenderPrediction[];
}

export function PredictionsProvider({ 
  children, 
  initialPredictions = [] 
}: PredictionsProviderProps) {
  const [predictions, setPredictions] = useState<GenderPrediction[]>(initialPredictions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      const formattedPredictions = data.map(prediction => ({
        id: prediction.id,
        event_id: prediction.event_id,
        guest_id: prediction.guest_id,
        prediction: prediction.prediction,
        name_suggestion: prediction.name_suggestion,
        created_at: prediction.created_at,
        message: prediction.message || null
      }));
      
      setPredictions(formattedPredictions);
      setError(null);
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError('Error al cargar las predicciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  const addPrediction = useCallback(async (prediction: Omit<GenderPrediction, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .insert([{
          event_id: prediction.event_id,
          guest_id: prediction.guest_id,
          prediction: prediction.prediction,
          name_suggestion: prediction.name_suggestion,
          message: prediction.message || null
        }])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newPrediction: GenderPrediction = {
          id: data[0].id,
          event_id: data[0].event_id,
          guest_id: data[0].guest_id,
          prediction: data[0].prediction,
          name_suggestion: data[0].name_suggestion,
          created_at: data[0].created_at,
          message: data[0].message || null
        };
        
        setPredictions(prev => [newPrediction, ...prev]);
        return newPrediction;
      }
      return null;
    } catch (err) {
      console.error('Error adding prediction:', err);
      setError('Error al agregar la predicción');
      return null;
    }
  }, []);

  const refreshPredictions = useCallback(async () => {
    await fetchPredictions();
  }, [fetchPredictions]);

  const getPredictionsByEvent = useCallback((eventId: string) => {
    return predictions.filter(prediction => prediction.event_id === eventId);
  }, [predictions]);

  return (
    <PredictionsContext.Provider 
      value={{
        predictions,
        loading,
        error,
        addPrediction,
        refreshPredictions,
        getPredictionsByEvent
      }}
    >
      {children}
    </PredictionsContext.Provider>
  );
}

export function usePredictions() {
  const context = useContext(PredictionsContext);
  if (context === undefined) {
    throw new Error('usePredictions must be used within a PredictionsProvider');
  }
  return context;
}
