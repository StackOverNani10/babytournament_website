/**
 * Formatea un número como moneda
 * @param amount - Cantidad a formatear
 * @param currency - Código de moneda (por defecto: 'DOP')
 * @param locale - Configuración regional (por defecto: 'es-DO')
 * @returns Cantidad formateada como moneda
 */
export const formatCurrency = (
  amount: number | string,
  currency: string = 'DOP',
  locale: string = 'es-DO'
): string => {
  try {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numericAmount)) {
      throw new Error('El valor proporcionado no es un número válido');
    }

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch (error) {
    console.error('Error al formatear moneda:', error);
    return '--';
  }
};

/**
 * Convierte un número a formato de moneda sin el símbolo
 * @param amount - Cantidad a formatear
 * @param decimalPlaces - Número de decimales (por defecto: 2)
 * @returns Cantidad formateada como string
 */
export const toCurrencyFormat = (
  amount: number | string,
  decimalPlaces: number = 2
): string => {
  try {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numericAmount)) {
      throw new Error('El valor proporcionado no es un número válido');
    }

    return numericAmount.toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  } catch (error) {
    console.error('Error al formatear número:', error);
    return '0.00';
  }
};

/**
 * Parsea un string de moneda a número
 * @param currencyString - String de moneda a parsear
 * @returns Número parseado o 0 si hay error
 */
export const parseCurrency = (currencyString: string): number => {
  try {
    // Eliminar todo lo que no sea número, punto o coma
    const cleanString = currencyString.replace(/[^\d,.-]/g, '');
    // Reemplazar comas por puntos para el parseo
    const numericString = cleanString.replace(',', '.');
    const result = parseFloat(numericString);
    
    return isNaN(result) ? 0 : result;
  } catch (error) {
    console.error('Error al parsear moneda:', error);
    return 0;
  }
};
