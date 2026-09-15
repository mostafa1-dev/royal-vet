import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from './utils/LanguageContext';
import SmoothScroll from '../components/SmoothScroll';
import CustomCursor from '../components/CustomCursor';
import Preloader from '../components/Preloader';
import BackgroundEffects from '../components/BackgroundEffects';
import ConsoleSuppressor from '../components/ConsoleSuppressor';

const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Royal Vet | رويال ڤيت - الرعاية البيطرية بمفهوم جديد',
  description: 'العيادة البيطرية الأفضل لرعاية أليفك. نقدم مستويات عالمية من العناية الطبية والخدمات الفندقية للحيوانات الأليفة في مصر.',
  keywords: ['عيادة بيطرية', 'دكتور بيطري', 'علاج قطط', 'علاج كلاب', 'تطعيمات', 'فندق حيوانات', 'رويال فيت', 'Royal Vet', 'Veterinary', 'Pet Care'],
  authors: [{ name: 'Royal Vet' }],
  creator: 'Royal Vet',
  publisher: 'Royal Vet',
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: 'https://royalveteg.com', // Adjust when domain is bought
    siteName: 'Royal Vet | رويال ڤيت',
    title: 'Royal Vet | رويال ڤيت',
    description: 'العيادة البيطرية الأفضل لرعاية أليفك بمعايير عالمية.',
    images: [
      {
        url: '/logo.png', // The OG Image will be the golden logo
        width: 1200,
        height: 630,
        alt: 'Royal Vet Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Royal Vet | رويال ڤيت',
    description: 'العيادة البيطرية الأفضل لرعاية أليفك بمعايير عالمية.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

import { Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#000000', // Matches the dark cinematic background
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" suppressHydrationWarning className={`${cairo.variable}`}>
      <body suppressHydrationWarning className={`font-sans bg-transparent antialiased selection:bg-[#D4AF37]/30 selection:text-white`}>
        <ConsoleSuppressor />
        <BackgroundEffects />
        <Preloader />
        <CustomCursor />
        <div className="relative z-10 flex flex-col min-h-[100dvh] w-full">
          <LanguageProvider>
            <SmoothScroll>
              {/* <Navbar /> */}
              <main className="flex-1 w-full min-h-[100dvh]">
                {children}
              </main>
              {/* <Footer /> */}
            </SmoothScroll>
            {/* <FloatingCalculatorBtn /> */}
          </LanguageProvider>
        </div>
      </body>
    </html>
  );
}