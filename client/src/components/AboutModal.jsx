import { useEffect, useRef, useState } from 'react';
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

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!open) return undefined;
    const handleEsc = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    setOffset({ x: 0, y: 0 });
    setIsDragging(false);
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!isDragging) return undefined;
    const handleMove = (event) => {
      const pointerX = event.clientX ?? (event.touches ? event.touches[0].clientX : 0);
      const pointerY = event.clientY ?? (event.touches ? event.touches[0].clientY : 0);
      const deltaX = pointerX - dragStartRef.current.x;
      const deltaY = pointerY - dragStartRef.current.y;
      setOffset({
        x: dragOffsetRef.current.x + deltaX,
        y: dragOffsetRef.current.y + deltaY,
      });
    };
    const stop = () => setIsDragging(false);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stop);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stop);
    };
  }, [isDragging]);

  const startDrag = (event) => {
    if (event.currentTarget !== event.target) {
      return;
    }
    const pointerX = event.clientX ?? (event.touches ? event.touches[0].clientX : 0);
    const pointerY = event.clientY ?? (event.touches ? event.touches[0].clientY : 0);
    dragStartRef.current = { x: pointerX, y: pointerY };
    dragOffsetRef.current = offset;
    setIsDragging(true);
    event.preventDefault();
  };

  if (!open) {
    return null;
  }

  const cardClasses = `w-full max-w-3xl rounded-3xl p-6 shadow-2xl ${
    isDark ? 'border border-[#45201e]/70 bg-[#1a0a0d]' : 'bg-[#fff4ec] border border-[#f4cdbb]'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div
        role="dialog"
        aria-modal="true"
        className={cardClasses}
        style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
        onPointerDown={startDrag}
      >
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

        <div className="mt-6 flex justify-end">
          <a
            href={t('about.demoUrl')}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
              isDark
                ? 'border border-[#f4c7ad]/40 text-[#ffe2d1] hover:bg-[#f4c7ad]/10'
                : 'border border-[#f5cdbb] text-[#6c2f25] hover:bg-[#ffe3d1]'
            }`}
          >
            {t('about.demoLink')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
