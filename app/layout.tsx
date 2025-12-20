import "./globals.css";
import type { ReactNode } from "react";
import Providers from "@/app/providers";
import StorefrontFrame from "@/app/storefront/StorefrontFrame";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <StorefrontFrame>{children}</StorefrontFrame>
        </Providers>
      </body>
    </html>
  );
}
