import { defineConfig } from '$fresh/server.ts';
import { freshWebComponents } from '../plugin.ts'; // Add

export default defineConfig({
  plugins: [
    freshWebComponents(), // Add
  ],
});
