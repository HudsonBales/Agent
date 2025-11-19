import type { Config } from "tailwindcss";
import { tokens } from "./src/lib/tokens";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}", "./src/lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: tokens.colors,
      fontFamily: tokens.fonts,
      fontSize: tokens.fontSizes,
      borderRadius: tokens.radii,
      boxShadow: tokens.shadows,
      spacing: tokens.spacing
    }
  },
  plugins: []
};

export default config;
