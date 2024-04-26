import { getAbsPath, getAllPages } from './pages';
import history from 'connect-history-api-fallback';
import fs from 'node:fs';
import path from 'node:path';
import shell from 'shelljs';
import { Plugin, type UserConfig } from 'vite';

export interface RsxPluginOptions {
  /**
   * pages目录，默认为src/pages
   */
  pagesDir?: string;
}

const mergeOptions = (userOptions: RsxPluginOptions) => {
  return {
    pagesDir: userOptions.pagesDir || 'src/pages'
  };
};

const getHistoryRewrites = (options: Required<RsxPluginOptions>, input: Record<string, string>) => {
  const rewrites = [
    {
      from: /^\/$/,
      to: `./${options.pagesDir}/index/index.html`
    }
  ];
  Object.keys(input).forEach((key) => {
    const name = key.replace(`${options.pagesDir}/`, '');
    const file = input[key];
    const relativePath = `/${file}`;
    rewrites.push({
      from: new RegExp(`^/${name}$`),
      to: relativePath
    });
    rewrites.push({
      from: new RegExp(`^/${name}/$`),
      to: relativePath
    });
    rewrites.push({
      from: new RegExp(`^/${name}.html$`),
      to: relativePath
    });
    rewrites.push({
      from: new RegExp(`^/${name}.html/$`),
      to: relativePath
    });
    rewrites.push({
      from: new RegExp(`^/${name}/index$`),
      to: relativePath
    });
    rewrites.push({
      from: new RegExp(`^/${name}/index/$`),
      to: relativePath
    });
    rewrites.push({
      from: new RegExp(`^/${name}/index.html$`),
      to: relativePath
    });
    rewrites.push({
      from: new RegExp(`^/${name}/index.html/$`),
      to: relativePath
    });
  });
  return rewrites;
};

export function vitePluginPages(
  userOptions: RsxPluginOptions = {
    pagesDir: 'src/pages'
  }
): Plugin {
  const options = mergeOptions(userOptions);
  let config: UserConfig;
  let input: Record<string, string>;
  let root: string;
  let dist: string;
  return {
    name: 'vite-plugin-rsx',
    enforce: 'pre',
    config: async (c) => {
      config = c;
      config.build = c.build || {};
      config.build.rollupOptions = c.build?.rollupOptions || {};
      input = await getAllPages(options.pagesDir);
      config.build.rollupOptions.input = input;
      root = getAbsPath(config.root);
      dist = getAbsPath(config.build.outDir || 'dist');
      return config;
    },
    configureServer: ({ middlewares: app }) => {
      app.use(
        // @ts-ignore
        history({
          verbose: false,
          disableDotRule: undefined,
          htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
          rewrites: getHistoryRewrites(options, input)
        })
      );
    },
    transformIndexHtml: (html, ctx) => {
      // html相对路径转绝对路径
      const mainTsxPath = ctx.path.replace('index.html', 'main.tsx');
      return html.replace(
        '<script type="module" src="./main.tsx"></script>',
        `<script type="module" src="${mainTsxPath}"></script>`
      );
    },
    closeBundle: () => {
      const resolve = (p: string) => path.resolve(root, p);
      if (fs.existsSync(resolve(`dist/${options.pagesDir}`))) {
        // 不带目录的页面
        Object.keys(input).forEach((name) => {
          const relativePath = input[name].split(options.pagesDir)[1];
          const sourceFile = path.join(dist, 'src/pages', relativePath);
          const outputFile = resolve(`${dist}/${name}.html`);
          shell.cp('-rf', sourceFile, outputFile);
        });
        // 带目录的页面
        shell.cp('-rf', resolve(`${dist}/${options.pagesDir}/*`), resolve(dist));
      }
      shell.rm('-rf', resolve(`${dist}/src`));
    }
  };
}
