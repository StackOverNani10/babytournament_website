import { useEffect, useState } from 'react';
import { dataService, DataService } from '@/lib/data/dataService';

export function useDataService() {
  const [service] = useState<DataService>(() => dataService);
  
  // Log the current data source for debugging
  useEffect(() => {
    const source = import.meta.env.VITE_USE_MOCK_DATA === 'true' 
      ? 'MOCK DATA' 
      : 'SUPABASE';
    console.log(`Using data source: ${source}`);
  }, []);
  
  return service;
}
