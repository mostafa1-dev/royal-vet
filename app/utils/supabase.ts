import { createClient, SupabaseClient } from '@supabase/supabase-js';

const defaultUrl = 'https://addlynusetvlnhggzwnj.supabase.co';

/**
 * Creates a Supabase client dynamically at runtime to ensure the latest
 * SUPABASE_SERVICE_ROLE_KEY environment variable is always read in serverless functions.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || defaultUrl).trim();
  let serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  // Strip wrapping quotes if pasted with quotes
  if ((serviceKey.startsWith('"') && serviceKey.endsWith('"')) || (serviceKey.startsWith("'") && serviceKey.endsWith("'"))) {
    serviceKey = serviceKey.slice(1, -1).trim();
  }

  if (!serviceKey || serviceKey === 'dummy_key_prevent_build_crash') {
    throw new Error('مفتاح SUPABASE_SERVICE_ROLE_KEY غير معرف أو غير موجود في متغيرات بيئة Vercel');
  }

  // Check for bullet character (8226 / •) caused by copying masked passwords
  if (serviceKey.charCodeAt(0) > 255 || serviceKey.includes('•')) {
    throw new Error('قيمة SUPABASE_SERVICE_ROLE_KEY في Vercel تم حفظها كنقاط سرية (••••) بدلاً من النص الفعلي للمفتاح. برجاء مسحها ولصق المفتاح الحقيقي.');
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
