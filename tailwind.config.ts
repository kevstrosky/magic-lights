import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ui: {
          fg: "var(--ui-fg)",
          panel: "var(--ui-panel)",
          surface: "var(--ui-surface)",
          code: "var(--ui-code)",
          config: "var(--ui-config)",
          codepanel: "var(--ui-codepanel)",
          fill: "var(--ui-fill)",
          active: "var(--ui-active)",
          hover: "var(--ui-hover)",
          line: "var(--ui-line)",
          subtle: "var(--ui-subtle)",
          muted: "var(--ui-muted)",
          soft: "var(--ui-soft)",
          link: "var(--ui-link)",
        },
      },
      animation: {
        text: "text 5s ease infinite",
      },
      keyframes: {
        text: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
