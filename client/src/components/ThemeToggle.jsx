import { useTheme } from '../context/ThemeContext.jsx';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const baseClasses = `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] shadow-lg transition`;
  const colorClasses = isDark
    ? 'border-[#f2c6a8]/40 bg-[#2b1416]/80 text-[#fee9db] hover:border-[#ffb77c] hover:text-white'
    : 'border-[#d9a890] bg-[#fff5ef] text-[#7a342b] hover:border-[#f4a261] hover:text-[#4a1e18]';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`${baseClasses} ${colorClasses}`}
    >
      {isDark ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-[#ffd89a]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0-1.414 1.414M7.05 16.95l-1.414 1.414M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
            />
          </svg>
          Light
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-[#5a1f16]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M21.752 15.002A9.718 9.718 0 0 1 12 21.75a9.75 9.75 0 0 1 0-19.5 9.718 9.718 0 0 1 9.752 6.748 7.501 7.501 0 0 0 0 5.004Z" />
          </svg>
          Dark
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
