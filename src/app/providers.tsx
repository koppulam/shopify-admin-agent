"use client";

import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import enTranslations from "@shopify/polaris/locales/en.json";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Extend Window interface for App Bridge
declare global {
  interface Window {
    app?: any;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const shop = searchParams?.get("shop");
  const host = searchParams?.get("host");
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    // Check if we're in an embedded context
    const embedded = window.top !== window.self;
    setIsEmbedded(embedded);

    if (embedded && shop && typeof window !== "undefined") {
      // Initialize App Bridge for embedded apps
      import("@shopify/app-bridge").then(({ default: createApp }) => {
        if (window.app) return; // Already initialized
        
        window.app = createApp({
          apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || "",
          shopOrigin: shop,
          host: host || "",
          forceRedirect: true,
        });
      });
    }
  }, [shop, host]);

  return (
    <AppProvider 
      i18n={enTranslations}
      linkComponent={({ url, children, ...props }) => (
        <a href={url} {...props}>{children}</a>
      )}
    >
      {children}
    </AppProvider>
  );
} 