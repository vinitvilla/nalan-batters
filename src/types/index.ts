// Export all types from a central location
export * from './user';
export * from './address';
export * from './product';
export * from './order';
export * from './pos';

// API Response wrapper types
// TODO: Replace any with a proper type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Common filter types
export interface DateRange {
  from: Date;
  to: Date;
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, unknown>;
  dateRange?: DateRange;
}
