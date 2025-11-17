const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  mode: "jit",
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...fontFamily.sans],
      },
      borderRadius: {
        DEFAULT: "8px",
        secondary: "4px",
        container: "12px",
      },
      boxShadow: {
        DEFAULT: "0 1px 4px rgba(0, 0, 0, 0.1)",
        hover: "0 2px 8px rgba(0, 0, 0, 0.12)",
      },
      colors: {
        brand: {
          DEFAULT: "var(--color-brand)",
          hover: "var(--color-brand-hover)",
          dark: "var(--color-brand-dark)",
          contrast: "var(--color-brand-contrast)",
        },
        primary: {
          DEFAULT: "var(--color-brand)",
          hover: "var(--color-brand-hover)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          hover: "var(--color-secondary-hover)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent)",
        },
        success: {
          DEFAULT: "var(--color-success)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
        },
        error: {
          DEFAULT: "var(--color-error)",
        },
        border: "var(--color-border)",
        background: "var(--color-bg)",
        foreground: "var(--color-fg)",
        muted: "var(--color-muted)",
        surface: "var(--color-surface)",
      },
      spacing: {
        "form-field": "16px",
        section: "32px",
      },
    },
  },
  variants: {
    extend: {
      boxShadow: ["hover", "active"],
    },
  },
};
