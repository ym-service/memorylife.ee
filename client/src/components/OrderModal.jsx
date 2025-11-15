import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';

const OrderModal = ({
  open,
  onClose,
  orderForm,
  onChange,
  orderDetails = {},
  orderEmail = 'my.agent.use1@gmail.com',
  formAction = 'https://api.staticforms.xyz/submit',
  apiKey = '',
  redirectUrl = 'https://ym-service.github.io/memorylife.ee',
  isDark,
}) => {
  const { t } = useLanguage();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setOffset({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [open]);

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

  const inputClasses = `w-full rounded-2xl border px-4 py-3 text-base outline-none transition focus:ring-2 ${
    isDark
      ? 'border-[#5a2b28] bg-[#2b1416] text-[#fee7d8] placeholder:text-[#b68478] focus:border-[#ffb07c] focus:ring-[#f9b386]/30'
      : 'border-[#f0d5c7] bg-white text-[#5b2a23] placeholder:text-[#be8678] focus:border-[#f8945d] focus:ring-[#ffd5b3]/50'
  }`;

  const mutedText = isDark ? 'text-[#d8a999]' : 'text-[#804136]';

  const {
    slug = '',
    legacyUrl = '',
    plateOptions = {},
    previewImage = '',
  } = orderDetails;

  const asNumber = (value, fallback) =>
    typeof value === 'number' && Number.isFinite(value) ? value : fallback;

  const normalizedPlate = {
    material: plateOptions.material || 'steel',
    border: Boolean(plateOptions.border),
    widthCm: asNumber(plateOptions.widthCm, 10),
    heightCm: asNumber(plateOptions.heightCm, 10),
    thicknessMm: asNumber(plateOptions.thicknessMm, 2),
    shape: plateOptions.shape || 'rectangle',
  };

  const shapeLabel =
    t(`modal.shapes.${normalizedPlate.shape}`) || normalizedPlate.shape;
  const plateSummary = [
    `Material: ${normalizedPlate.material}`,
    `Dimensions: ${normalizedPlate.widthCm}cm x ${normalizedPlate.heightCm}cm`,
    `Thickness: ${normalizedPlate.thicknessMm}mm`,
    `Shape: ${shapeLabel}`,
    `Engraved border: ${normalizedPlate.border ? 'Yes' : 'No'}`,
  ].join('\n');

  const plateOptionsJson = JSON.stringify(normalizedPlate);
  const subject = slug ? `Memorylife plaque order: ${slug}` : 'Memorylife plaque order';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl ${
          isDark ? 'border border-[#4c2426]/70 bg-[#1b0b0e]' : 'bg-[#fff4ed] border border-[#f3cdb9]'
        }`}
        style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
        onPointerDown={startDrag}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
              {t('modal.badge')}
            </p>
            <h3 className="mt-2 text-2xl font-semibold">{t('modal.title')}</h3>
            <p className={`mt-1 text-sm ${mutedText}`}>
              {t('modal.intro').replace('{email}', orderEmail)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full border p-2 transition ${
              isDark
                ? 'border-[#f6c6a8]/30 text-[#fddfce] hover:border-[#ffad73] hover:text-white'
                : 'border-[#f4cdb9] text-[#6c2b23] hover:text-[#a34a32]'
            }`}
            aria-label="Close order form"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
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

        <form
          action={formAction}
          method="POST"
          encType="multipart/form-data"
          className="mt-6 space-y-4"
        >
          <input type="hidden" name="accessKey" value={apiKey} />
          <input type="hidden" name="replyTo" value={orderForm.email} />
          <input type="hidden" name="subject" value={subject} />
          <input type="hidden" name="redirectTo" value={redirectUrl} />
          <input type="hidden" name="Legacy slug" value={slug} />
          <input type="hidden" name="Legacy URL" value={legacyUrl} />
          <input type="hidden" name="Plate details" value={plateSummary} />
          <input type="hidden" name="Plate options (JSON)" value={plateOptionsJson} />
          {previewImage && (
            <input type="hidden" name="Preview image (data URL)" value={previewImage} />
          )}
          <input
            type="text"
            name="honeypot"
            className="hidden"
            tabIndex="-1"
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="space-y-2">
            <label htmlFor="modal-name" className="text-sm font-medium">
              {t('modal.name')}
            </label>
            <input
              id="modal-name"
              name="name"
              value={orderForm.name}
              onChange={onChange}
              placeholder="Your name"
              className={inputClasses}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="modal-email" className="text-sm font-medium">
              {t('modal.email')}
            </label>
            <input
              type="email"
              id="modal-email"
              name="email"
              value={orderForm.email}
              onChange={onChange}
              placeholder="name@example.com"
              className={inputClasses}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="modal-phone" className="text-sm font-medium">
              {t('modal.phone')}
            </label>
            <input
              id="modal-phone"
              name="phone"
              value={orderForm.phone}
              onChange={onChange}
              placeholder="+7 999 123-45-67"
              className={inputClasses}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="modal-message" className="text-sm font-medium">
              {t('modal.message')}
            </label>
            <textarea
              id="modal-message"
              name="message"
              value={orderForm.message}
              onChange={onChange}
              placeholder={t('modal.messagePlaceholder')}
              rows="4"
              className={`${inputClasses} min-h-[140px]`}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="modal-attachment" className="text-sm font-medium">
              {t('modal.attachmentLabel')}
            </label>
            <input
              type="file"
              id="modal-attachment"
              name="attachment"
              accept=".png,.jpg,.jpeg,.pdf"
              className={inputClasses}
            />
            <p className={`text-xs ${mutedText}`}>{t('modal.attachmentHint')}</p>
          </div>

          <p className={`text-xs ${mutedText}`}>
            {t('modal.redirectHint').replace('{url}', redirectUrl)}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="w-full rounded-2xl bg-brand-500 px-6 py-3 text-center text-lg font-semibold text-[#2d0f08] shadow-[0_12px_24px_rgba(255,122,41,0.35)] transition hover:bg-brand-400"
            >
              {t('modal.submit')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`rounded-2xl px-6 py-3 text-sm font-semibold ${
                isDark ? 'text-[#fbdccd] hover:text-white' : 'text-[#7a4034] hover:text-[#a14a39]'
              }`}
            >
              {t('modal.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
