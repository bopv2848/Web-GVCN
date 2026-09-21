import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    !supabaseUrl.includes('placeholder') &&
    supabaseAnonKey &&
    !supabaseAnonKey.includes('placeholder')
);

if (!isSupabaseConfigured) {
  console.warn('⚠️ Hệ thống đang chạy ở chế độ Offline / Mock dữ liệu cục bộ (Supabase URL Placeholder)');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    ...(!isSupabaseConfigured
      ? {
          global: {
            fetch: () => Promise.reject(new TypeError('Failed to fetch: Supabase is offline/unconfigured')),
          },
        }
      : {}),
  }
);
