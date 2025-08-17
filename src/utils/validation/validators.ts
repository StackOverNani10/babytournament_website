/**
 * Expresiones regulares comunes para validaciones
 */
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,3}[-\s.]?[0-9]{4,}$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
  numeric: /^\d+$/,
  alphaNumeric: /^[a-zA-Z0-9 ]+$/,
} as const;

/**
 * Valida un correo electrónico
 */
export const isValidEmail = (email: string): boolean => {
  return patterns.email.test(email);
};

/**
 * Valida un número de teléfono
 */
export const isValidPhone = (phone: string): boolean => {
  return patterns.phone.test(phone);
};

/**
 * Valida una URL
 */
export const isValidUrl = (url: string): boolean => {
  return patterns.url.test(url);
};

/**
 * Valida que el valor no esté vacío
 */
export const isRequired = (value: string): boolean => {
  return value.trim() !== '';
};

/**
 * Valida la longitud mínima de un texto
 */
export const minLength = (value: string, min: number): boolean => {
  return value.length >= min;
};

/**
 * Valida la longitud máxima de un texto
 */
export const maxLength = (value: string, max: number): boolean => {
  return value.length <= max;
};

/**
 * Valida que el valor sea numérico
 */
export const isNumeric = (value: string): boolean => {
  return patterns.numeric.test(value);
};

/**
 * Valida que el valor esté dentro de un rango numérico
 */
export const isInRange = (
  value: number,
  min: number,
  max: number
): boolean => {
  return value >= min && value <= max;
};

/**
 * Valida un formulario completo
 */
export interface ValidationRule {
  field: string;
  value: any;
  rules: Array<{
    validator: (value: any, ...args: any[]) => boolean;
    message: string;
    params?: any[];
  }>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export const validateForm = (validations: ValidationRule[]): ValidationResult => {
  const errors: Record<string, string[]> = {};
  let isValid = true;

  validations.forEach(({ field, value, rules }) => {
    const fieldErrors: string[] = [];

    rules.forEach(({ validator, message, params = [] }) => {
      const isValidField = validator(value, ...params);
      if (!isValidField) {
        fieldErrors.push(message);
        isValid = false;
      }
    });

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  });

  return { isValid, errors };
};
