import { useEffect } from 'react';

const OrderModal = ({
  open,
  onClose,
  onSubmit,
  orderForm,
  onChange,
  orderState,
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
            <h3 className="mt-2 text-2xl font-semibold">
              Order a Memorylife plaque
            </h3>
            <p className={`mt-1 text-sm ${mutedText}`}>
              We will email{' '}
              <span className="font-semibold text-brand-400">my.agent.use1@gmail.com</span>{' '}
              with your request and follow up directly.
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

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
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

          {orderState.error && (
            <p
              className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                isDark ? 'bg-red-500/10 text-red-300' : 'bg-red-50 text-red-600'
              }`}
            >
              {orderState.error}
            </p>
          )}
          {orderState.success && (
            <p
              className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                isDark ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {orderState.success}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={orderState.loading}
              className="w-full rounded-2xl bg-brand-600 px-6 py-3 text-center text-lg font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-brand-300"
            >
              {orderState.loading ? 'Sending order...' : 'Send order email'}
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
