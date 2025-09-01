import type { Database } from '../database.types';

export type TableName = keyof Database['public']['Tables'];

export type Tables = {
  [K in TableName]: Database['public']['Tables'][K]['Row'];
};

export type InsertTables = {
  [K in TableName]: Database['public']['Tables'][K]['Insert'];
};

export type UpdateTables = {
  [K in TableName]: Database['public']['Tables'][K]['Update'];
};

export type TableRow<T extends TableName> = Tables[T];
export type InsertRow<T extends TableName> = InsertTables[T];
export type UpdateRow<T extends TableName> = UpdateTables[T];

export type { Database };
