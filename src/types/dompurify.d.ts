// This file helps TypeScript understand the DOMPurify types in both browser and Node.js environments
declare module 'dompurify' {
  const DOMPurify: {
    (window?: Window): {
      setConfig(config: {
        ALLOWED_TAGS?: string[];
        ALLOWED_ATTR?: string[];
        FORBID_TAGS?: string[];
        FORBID_ATTR?: string[];
      }): void;
      sanitize(html: string): string;
      // Add other methods as needed
    };
    default: typeof DOMPurify;
  };

  export = DOMPurify;
}
