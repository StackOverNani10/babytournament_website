export interface GenderPrediction {
  id: string;
  eventId: string;
  guestName: string;
  guestEmail: string;
  predictedGender: 'boy' | 'girl';
  suggestedName: string;
  message?: string;
  predictedDate?: string; // Fecha de la predicción
  createdAt: string;
}
