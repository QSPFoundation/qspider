/// <reference types="vite/client" />

declare const QSPIDER_VERSION: string;
interface ImportMetaEnv {
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
