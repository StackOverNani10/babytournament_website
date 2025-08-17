/**
 * Formatea una fecha en un formato legible
 * @param date - Fecha a formatear (string, número o objeto Date)
 * @param locale - Configuración regional (por defecto: 'es-ES')
 * @returns Fecha formateada como string
 */
export const formatDate = (
  date: string | number | Date,
  locale: string = 'es-ES',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string => {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;
    
    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch (error) {
    console.error('Error al formatear la fecha:', error);
    return 'Fecha inválida';
  }
};

/**
 * Calcula la diferencia en días entre dos fechas
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin (por defecto: fecha actual)
 * @returns Número de días entre las fechas
 */
export const daysBetween = (
  startDate: string | Date,
  endDate: string | Date = new Date()
): number => {
  try {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Error al calcular días entre fechas:', error);
    return 0;
  }
};

/**
 * Verifica si una fecha es futura
 * @param date - Fecha a verificar
 * @returns true si la fecha es futura, false en caso contrario
 */
export const isFutureDate = (date: string | Date): boolean => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateObj > today;
  } catch (error) {
    console.error('Error al verificar fecha futura:', error);
    return false;
  }
};
