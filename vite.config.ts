import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset URLs so the build works from a subpath (GitHub Pages serves
  // it at /FNCEAPP__v1/) as well as from a domain root.
  base: './',
  plugins: [react()],
})
