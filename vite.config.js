import fs from 'node:fs';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const pkg = JSON.parse(fs.readFileSync('./package.json').toString());
const { version, dependencies } = pkg;
const dependenciesKeys = Object.keys(dependencies || {});

export default defineConfig(({ mode }) => {
  console.log(`vite run mode: ${mode}`);
  return {
    define: {
      __MODE_: JSON.stringify(mode),
      __VERSION_: JSON.stringify(version)
    },
    plugins: [dts()],
    build: {
      sourcemap: false,
      lib: {
        target: 'es2018',
        entry: 'src/index.ts',
        formats: ['es'],
        fileName: 'index'
      },
      rollupOptions: {
        external: (name) => {
          if (name.startsWith('node:')) {
            return true;
          }
          return dependenciesKeys.includes(name);
        }
      }
    }
  };
});
