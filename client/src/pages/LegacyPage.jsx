import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

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
        const message = err?.response?.data?.message || 'Unable to load this Memorylife page.';
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
          isDark ? 'bg-[#030712] text-slate-300' : 'bg-slate-50 text-slate-600'
        }`}
      >
        <div
          className={`h-14 w-14 animate-spin rounded-full border-4 ${
            isDark ? 'border-slate-800 border-t-brand-500' : 'border-slate-200 border-t-brand-500'
          }`}
        />
        <p className="mt-4 text-sm font-medium">Loading Memorylife page...</p>
      </div>
    );
  }

  if (error || !legacy) {
    return (
      <div
        className={`flex min-h-screen flex-col items-center justify-center px-6 text-center ${
          isDark ? 'bg-[#030712] text-slate-200' : 'bg-slate-50 text-slate-700'
        }`}
      >
        <h1 className="text-3xl font-semibold">Memorylife page not found</h1>
        <p className="mt-3">{error || 'This tribute is unavailable.'}</p>
        <Link
          to="/"
          className="mt-6 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
        >
          Create a new Memorylife page
        </Link>
      </div>
    );
  }

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/legacy/${legacy.slug}`
      : `/legacy/${legacy.slug}`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#030712]' : 'bg-slate-50'}`}>
      <header className={`relative w-full ${isDark ? 'bg-slate-900/80 backdrop-blur' : 'bg-white'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/15 to-transparent" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-brand-400">Memorylife</p>
            <h1
              className={`mt-2 text-3xl font-bold sm:text-4xl ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {legacy.title}
            </h1>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Slug: {legacy.slug}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/"
              className={`inline-flex items-center justify-center rounded-2xl px-5 py-2 text-sm font-semibold transition ${
                isDark
                  ? 'border border-white/20 text-slate-100 hover:border-brand-300 hover:text-white'
                  : 'border border-slate-200 text-slate-700 hover:border-brand-200 hover:bg-brand-50'
              }`}
            >
              Back to Memorylife
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row">
        <article
          className={`w-full space-y-6 rounded-3xl p-6 lg:w-3/5 ${
            isDark
              ? 'border border-white/5 bg-slate-900/80 backdrop-blur'
              : 'bg-white shadow-card'
          }`}
        >
          <div className="relative rounded-3xl bg-gradient-to-br from-brand-500/10 to-brand-700/10 p-[1px]">
            <div
              className={`rounded-[calc(1.5rem-1px)] p-6 ${
                isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-700'
              }`}
            >
              <p className="whitespace-pre-line text-base leading-relaxed">{legacy.content}</p>
            </div>
          </div>
          <div
            className={`rounded-2xl p-4 text-sm ${
              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-500'
            }`}
          >
            Memorylife keeps this page locally so you can print the QR plaque or share the safe link
            below.
          </div>
        </article>

        <aside className="w-full space-y-6 lg:w-2/5">
          <div
            className={`overflow-hidden rounded-3xl ${
              isDark ? 'border border-white/5 bg-slate-900/60 backdrop-blur' : 'bg-white shadow-card'
            }`}
          >
            <img
              src={legacy.image_url || PLACEHOLDER_IMAGE}
              alt={legacy.title}
              className="h-72 w-full object-cover"
            />
            <div className="space-y-3 p-6">
              <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Photo highlight
              </h2>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Images help the story feel tangible. Replace this link anytime by editing the legacy
                entry locally.
              </p>
            </div>
          </div>

          <div
            className={`rounded-3xl border border-dashed p-6 text-sm ${
              isDark
                ? 'border-white/10 bg-slate-900/50 text-slate-200'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            <p className="font-semibold">Share link</p>
            <p className="mt-2 break-all">{shareUrl}</p>
            <p className={`mt-4 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Recreate the legacy entry to update details and regenerate a QR plaque in the builder.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default LegacyPage;
