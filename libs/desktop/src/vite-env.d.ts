/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set to 'true' only by the desktop E2E build (nx run player-e2e:build-desktop-e2e). */
  readonly VITE_QSPIDER_E2E?: string;
}
