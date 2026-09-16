'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  updateStatus, 
  deleteEntry, 
  logout, 
  uploadCatalog, 
  getSignedCatalogUploadUrl, 
  notifyCatalogUpdated,
  getCatalogDownloadsCount 
} from './actions';

type WaitlistEntry = {
  id: number;
  name: string | null;
  phone: string;
  status: string;
  createdAt: Date;
};

export default function DashboardClient({ 
  initialData, 
  initialDownloadsCount = 0 
}: { 
  initialData: WaitlistEntry[];
  initialDownloadsCount?: number;
}) {
  const [data, setData] = useState(initialData);
  const [downloadsCount, setDownloadsCount] = useState(initialDownloadsCount);
  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Real-time background sync for downloads count (every 10 seconds)
  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const count = await getCatalogDownloadsCount();
        if (isMounted) {
          setDownloadsCount(count);
        }
      } catch (err) {
        // silent fail on background poll
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      alert('يجب اختيار ملف PDF فقط');
      e.target.value = '';
      return;
    }

    // Check size against Supabase limit (50MB)
    const MAX_SIZE_BYTES = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      alert(`حجم الملف (${(file.size / (1024 * 1024)).toFixed(1)} ميجابايت) يتجاوز الحد الأقصى لمساحة التخزين (50 ميجابايت). برجاء تقليل حجم الملف قليلاً.`);
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Get signed upload URL directly from Supabase via server action
      const signedRes = await getSignedCatalogUploadUrl();

      if (signedRes.error || !signedRes.signedUrl) {
        setIsUploading(false);
        setUploadProgress(null);
        e.target.value = '';
        alert('تعذر تجهيز الرفع: ' + (signedRes.error || 'تأكد من إعدادات المفاتيح والصلاحيات'));
        return;
      }

      // 2. Direct upload to Supabase Storage with progress tracking
      // This completely bypasses Vercel's 4.5MB Serverless function limit!
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', signedRes.signedUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/pdf');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = async () => {
        setIsUploading(false);
        setUploadProgress(null);
        e.target.value = '';

        if (xhr.status >= 200 && xhr.status < 300) {
          await notifyCatalogUpdated();
          alert(`تم رفع وتحديث الكتالوج بنجاح (${(file.size / (1024 * 1024)).toFixed(1)} ميجابايت)! 🚀`);
        } else {
          console.error('Direct upload failed:', xhr.status, xhr.responseText);
          alert(`فشل رفع الملف إلى مساحة التخزين (كود: ${xhr.status}) - ${xhr.responseText || 'تأكد من إعدادات Supabase Storage'}`);
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        setUploadProgress(null);
        e.target.value = '';
        alert('حدث خطأ في الاتصال أثناء نقل الملف إلى مساحة التخزين.');
      };

      xhr.send(file);
    } catch (err: any) {
      console.error('Upload exception:', err);
      setIsUploading(false);
      setUploadProgress(null);
      e.target.value = '';
      alert('حدث خطأ غير متوقع: ' + (err?.message || String(err)));
    }
  };

  // Filtering
  const filteredData = data.filter(entry => 
    (entry.name?.toLowerCase().includes(search.toLowerCase()) || '') ||
    entry.phone.includes(search)
  );

  // Stats
  const total = data.length;
  const newContacts = data.filter(e => e.status === 'NEW').length;
  const contacted = data.filter(e => e.status === 'CONTACTED').length;

  const handleStatusToggle = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'NEW' ? 'CONTACTED' : 'NEW';
    // Optimistic update
    setData(data.map(item => item.id === id ? { ...item, status: newStatus } : item));
    const result = await updateStatus(id, newStatus);
    if (result.error) {
      // Revert on error
      setData(data.map(item => item.id === id ? { ...item, status: currentStatus } : item));
      alert(result.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      const original = [...data];
      setData(data.filter(item => item.id !== id));
      const result = await deleteEntry(id);
      if (result.error) {
        setData(original);
        alert(result.error);
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['الاسم', 'رقم الواتساب', 'تاريخ التسجيل', 'الحالة'];
    const rows = filteredData.map(e => [
      e.name || 'لم يكتب',
      e.phone,
      new Date(e.createdAt).toLocaleString('ar-EG'),
      e.status === 'NEW' ? 'جديد' : 'تم التواصل'
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM for arabic
    csvContent += headers.join(",") + "\n";
    rows.forEach(row => {
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `royal_vet_waitlist_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-serif mb-2">لوحة التحكم</h1>
          <p className="text-[#D4AF37]">إدارة قائمة الانتظار</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToCSV}
            className="px-6 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition border border-white/20 flex items-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            تصدير CSV
          </button>
          
          <label className={`relative overflow-hidden px-6 py-2 rounded-xl text-white transition border flex items-center gap-2 cursor-pointer select-none ${
            isUploading 
              ? 'bg-[#D4AF37]/30 border-[#D4AF37]/60 cursor-not-allowed'
              : 'bg-[#D4AF37]/20 border-[#D4AF37]/30 hover:bg-[#D4AF37]/30'
          }`}>
            {isUploading && uploadProgress !== null && (
              <span 
                className="absolute inset-y-0 right-0 bg-[#D4AF37]/40 transition-all duration-200 pointer-events-none"
                style={{ width: `${uploadProgress}%` }}
              />
            )}
            {isUploading ? (
              <svg className="animate-spin relative z-10" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            )}
            <span className="relative z-10 font-medium">
              {isUploading 
                ? (uploadProgress !== null ? `جاري الرفع ${uploadProgress}%` : 'جاري التحضير...') 
                : 'تحديث الكتالوج'}
            </span>
            <input 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
          <button 
            onClick={() => logout()}
            className="px-6 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition border border-red-500/20"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-premium p-6 rounded-2xl border border-[#D4AF37]/30 relative overflow-hidden group hover:border-[#D4AF37]/60 transition-all duration-300">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-400 text-sm">إجمالي المسجلين</h3>
            <span className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
          </div>
          <p className="text-4xl font-bold text-white font-serif tracking-tight">{total}</p>
        </div>

        <div className="glass-premium p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-green-500/40 transition-all duration-300">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-400 text-sm">عملاء جدد</h3>
            <span className="p-2 rounded-xl bg-green-500/10 text-green-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </span>
          </div>
          <p className="text-4xl font-bold text-green-400 font-serif tracking-tight">{newContacts}</p>
        </div>

        <div className="glass-premium p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-gray-400/40 transition-all duration-300">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-400 text-sm">تم التواصل</h3>
            <span className="p-2 rounded-xl bg-gray-500/10 text-gray-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </div>
          <p className="text-4xl font-bold text-gray-300 font-serif tracking-tight">{contacted}</p>
        </div>

        <div className="glass-premium p-6 rounded-2xl border border-[#D4AF37]/40 relative overflow-hidden bg-gradient-to-br from-[#D4AF37]/10 via-transparent to-transparent group hover:border-[#D4AF37] hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-all duration-500">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[#D4AF37] font-medium text-sm flex items-center gap-2">
              تحميلات الكتالوج
              <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="محدث لحظياً" />
            </h3>
            <span className="p-2 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)] group-hover:scale-110 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-white font-serif tracking-tight">{downloadsCount}</p>
            <span className="text-xs text-[#D4AF37]/70 font-sans">تنزيل مباشر</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="glass-premium p-4 rounded-2xl flex items-center gap-3">
        <svg width="20" height="20" className="text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text"
          placeholder="ابحث بالاسم أو الرقم..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-500"
        />
      </div>

      {/* Table */}
      <div className="glass-premium rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-4 text-gray-400 font-normal">الاسم</th>
                <th className="p-4 text-gray-400 font-normal">رقم الواتساب</th>
                <th className="p-4 text-gray-400 font-normal">التاريخ</th>
                <th className="p-4 text-gray-400 font-normal">الحالة</th>
                <th className="p-4 text-gray-400 font-normal">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    لا يوجد عملاء مطابقين للبحث
                  </td>
                </tr>
              ) : (
                filteredData.map((entry) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={entry.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="p-4 text-white font-medium">{entry.name || <span className="text-gray-500 italic">لم يكتب</span>}</td>
                    <td className="p-4 text-white" dir="ltr">
                      {entry.phone}
                    </td>
                    <td className="p-4 text-gray-300 text-sm" suppressHydrationWarning>
                      {new Date(entry.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleStatusToggle(entry.id, entry.status)}
                        className={`px-3 py-1 text-xs rounded-full border transition ${
                          entry.status === 'NEW' 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30' 
                            : 'bg-gray-500/20 text-gray-300 border-gray-500/30 hover:bg-gray-500/30'
                        }`}
                      >
                        {entry.status === 'NEW' ? 'جديد' : 'تم التواصل'}
                      </button>
                    </td>
                    <td className="p-4 flex gap-2">
                      <a 
                        href={`https://wa.me/${entry.phone.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 transition tooltip-container relative group"
                        title="مراسلة واتساب"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </a>
                      <button 
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                        title="حذف"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                        </svg>
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
