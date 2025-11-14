import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';

const API_URL = 'https://memorylife-ee.onrender.com';
const API_BASE_URL = import.meta.env.VITE_API_URL || `${API_URL}/api`;
const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80';

const LegacyPage = () => {
  const { slug } = useParams();
  const [legacy, setLegacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useLanguage();

  useEffect(() => {
    let isMounted = true;
    const fetchLegacy = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/legacy/${slug}`);
        if (isMounted) {
          setLegacy(data);
          setError('');
        }
      } catch (err) {
        const message = err?.response?.data?.message || t('legacyPage.notFoundDesc');
        if (isMounted) {
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLegacy();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (legacy?.title) {
      document.title = `Memorylife - ${legacy.title}`;
    } else {
      document.title = 'Memorylife - legacy page';
    }
  }, [legacy]);

  if (loading) {
    return (
      <div
        className={`flex min-h-screen flex-col items-center justify-center ${
          isDark ? 'bg-[#1b0f13] text-[#f9ddcf]' : 'bg-[#fff5ee] text-[#542720]'
        }`}
      >
        <div
          className={`h-14 w-14 animate-spin rounded-full border-4 ${
            isDark ? 'border-[#3d1c1c] border-t-brand-500' : 'border-[#f2d0bf] border-t-brand-500'
          }`}
        />
        <p className="mt-4 text-sm font-medium">{t('legacyPage.loading')}</p>
      </div>
    );
  }

  if (error || !legacy) {
    return (
      <div
        className={`flex min-h-screen flex-col items-center justify-center px-6 text-center ${
          isDark ? 'bg-[#1b0f13] text-[#fde0d1]' : 'bg-[#fff5ee] text-[#5d2c23]'
        }`}
      >
        <h1 className="text-3xl font-semibold">{t('legacyPage.notFound')}</h1>
        <p className="mt-3">{error || t('legacyPage.notFoundDesc')}</p>
        <Link
          to="/"
          className="mt-6 rounded-2xl bg-brand-500 px-6 py-3 text-sm font-semibold text-[#2d0f09] shadow-[0_12px_24px_rgba(255,122,41,0.3)] transition hover:bg-brand-400"
        >
          {t('legacyPage.createNew')}
        </Link>
      </div>
    );
  }

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/legacy/${legacy.slug}`
      : `/legacy/${legacy.slug}`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#15090c]' : 'bg-[#fff3e8]'}`}>
      <header className={`relative w-full ${isDark ? 'bg-[#1c0b0f]/90 backdrop-blur' : 'bg-[#fff6ef]'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/15 to-transparent" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-brand-400">{t('heroTag')}</p>
            <h1
              className={`mt-2 text-3xl font-bold sm:text-4xl ${
                isDark ? 'text-[#ffe9da]' : 'text-[#5b2a22]'
              }`}
            >
              {legacy.title}
            </h1>
            <p className={`mt-1 text-sm ${isDark ? 'text-[#dcb1a4]' : 'text-[#8a4c3f]'}`}>
              {t('previewCard.slug')}: {legacy.slug}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              to="/"
              className={`inline-flex items-center justify-center rounded-2xl px-5 py-2 text-sm font-semibold transition ${
                isDark
                  ? 'border border-[#f2c6a8]/40 text-[#fde7d8] hover:border-[#ffb07c] hover:text-white'
                  : 'border border-[#f4cbbb] text-[#6b2c24] hover:border-[#ffa770] hover:bg-[#fff3ea]'
              }`}
            >
              {t('legacyPage.back')}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row">
        <article
          className={`w-full space-y-6 rounded-3xl p-6 lg:w-3/5 ${
            isDark
              ? 'border border-[#4b2424]/70 bg-[#1d0b0f]/85 backdrop-blur'
              : 'bg-[#fff1e7] shadow-card border border-[#f2d0be]/60'
          }`}
        >
          <div className="relative rounded-3xl bg-gradient-to-br from-[#ffb07a]/20 via-transparent to-transparent p-[1px]">
            <div
              className={`rounded-[calc(1.5rem-1px)] p-6 ${
                isDark ? 'bg-[#140609] text-[#fee5d6]' : 'bg-white text-[#5b2b24]'
              }`}
            >
              <p className="whitespace-pre-line text-base leading-relaxed">{legacy.content}</p>
            </div>
          </div>
          <div
            className={`rounded-2xl p-4 text-sm ${
              isDark ? 'bg-[#2a1517] text-[#fddfce]' : 'bg-[#ffe7d6] text-[#6a352d]'
            }`}
          >
            {t('legacyPage.localInfo')}
          </div>
        </article>

        <aside className="w-full space-y-6 lg:w-2/5">
          <div
            className={`overflow-hidden rounded-3xl ${
              isDark ? 'border border-[#4b2424]/60 bg-[#1f0b10]/80 backdrop-blur' : 'bg-[#fff3ea] shadow-card border border-[#f4cdbb]/70'
            }`}
          >
            <img
              src={legacy.image_url || PLACEHOLDER_IMAGE}
              alt={legacy.title}
              className="h-72 w-full object-cover"
            />
            <div className="space-y-3 p-6">
              <h2 className={`text-2xl font-semibold ${isDark ? 'text-[#ffe4d4]' : 'text-[#5b2a22]'}`}>
                {t('legacyPage.photoHighlight')}
              </h2>
              <p className={`text-sm ${isDark ? 'text-[#d9b0a4]' : 'text-[#874a3e]'}`}>
                {t('legacyPage.photoText')}
              </p>
            </div>
          </div>

          <div
            className={`rounded-3xl border border-dashed p-6 text-sm ${
              isDark
                ? 'border-[#f3c6ad]/20 bg-[#1d0b0f]/80 text-[#fde4d5]'
                : 'border-[#f4cdbb] bg-[#fff7f0] text-[#6f2f27]'
            }`}
          >
            <p className="font-semibold">{t('legacyPage.share')}</p>
            <p className="mt-2 break-all">{shareUrl}</p>
            <p className={`mt-4 text-xs ${isDark ? 'text-[#c9998c]' : 'text-[#9c5a4b]'}`}>
              {t('legacyPage.shareHint')}
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default LegacyPage;
