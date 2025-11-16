(function () {
      const themeStorageKey = "henry-ford-theme";
      const langStorageKey = "henry-ford-lang";
      const root = document.documentElement;
      const themeToggle = document.getElementById("themeToggle");
      const langToggle = document.getElementById("langToggle");

      function applyTheme(theme) {
        if (theme === "dark") {
          root.setAttribute("data-theme", "dark");
        } else {
          root.setAttribute("data-theme", "light");
        }
      }

      function getPreferredTheme() {
        const stored = localStorage.getItem(themeStorageKey);
        if (stored === "light" || stored === "dark") {
          return stored;
        }
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        return prefersDark ? "dark" : "light";
      }

      function applyLanguage(lang) {
        const normalized = lang === "ru" ? "ru" : "en";
        root.setAttribute("data-lang", normalized);
        root.lang = normalized;
      }

      function getPreferredLanguage() {
        const stored = localStorage.getItem(langStorageKey);
        if (stored === "en" || stored === "ru") return stored;
        return "en"; // English by default
      }

      const initialTheme = getPreferredTheme();
      applyTheme(initialTheme);

      const initialLang = getPreferredLanguage();
      applyLanguage(initialLang);

      if (themeToggle) {
        themeToggle.addEventListener("click", function () {
          const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
          const next = current === "dark" ? "light" : "dark";
          applyTheme(next);
          try {
            localStorage.setItem(themeStorageKey, next);
          } catch (e) {
            // ignore private mode errors
          }
        });
      }

      if (langToggle) {
        langToggle.addEventListener("click", function () {
          const current = root.getAttribute("data-lang") === "ru" ? "ru" : "en";
          const next = current === "ru" ? "en" : "ru";
          applyLanguage(next);
          try {
            localStorage.setItem(langStorageKey, next);
          } catch (e) {
            // ignore
          }
        });
      }

      if (window.matchMedia) {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        mq.addEventListener("change", function (event) {
          const stored = localStorage.getItem(themeStorageKey);
          if (!stored) {
            applyTheme(event.matches ? "dark" : "light");
          }
        });
      }
    })();