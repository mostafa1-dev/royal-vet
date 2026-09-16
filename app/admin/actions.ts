'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { supabase } from '../utils/supabase';

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (token !== 'authenticated') {
    throw new Error('غير مصرح لك بالقيام بهذا الإجراء');
  }
}

export async function login(formData: FormData) {
  const password = formData.get('password') as string;
  const adminPassword = process.env.ADMIN_PASSWORD || 'royal3032003';
  
  if (password === adminPassword) {
    const cookieStore = await cookies();
    cookieStore.set('admin_token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    redirect('/admin');
  }
  
  // Security: Artificial delay to mitigate brute force attacks and timing attacks
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return { error: 'كلمة المرور غير صحيحة' };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  redirect('/admin/login');
}

export async function getWaitlistData() {
  try {
    await requireAdmin();
    const data = await prisma.waitlist.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return data;
  } catch (error) {
    console.error('Failed to fetch waitlist:', error);
    return [];
  }
}

export async function updateStatus(id: number, newStatus: string) {
  try {
    await requireAdmin();
    await prisma.waitlist.update({
      where: { id },
      data: { status: newStatus },
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Failed to update status:', error);
    return { error: 'فشل في تحديث حالة العميل' };
  }
}

export async function deleteEntry(id: number) {
  try {
    await requireAdmin();
    await prisma.waitlist.delete({
      where: { id },
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete entry:', error);
    return { error: 'فشل في حذف العميل' };
  }
}

/**
 * Creates a signed upload URL for the catalog.
 * This allows the client browser to upload large files (30MB+) directly to Supabase Storage,
 * completely bypassing Vercel's 4.5MB Serverless Function payload limit.
 */
export async function getSignedCatalogUploadUrl() {
  try {
    await requireAdmin();
    const { data, error } = await supabase.storage
      .from('assets')
      .createSignedUploadUrl('catalog.pdf', { upsert: true });

    if (error || !data) {
      console.error('Supabase signed upload URL error:', error);
      return { error: 'فشل في إنشاء رابط الرفع المباشر من مساحة التخزين' };
    }

    return { signedUrl: data.signedUrl, path: data.path };
  } catch (error) {
    console.error('Error in getSignedCatalogUploadUrl:', error);
    return { error: 'غير مصرح لك أو حدث خطأ أثناء تجهيز الرفع' };
  }
}

/**
 * Revalidates cache after successful direct upload
 */
export async function notifyCatalogUpdated() {
  try {
    await requireAdmin();
    revalidatePath('/admin');
    revalidatePath('/api/catalog');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error notifying catalog update:', error);
    return { error: 'فشل في تحديث الروابط' };
  }
}

export async function uploadCatalog(formData: FormData) {
  try {
    await requireAdmin();
    const file = formData.get('catalog') as File;
    if (!file) {
      return { error: 'برجاء اختيار ملف' };
    }

    const arrayBuffer = await file.arrayBuffer();

    const { error } = await supabase.storage
      .from('assets')
      .upload('catalog.pdf', arrayBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { error: 'فشل في رفع الملف، تأكد من إعدادات مساحة التخزين' };
    }

    revalidatePath('/admin');
    revalidatePath('/api/catalog');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to upload catalog:', error);
    return { error: 'حدث خطأ غير متوقع أثناء الرفع' };
  }
}
