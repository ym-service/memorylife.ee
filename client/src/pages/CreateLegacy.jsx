import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import PlatePreview from '../components/PlatePreview.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import OrderModal from '../components/OrderModal.jsx';
import AboutModal from '../components/AboutModal.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';

const API_URL = 'https://memorylife-ee.onrender.com';
const API_BASE_URL = import.meta.env.VITE_API_URL || `${API_URL}/api`;
const ORDER_EMAIL = import.meta.env.VITE_ORDER_EMAIL || 'my.agent.use1@gmail.com';
const ORDER_REDIRECT_URL =
  import.meta.env.VITE_ORDER_REDIRECT_URL || 'https://ym-service.github.io/memorylife.ee';
const ORDER_FORM_ENDPOINT =
  import.meta.env.VITE_STATICFORMS_ENDPOINT || 'https://api.staticforms.xyz/submit';
const ORDER_API_KEY =
  import.meta.env.VITE_STATICFORMS_API_KEY || 'sf_nibfjh3dc3gn0afn3bkj0lgd';
const DEFAULT_PLATE_OPTIONS = {
  material: 'steel',
  border: false,
  widthCm: 10,
  heightCm: 10,
  thicknessMm: 2,
  shape: 'rectangle',
  cornerRadiusMm: 2,
};

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
  const [isOrderModalOpen, setOrderModalOpen] = useState(false);
  const [isAboutOpen, setAboutOpen] = useState(false);
  const [plateOptions, setPlateOptions] = useState(DEFAULT_PLATE_OPTIONS);
  const [previewImage, setPreviewImage] = useState('');
  const [photoName, setPhotoName] = useState('');
  const fileInputRef = useRef(null);

  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('heroTitle');
  }, [t]);

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
  const displayTitle = result?.title || formData.title || t('heroTitle');

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
      setOrderForm(initialOrderState);
      setOrderModalOpen(true);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to create a Memorylife page.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };


  const cardBase = isDark
    ? 'rounded-3xl border border-[#4b2424]/60 bg-[#1d0b0f]/90 shadow-[0_30px_80px_rgba(17,5,6,0.65)] backdrop-blur'
    : 'rounded-3xl bg-[#fff7f0] shadow-card border border-[#f3d2bf]/60';
  const cardClasses = `${cardBase} p-6 sm:p-8`;

  const inputClasses = `w-full rounded-2xl border px-4 py-3 text-base outline-none transition focus:ring-2 ${
    isDark
      ? 'border-[#5b2b28] bg-[#2b1517] text-[#fee9da] placeholder:text-[#b9857b] focus:border-[#ffb07c] focus:ring-[#f9b386]/30'
      : 'border-[#f0d4c5] bg-white text-[#5c261f] placeholder:text-[#c08c7d] focus:border-[#f79963] focus:ring-[#ffd5b3]/50'
  }`;

  const textMuted = isDark ? 'text-[#d9b1a2]' : 'text-[#7b463c]';

  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setPhotoName('');
      setFormData((prev) => ({ ...prev, image_url: '' }));
      return;
    }
    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        image_url: typeof reader.result === 'string' ? reader.result : '',
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 pb-12 pt-10 md:flex-row md:items-start md:justify-between md:pt-16">
      <section className="w-full space-y-6 md:w-1/2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-400">
              {t('heroTag')}
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">{t('heroTitle')}</h1>
            <p className={`text-lg ${textMuted}`}>{t('heroLead')}</p>
          </div>
          <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setAboutOpen(true)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                isDark
                  ? 'border-[#f4c3aa]/30 bg-[#2a0f12] text-[#ffd8c6] hover:border-[#ffb387]'
                  : 'border-[#f3cdbb] bg-[#ffe9da] text-[#6c2f25] hover:text-[#a3513b]'
              }`}
            >
              {t('buttons.about')}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={cardClasses}>
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-semibold">
              {t('form.titleLabel')}
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('form.titlePlaceholder')}
              className={inputClasses}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-semibold">
              {t('form.storyLabel')}
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder={t('form.storyPlaceholder')}
              rows="6"
              className={`${inputClasses} min-h-[160px]`}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">{t('form.photoLabel')}</label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isDark
                    ? 'bg-[#341215] text-[#ffdbcc] border border-[#5a2a27] hover:border-[#ffb485]'
                    : 'bg-[#ffe2cf] text-[#5c241f] border border-[#f4c8b2] hover:bg-[#ffd1b4]'
                }`}
              >
                {photoName ? `${t('form.photoSelected')}: ${photoName}` : t('form.photoButton')}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>
            <p className={`text-xs ${textMuted}`}>{t('form.photoHint')}</p>
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
              className="w-full rounded-2xl bg-brand-500 px-6 py-3 text-center text-lg font-semibold text-[#2b0e08] shadow-[0_15px_30px_rgba(255,122,41,0.35)] transition hover:bg-brand-400 focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-brand-200"
            >
              {isSubmitting ? `${t('buttons.create')}...` : t('buttons.create')}
            </button>
            <button
              type="button"
              onClick={() => result && setOrderModalOpen(true)}
              disabled={!result}
              className={`w-full rounded-2xl border px-6 py-3 text-sm font-semibold transition ${
                result
                  ? 'border-[#ffb482] text-[#ffb482] hover:bg-[#ffb482]/10'
                  : 'border-[#4a2a28] text-[#815854]'
              }`}
            >
              {t('buttons.order')}
            </button>
            {!result && (
              <p className={`text-xs text-center ${textMuted}`}>{t('buttons.orderLocked')}</p>
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
                ? 'border border-[#4f2929]/70 bg-[#1c0b0e]/85 backdrop-blur'
                : 'bg-[#fff1e7] shadow-card border border-[#f3d1bd]/70'
            }`}
          >
            <h3 className="text-xl font-semibold">{t('previewCard.title')}</h3>
            <p className={`text-sm ${textMuted}`}>{t('previewCard.body')}</p>
            <div
              className={`rounded-2xl p-4 text-sm ${
                isDark ? 'bg-[#2b1416] text-[#fde4d4]' : 'bg-[#ffe7d6] text-[#5c2a24]'
              }`}
            >
              <p className="font-semibold">
                {t('previewCard.slug')}: {result.slug}
              </p>
              <p className={textMuted}>
                {t('previewCard.url')}: {result.legacyUrl}
              </p>
            </div>
          </div>
        )}
      </section>
      <OrderModal
        open={isOrderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        orderForm={orderForm}
        onChange={handleOrderChange}
        orderDetails={{
          slug: result?.slug || '',
          legacyUrl: result?.legacyUrl || '',
          plateOptions: plateOptions || DEFAULT_PLATE_OPTIONS,
          previewImage,
          title: displayTitle
        }}
        orderEmail={ORDER_EMAIL}
        formAction={ORDER_FORM_ENDPOINT}
        apiKey={ORDER_API_KEY}
        redirectUrl={ORDER_REDIRECT_URL}
        apiBaseUrl={API_BASE_URL}
        onSubmitted={() => setOrderForm(initialOrderState)}
        isDark={isDark}
      />
      <AboutModal open={isAboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
};

export default CreateLegacy;
