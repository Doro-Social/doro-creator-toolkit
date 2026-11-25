import {defineConfig} from 'vitest/config';
export default defineConfig({test:{include:['tests/**/*.test.ts','tools/*/tests/**/*.test.ts']}});
