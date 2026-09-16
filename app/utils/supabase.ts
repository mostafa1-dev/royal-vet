import { createClient, SupabaseClient } from '@supabase/supabase-js';

const defaultUrl = 'https://addlynusetvlnhggzwnj.supabase.co';

/**
 * Creates a Supabase client dynamically at runtime to ensure the latest
 * SUPABASE_SERVICE_ROLE_KEY environment variable is always read in serverless functions.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultUrl;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey || serviceKey === 'dummy_key_prevent_build_crash') {
    throw new Error('مفتاح SUPABASE_SERVICE_ROLE_KEY غير معرف أو غير موجود في متغيرات بيئة السيرفر');
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Fallback client for static builds to prevent build-time crashes
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || defaultUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key_prevent_build_crash',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
