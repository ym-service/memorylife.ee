import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const LANG_OPTIONS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ee', label: 'EE', name: 'Eesti' },
  { code: 'ua', label: 'UA', name: 'Українська' },
  { code: 'ru', label: 'RU', name: 'Русский' },
];

const LanguageSwitcher = () => {
  const { lang, setLang } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [open, setOpen] = useState(false);
  const active = LANG_OPTIONS.find((opt) => opt.code === lang) || LANG_OPTIONS[0];

  const baseBtn =
    'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition';
  const btnColors = isDark
    ? 'border-white/10 bg-slate-900/80 text-slate-200 hover:border-brand-400'
    : 'border-slate-200 bg-white/80 text-slate-700 hover:border-brand-400';

  const menuClasses = `absolute right-0 mt-2 w-32 rounded-2xl border p-2 text-sm shadow-lg ${
    isDark ? 'border-white/10 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800'
  }`;

  const selectLanguage = (code) => {
    setLang(code);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className={`${baseBtn} ${btnColors}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        {active.label}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className={menuClasses}>
          {LANG_OPTIONS.map((option) => (
            <button
              key={option.code}
              type="button"
              onClick={() => selectLanguage(option.code)}
              className={`w-full rounded-xl px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.2em] ${
                lang === option.code
                  ? isDark
                    ? 'bg-brand-500/20 text-white'
                    : 'bg-brand-100 text-brand-700'
                  : 'hover:bg-brand-500/10'
              }`}
            >
              {option.label} <span className="text-[10px] normal-case tracking-normal">{option.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
