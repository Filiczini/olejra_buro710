export interface ApiError {
  response?: {
    data?: {
      error?: string;
      field?: string;
      details?: { field: string; message: string }[];
    };
  };
}
