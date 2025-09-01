import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth/AuthContext';

interface ApiCallOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  showSuccess?: boolean;
  showError?: boolean;
}

export function useApi<T = any>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  const { checkAuth } = useAuth();

  const callApi = useCallback(async (
    url: string, 
    options: RequestInit = {},
    callOptions: ApiCallOptions<T> = {}
  ): Promise<T | null> => {
    const {
      onSuccess,
      onError,
      successMessage,
      errorMessage,
      showSuccess = true,
      showError = true
    } = callOptions;

    setIsLoading(true);
    setError(null);

    try {
      // Ensure we have a valid session
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorMessage || 'Something went wrong'
        );
      }

      const responseData = await response.json().catch(() => ({} as T));
      
      setData(responseData);
      onSuccess?.(responseData);
      
      if (showSuccess && successMessage) {
        toast.success(successMessage);
      }

      return responseData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      onError?.(error);
      
      if (showError) {
        toast.error(errorMessage || error.message);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [checkAuth]);

  return {
    callApi,
    isLoading,
    error,
    data,
  };
}
