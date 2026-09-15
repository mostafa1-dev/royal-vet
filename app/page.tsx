'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ComingSoonPage() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const glowRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.background = `radial-gradient(800px circle at ${e.clientX}px ${e.clientY}px, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 25%, transparent 60%)`;
      }
    };
    
    window.addEventListener('mousemove', updateMousePosition, { passive: true });
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setStatus('loading');
    
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name }),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full max-w-full bg-transparent flex flex-col items-center font-sans text-white" dir="rtl">
      
      {/* Dynamic Cinematic Background Glow following mouse */}
      <div 
        ref={glowRef}
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500 hidden md:block"
      />
      
      {/* Existing Static Background Glow */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] rounded-full pointer-events-none z-0" 
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 60%)' }}
      />
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4 sm:px-6 lg:px-8 text-center my-auto pt-12 pb-32 md:py-20">
        
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 2.0 }}
          className="mb-6 md:mb-10 relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-[#D4AF37]/30 blur-[40px] rounded-full pointer-events-none z-0" />
          <Image 
            src="/logo.png" 
            alt="Royal Vet" 
            fill
            sizes="(max-width: 768px) 128px, 160px"
            priority
            className="object-contain relative z-10"
          />
        </motion.div>

        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(5px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 2.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 mb-8"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"></div>
          <span className="text-[#D4AF37] text-sm font-medium tracking-wide">قريباً</span>
        </motion.div>

        {/* Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1], delay: 2.4 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight drop-shadow-2xl"
          style={{ fontFamily: 'var(--font-cairo)' }}
        >
          <span className="block text-white">الرعاية البيطرية</span>
          <span className="block mt-1 md:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] pb-4 drop-shadow-[0_2px_20px_rgba(212,175,55,0.3)]">
            بمفهوم جديد
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p 
          initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1], delay: 2.6 }}
          className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          رويال ڤيت بتقدملك مستوى ثاني من العناية لأليفك، بمعايير عالمية وخبرة استثنائية وتجربة لا تُنسى.
        </motion.p>

        {/* Download Catalog Button */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1], delay: 2.8 }}
          className="mb-16"
        >
          <motion.a 
            href="/api/catalog"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderColor: "rgba(255,255,255,0.1)"
            }}
            whileHover={{ 
              scale: 1.05, 
              y: -4,
              backgroundColor: "rgba(255,255,255,0.15)",
              borderColor: "rgba(212,175,55,0.6)",
              boxShadow: "0px 20px 40px rgba(212,175,55,0.25)",
            }}
            whileTap={{ scale: 0.96, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="inline-flex items-center gap-3 px-8 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] text-gray-300 hover:text-white text-sm font-medium"
          >
            <span>تحميل الكتالوج</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15V3M12 15L8 11M12 15L16 11M21 21H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.a>
        </motion.div>

        {/* Waitlist Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1], delay: 3.0 }}
          className="w-full max-w-2xl mx-auto relative min-h-[120px]"
        >
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="flex flex-col items-center justify-center py-10 px-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-[#D4AF37]/30 shadow-[0_0_50px_rgba(212,175,55,0.1)] w-full relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/5 to-transparent pointer-events-none" />
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.2, stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F3E5AB] flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </motion.div>
                <motion.h3 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl md:text-3xl font-bold text-white mb-3"
                >
                  مرحباً بك في <span className="text-[#D4AF37]">عالم رويال ڤيت!</span>
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-400 text-center text-sm md:text-base max-w-sm"
                >
                  تم تسجيل بياناتك بنجاح، هنكون على تواصل معاك فور إطلاق النظام لتعيش تجربة استثنائية.
                </motion.p>
              </motion.div>
            ) : (
              <motion.div key="form" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="h-px bg-gradient-to-r from-transparent to-[#D4AF37]/30 flex-1"></div>
                  <h3 className="text-[#D4AF37] font-bold text-lg whitespace-nowrap">كن أول من يعرف</h3>
                  <div className="h-px bg-gradient-to-l from-transparent to-[#D4AF37]/30 flex-1"></div>
                </div>

                <motion.form 
                  onSubmit={handleSubmit}
                  className="relative flex flex-col md:flex-row items-center w-full rounded-[2rem] md:rounded-full glass-premium p-2 md:p-1.5 md:pl-2 md:pr-6 hover:shadow-[0_0_40px_rgba(212,175,55,0.15)] focus-within:shadow-[0_0_50px_rgba(212,175,55,0.25)] focus-within:border-[#D4AF37]/30 transition-all duration-500 group"
                >
                  <div className="flex flex-col md:flex-row items-center flex-1 w-full relative z-10 gap-2 md:gap-0 md:pl-[200px]">
                    
                    {/* Name Input */}
                    <div className="flex items-center gap-4 text-[#D4AF37] w-full px-4 py-5 md:py-3 border-b md:border-b-0 md:border-l border-white/5 md:border-white/10 transition-colors group-hover:border-white/20">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      <input 
                        type="text"
                        name="name"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="الاسم (اختياري)..."
                        className="bg-transparent border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 text-white w-full text-right text-base md:text-lg placeholder:text-white/30 font-sans transition-colors"
                        dir="rtl"
                      />
                    </div>

                    {/* Phone Input */}
                    <div className="flex items-center gap-4 text-[#D4AF37] w-full px-4 py-5 md:py-3">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="opacity-80">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      <input 
                        type="tel"
                        name="phone"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="رقم الواتساب..."
                        className="bg-transparent border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 text-white w-full text-right text-base md:text-lg placeholder:text-white/30 font-sans transition-colors"
                        dir="rtl"
                        required
                      />
                    </div>

                  </div>
                  
                  <motion.button 
                    type="submit"
                    disabled={status === 'loading'}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95, y: 2 }}
                    className="group relative w-full md:w-auto px-8 py-5 md:py-0 md:absolute md:left-1.5 md:top-1.5 md:bottom-1.5 rounded-[1.5rem] md:rounded-full font-bold text-base md:text-lg flex items-center justify-center gap-3 whitespace-nowrap overflow-hidden transition-all duration-500 shadow-[0_10px_20px_rgba(212,175,55,0.2),inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.5)] hover:shadow-[0_15px_30px_rgba(212,175,55,0.4),inset_0_-2px_4px_rgba(0,0,0,0.4),inset_0_4px_8px_rgba(255,255,255,0.6)]"
                  >
                    {/* Metallic 3D Background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#FCF6BA] via-[#D4AF37] to-[#B38728] transition-all duration-500 group-hover:from-[#FFFFFF] group-hover:via-[#F3E5AB] group-hover:to-[#D4AF37]"></div>
                    
                    {/* Inner Edge Highlight */}
                    <div className="absolute inset-0 rounded-[1.5rem] md:rounded-full border border-white/40 pointer-events-none"></div>

                    {/* Animated Glare/Shine */}
                    <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out"></div>

                    <span className="relative z-10 text-[#2A2000] drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                      {status === 'loading' ? 'جاري التسجيل...' : 'عرفني لما يجهز'}
                    </span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 rotate-180 hidden md:block text-[#2A2000] drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)] group-hover:translate-x-1 transition-transform duration-300">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </motion.button>
                </motion.form>

                {status === 'error' && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm mt-4 text-center">حدث خطأ، أو أن الرقم مسجل بالفعل.</motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Large Background Text */}
      <div className="absolute bottom-6 sm:bottom-[2%] md:bottom-[-4%] lg:bottom-[-8%] left-0 w-full flex justify-center pointer-events-none z-0 overflow-hidden">
        <h1 
          dir="ltr"
          className="text-[18vw] sm:text-[16vw] md:text-[14vw] lg:text-[16vw] font-serif font-bold text-white/[0.03] tracking-wider whitespace-nowrap uppercase select-none leading-none flex"
        >
          {"COMING SOON".split("").map((char, index) => (
            <motion.span
              key={index}
              initial={{ y: 60, scale: 0.9, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ 
                duration: 1.5, 
                ease: [0.22, 1, 0.36, 1], 
                delay: 3.2 + (index * 0.05) 
              }}
              className="inline-block transform-gpu will-change-transform"
              style={{ transformOrigin: "bottom center" }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </h1>
      </div>
      
    </div>
  );
}
