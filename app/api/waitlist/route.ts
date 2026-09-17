import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const { name, phone } = await request.json();

    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Normalize phone number
    let normalizedPhone = phone.trim();

    // 1. Convert Arabic/Eastern Arabic numerals to Western digits
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    for (let i = 0; i < 10; i++) {
      normalizedPhone = normalizedPhone.replace(new RegExp(arabicNumbers[i], 'g'), i.toString());
    }

    // 2. Extract leading '+' if present
    const hasPlus = normalizedPhone.startsWith('+');

    // 3. Remove all non-digit characters (spaces, dashes, parens, etc.)
    normalizedPhone = normalizedPhone.replace(/\D/g, '');

    // 4. Put '+' back if it was there
    if (hasPlus) {
      normalizedPhone = '+' + normalizedPhone;
    }

    // Security: Strict Phone Validation (length between 8 and 15 digits)
    const digitsOnlyLength = normalizedPhone.replace('+', '').length;
    if (digitsOnlyLength < 8 || digitsOnlyLength > 15) {
      return NextResponse.json({ error: 'Invalid phone number length or format' }, { status: 400 });
    }

    // Security: Name Length Validation (Prevent payload flooding)
    if (name && (typeof name !== 'string' || name.length > 100)) {
      return NextResponse.json({ error: 'Name is too long or invalid' }, { status: 400 });
    }

    // Check if phone already exists
    const existing = await prisma.waitlist.findUnique({
      where: { phone: normalizedPhone },
    });

    if (existing) {
      return NextResponse.json({ error: 'Phone number already registered' }, { status: 409 });
    }

    const waitlist = await prisma.waitlist.create({
      data: {
        name: name || null,
        phone: normalizedPhone,
      },
    });

    // Instantly invalidate admin dashboard cache so the registration appears immediately
    try {
      revalidatePath('/admin');
    } catch (cacheErr) {
      console.error('Failed to revalidate /admin cache:', cacheErr);
    }

    return NextResponse.json({ success: true, data: waitlist }, { status: 201 });
  } catch (error) {
    console.error('Waitlist API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
