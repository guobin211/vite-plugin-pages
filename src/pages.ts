import fg from 'fast-glob';
import path from 'node:path';

export const getAbsPath = (p = '') => {
  return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
};

export const getAllPages = async (pagesDir: string) => {
  const dir = getAbsPath(pagesDir);
  const allFiles = await fg.async(`${pagesDir}/**/index.html`);
  const pages: Record<string, string> = {};
  allFiles.forEach((file) => {
    const pageName = file.replace(`${dir}/`, '').replace('/index.html', '');
    pages[pageName] = file;
  });
  return pages;
};

export const getAllMainTSFiles = async (pagesDir: string) => {
  const dir = getAbsPath(pagesDir);
  const allFiles = await fg.async(`${dir}/**/main.tsx`);
  const mainTSFiles: Record<string, string> = {};
  allFiles.forEach((file) => {
    const pageName = file.replace(`${dir}/`, '').replace('/main.tsx', '');
    mainTSFiles[pageName] = file;
  });
  return mainTSFiles;
};
