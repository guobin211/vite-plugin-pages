# vite-plugin-pages

给vite添加pages多页面支持

### 安装

```bash
npm i vite-plugin-pages -D
```

### 配置

```ts
import { vitePluginPages } from 'vite-plugin-pages';

export default {
  plugins: [
    vitePluginPages({
      pagesDir: ['src/pages']
    })
  ]
};
```

### 目录结构

```
├── src
│   ├── pages
│   │   ├── index
│   │   │   ├── index.html
│   │   │   ├── main.ts
│   │   ├── posts
│   │   │   ├── index.html
│   │   │   ├── main.ts
│   ├── components
│   │   │   ├── Card.tsx
│   └── ...
```
