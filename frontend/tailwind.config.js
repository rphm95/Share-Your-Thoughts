//import daisyUIThemes from "daisyui/src/theming/themes";
import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],

}