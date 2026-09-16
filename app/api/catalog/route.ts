import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://addlynusetvlnhggzwnj.supabase.co';
  // Add a real-time timestamp to force browsers and CDNs to fetch the newly uploaded file every time
  const fileUrl = `${supabaseUrl}/storage/v1/object/public/assets/catalog.pdf?t=${Date.now()}`;
  
  const response = NextResponse.redirect(fileUrl, {
    status: 307,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });

  return response;
}

