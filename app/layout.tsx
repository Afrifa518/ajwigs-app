import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import Providers from "@/app/providers";
import StorefrontFrame from "@/app/storefront/StorefrontFrame";
import logo from "@/frontend/src/assets/logo.png";

export const metadata: Metadata = {
  icons: {
    icon: logo.src,
    apple: logo.src,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

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
