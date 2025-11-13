import { useEffect } from 'react';

const SHAPE_LABELS = {
  rectangle: 'Rectangle',
  ellipse: 'Ellipse',
  star5: 'Five-point star',
  star4: 'Star of David',
};

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

  if (!open) {
    return null;
  }

  const inputClasses = `w-full rounded-2xl border px-4 py-3 text-base outline-none transition focus:ring-2 ${
    isDark
      ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-brand-400 focus:ring-brand-400/40'
      : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-500 focus:border-brand-500 focus:ring-brand-100'
  }`;

  const mutedText = isDark ? 'text-slate-400' : 'text-slate-600';

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

  const shapeLabel = SHAPE_LABELS[normalizedPlate.shape] || normalizedPlate.shape;
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
          isDark ? 'border border-white/5 bg-slate-900' : 'bg-white'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
              Memorylife tab
            </p>
            <h3 className="mt-2 text-2xl font-semibold">Order a Memorylife plaque</h3>
            <p className={`mt-1 text-sm ${mutedText}`}>
              This form sends your request directly to{' '}
              <span className="font-semibold text-brand-400">{orderEmail}</span> through StaticForms.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:text-white"
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
              Name
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
              Email
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
              Phone (optional)
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
              Message
            </label>
            <textarea
              id="modal-message"
              name="message"
              value={orderForm.message}
              onChange={onChange}
              placeholder="Tell us how many plaques you need, preferred material, etc."
              rows="4"
              className={`${inputClasses} min-h-[140px]`}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="modal-attachment" className="text-sm font-medium">
              Attach artwork or reference (optional)
            </label>
            <input
              type="file"
              id="modal-attachment"
              name="attachment"
              accept=".png,.jpg,.jpeg,.pdf"
              className={inputClasses}
            />
            <p className={`text-xs ${mutedText}`}>
              Upload logos, sketches, or measurements to help us manufacture the plaque.
            </p>
          </div>

          <p className={`text-xs ${mutedText}`}>
            After submission StaticForms will redirect you to {redirectUrl}. Double-check your inbox
            (and spam folder) for the StaticForms confirmation email the first time you submit.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="w-full rounded-2xl bg-brand-600 px-6 py-3 text-center text-lg font-semibold text-white transition hover:bg-brand-500"
            >
              Send order email
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`rounded-2xl px-6 py-3 text-sm font-semibold ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
