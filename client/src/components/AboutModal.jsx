import { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const sampleImages = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=60',
];

const AboutModal = ({ open, onClose }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!open) return undefined;
    const handleEsc = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const cardClasses = `w-full max-w-3xl rounded-3xl p-6 shadow-2xl ${
    isDark ? 'border border-[#45201e]/70 bg-[#1a0a0d]' : 'bg-[#fff4ec] border border-[#f4cdbb]'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div role="dialog" aria-modal="true" className={cardClasses}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
              Memorylife
            </p>
            <h3 className="mt-2 text-2xl font-semibold">{t('about.title')}</h3>
            <p className={`mt-2 text-sm ${isDark ? 'text-[#fcded0]' : 'text-[#72312a]'}`}>
              {t('about.body')}
            </p>
            <p className={`mt-3 text-sm font-semibold ${isDark ? 'text-[#ffd3b9]' : 'text-[#5b261f]'}`}>
              {t('about.note')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full border p-2 transition ${
              isDark
                ? 'border-[#f4c7ad]/40 text-[#fbe1d3] hover:border-[#ffb285]'
                : 'border-[#f4cbb8] text-[#6b2b23] hover:text-[#a1513e]'
            }`}
            aria-label="Close about modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
              <path
                d="M6 18L18 6M6 6l12 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {sampleImages.map((src, idx) => (
            <div
              key={src}
              className={`overflow-hidden rounded-2xl border ${
                isDark ? 'border-[#51302b]' : 'border-[#f5cdbb]'
              }`}
            >
              <img src={src} alt="Memorylife QR plaque example" className="h-40 w-full object-cover" />
              <p className={`p-3 text-sm ${isDark ? 'text-[#fcdccf]' : 'text-[#6c2f25]'}`}>
                {t('about.examples')[idx]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
