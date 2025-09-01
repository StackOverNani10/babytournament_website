// @ts-ignore - We'll handle the type issues with a custom interface
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a type for the sanitizer function
type Sanitizer = {
  setConfig: (config: {
    ALLOWED_TAGS?: string[];
    ALLOWED_ATTR?: string[];
    FORBID_TAGS?: string[];
    FORBID_ATTR?: string[];
  }) => void;
  sanitize: (html: string) => string;
};

let domPurify: Sanitizer;

if (typeof window === 'undefined') {
  // Node.js environment
  const { window } = new JSDOM('');
  const { document } = window;
  global.window = window as unknown as Window & typeof globalThis;
  global.document = document as unknown as Document;
  
  // @ts-ignore - We know this works at runtime
  domPurify = DOMPurify(window);
} else {
  // Browser environment
  // @ts-ignore - We know this works at runtime
  domPurify = DOMPurify;
}

// Configuration for DOMPurify
domPurify.setConfig({
  ALLOWED_TAGS: [
    'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'hr'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
  FORBID_ATTR: ['onclick', 'onerror', 'onload', 'onmouseover'],
});

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param dirty - The string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';
  return domPurify.sanitize(dirty);
}

/**
 * Sanitizes a plain text input by escaping HTML special characters
 * @param input - The string to escape
 * @returns Escaped string
 */
export function escapeHtml(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitizes a URL to prevent XSS and other attacks
 * @param url - The URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    const parsedUrl = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return '';
    }
    
    // Additional security checks
    if (parsedUrl.hostname.includes('javascript:') || 
        parsedUrl.hostname.includes('data:') ||
        parsedUrl.hostname.includes('vbscript:')) {
      return '';
    }
    
    return parsedUrl.toString();
  } catch (e) {
    return '';
  }
}

/**
 * Sanitizes an object's string properties recursively
 * @param obj - The object to sanitize
 * @returns A new object with sanitized string properties
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }
  
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (typeof value === 'string') {
      acc[key] = escapeHtml(value);
    } else if (value && typeof value === 'object') {
      acc[key] = sanitizeObject(value);
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>) as T;
}

/**
 * Sanitizes form data before processing
 * @param formData - The form data to sanitize
 * @returns Sanitized form data
 */
export function sanitizeFormData<T extends Record<string, any>>(formData: T): T {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      // For email fields, only escape special characters
      if (key.toLowerCase().includes('email')) {
        sanitized[key] = escapeHtml(value.trim());
      } 
      // For URLs, sanitize them
      else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('website')) {
        sanitized[key] = sanitizeUrl(value.trim());
      }
      // For rich text fields, allow some HTML
      else if (key.toLowerCase().includes('description') || key.toLowerCase().includes('content')) {
        sanitized[key] = sanitizeHtml(value);
      }
      // For other string fields, escape HTML
      else {
        sanitized[key] = escapeHtml(value.trim());
      }
    } 
    // Recursively sanitize nested objects
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeFormData(value);
    } 
    // Sanitize arrays of strings or objects
    else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? escapeHtml(item.trim()) : sanitizeFormData(item)
      );
    } 
    // Pass through other types (numbers, booleans, etc.)
    else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}
