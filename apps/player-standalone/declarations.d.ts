declare module '*?raw' {
  const content: string;
  export default content;
}

declare module '@qspider/window-manager' {
  export const windowManager: import('@qspider/contracts').IWindowManager;
}
