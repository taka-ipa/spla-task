import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpackDevMiddleware: (config: any) => {  // ← :any を付ける
    config.watchOptions = {
      // ポーリングは設定しない（= デフォでinotify/fseventsに任せる）
      // poll: 1000,
      aggregateTimeout: 300,
      // ここを厚めに無視
      ignored: [
        "**/.git/**",
        "**/.next/**",
        "**/node_modules/**",
        "**/.turbo/**",
        "**/.swc/**",
        "**/.eslintcache",
        "**/cache/**",       // ← これ追加！（プロジェクト直下の cache/ を無視）
        "**/*.log",
      ],
    };
    return config;
  },
  // （任意）開発中は ESLint/TS のウォッチを切って負荷を下げる
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;