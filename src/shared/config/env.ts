export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  apiAdapter: (import.meta.env.VITE_API_ADAPTER ?? 'mock') as 'mock' | 'supabase',
} as const;
