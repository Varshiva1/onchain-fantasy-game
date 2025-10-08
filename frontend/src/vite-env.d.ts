/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_FACTORY_ADDRESS: string;
    readonly VITE_BACKEND_URL: string;
    // add other env vars here
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  