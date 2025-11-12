import { useEffect, useState } from 'react';
import axios from 'axios';
import PlatePreview from '../components/PlatePreview.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import OrderModal from '../components/OrderModal.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const initialFormState = {
  title: '',
  content: '',
  image_url: ''
};

const initialOrderState = {
  name: '',
  email: '',
  phone: '',
  message: ''
};

const CreateLegacy = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [orderForm, setOrderForm] = useState(initialOrderState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [orderState, setOrderState] = useState({
    loading: false,
    success: '',
    error: ''
  });
  const [isOrderModalOpen, setOrderModalOpen] = useState(false);
  const [plateOptions, setPlateOptions] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    document.title = 'Memorylife - Digital legacy';
  }, []);

  const appOrigin =
    typeof window !== 'undefined'
      ? window.location.origin
      : import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173';

  const slugFromTitle = (value) =>
    value
      ? value
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      : '';
  const fallbackSlug = slugFromTitle(formData.title) || 'legacy-xxxx';
  const displaySlug = result?.slug || fallbackSlug;
  const displayUrl = result?.legacyUrl || `${appOrigin}/legacy/${displaySlug}`;
  const displayTitle = result?.title || formData.title || 'Memorylife tribute';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOrderChange = (event) => {
    const { name, value } = event.target;
    setOrderForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setResult(null);
    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        image_url: formData.image_url.trim()
      };

      const { data } = await axios.post(`${API_BASE_URL}/legacy`, payload);
      const slug = data.slug;
      const legacyUrl = `${appOrigin}/legacy/${slug}`;

      setResult({
        slug,
        legacyUrl,
        title: payload.title
      });
      setFormData(initialFormState);
      setOrderState({
        loading: false,
        success: '',
        error: ''
      });
      setOrderModalOpen(true);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to create a Memorylife page.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderSubmit = async (event) => {
    event.preventDefault();
    if (!result) {
      setOrderState({
        loading: false,
        success: '',
        error: 'Create a Memorylife page first to receive a slug.'
      });
      return;
    }

    if (!plateOptions) {
      setOrderState({
        loading: false,
        success: '',
        error: 'Preview is still rendering. Please try again in a moment.'
      });
      return;
    }

    setOrderState({
      loading: true,
      success: '',
      error: ''
    });

    try {
      await axios.post(`${API_BASE_URL}/order`, {
        ...orderForm,
        slug: result.slug,
        legacyUrl: result.legacyUrl,
        plateOptions,
        previewImage
      });
      setOrderState({
        loading: false,
        success: 'Order sent! We will reach out to the email you provided.',
        error: ''
      });
      setOrderForm(initialOrderState);
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Could not send the order. Please try again later.';
      setOrderState({
        loading: false,
        success: '',
        error: message
      });
    }
  };

  const cardBase = isDark
    ? 'rounded-3xl border border-white/5 bg-slate-900/80 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur'
    : 'rounded-3xl bg-white shadow-card';
  const cardClasses = `${cardBase} p-6 sm:p-8`;

  const inputClasses = `w-full rounded-2xl border px-4 py-3 text-base outline-none transition focus:ring-2 ${
    isDark
      ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-brand-400 focus:ring-brand-500/30'
      : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-500 focus:border-brand-500 focus:ring-brand-100'
  }`;

  const textMuted = isDark ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 pb-12 pt-10 md:flex-row md:items-start md:justify-between md:pt-16">
      <section className="w-full space-y-6 md:w-1/2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-400">
              Memorylife
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Memorylife - a page for your story
            </h1>
            <p className={`text-lg ${textMuted}`}>
              Build a private tribute with text, photos, and a shareable QR plaque. Everything works
              locally on your Windows device.
            </p>
          </div>
          <ThemeToggle />
        </div>

        <form onSubmit={handleSubmit} className={cardClasses}>
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-semibold">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Family legacy of the Petrovs"
              className={inputClasses}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-semibold">
              Story
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Share key milestones, memories, facts..."
              rows="6"
              className={`${inputClasses} min-h-[160px]`}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="image_url" className="text-sm font-semibold">
              Photo URL
            </label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/photo.jpg"
              className={inputClasses}
            />
            <p className={`text-xs ${textMuted}`}>
              Optional. If empty, the public page will fall back to a default photo.
            </p>
          </div>

          {error && (
            <p
              className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                isDark ? 'bg-red-500/10 text-red-300' : 'bg-red-50 text-red-600'
              }`}
            >
              {error}
            </p>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-brand-600 px-6 py-3 text-center text-lg font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-brand-300"
            >
              {isSubmitting ? 'Creating page...' : 'Create Memorylife page'}
            </button>
            <button
              type="button"
              onClick={() => result && setOrderModalOpen(true)}
              disabled={!result}
              className={`w-full rounded-2xl border px-6 py-3 text-sm font-semibold transition ${
                result
                  ? 'border-brand-500 text-brand-400 hover:bg-brand-500/10'
                  : 'border-slate-300 text-slate-400'
              }`}
            >
              Order a Memorylife plaque
            </button>
            {!result && (
              <p className={`text-xs text-center ${textMuted}`}>
                Generate a Memorylife page to unlock plaque ordering.
              </p>
            )}
          </div>
        </form>
      </section>

      <section className="w-full space-y-6 md:w-2/5">
        <PlatePreview
          title={displayTitle}
          slug={displaySlug}
          url={displayUrl}
          onOptionsChange={setPlateOptions}
          onSnapshot={setPreviewImage}
        />

        {result && (
          <div
            className={`space-y-3 rounded-3xl p-6 ${
              isDark
                ? 'border border-white/5 bg-slate-900/80 backdrop-blur'
                : 'bg-white shadow-card'
            }`}
          >
            <h3 className="text-xl font-semibold">Your page is live</h3>
            <p className={`text-sm ${textMuted}`}>
              Share the link with loved ones. The QR code opens the Memorylife story instantly.
            </p>
            <div
              className={`rounded-2xl p-4 text-sm ${
                isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-50 text-slate-700'
              }`}
            >
              <p className="font-semibold">Slug: {result.slug}</p>
              <p className={textMuted}>URL: {result.legacyUrl}</p>
            </div>
          </div>
        )}
      </section>
      <OrderModal
        open={isOrderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        onSubmit={handleOrderSubmit}
        orderForm={orderForm}
        onChange={handleOrderChange}
        orderState={orderState}
        isDark={isDark}
      />
    </div>
  );
};

export default CreateLegacy;
