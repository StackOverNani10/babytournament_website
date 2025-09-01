// Re-export everything from the client
export * from './client';

// Export the supabase client instance as default
export { supabase } from './client';

// Export types
export type {
  Tables,
  InsertTables,
  UpdateTables,
  TableRow,
  InsertRow,
  UpdateRow,
} from './types';
