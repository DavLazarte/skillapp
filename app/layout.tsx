import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";
import { PwaInstallPrompt } from "@/components/shared/pwa-install-prompt";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillFitness - Gestión",
  description: "App de gestión y planificación de SkillFitness",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SkillFitness",
    startupImage: "/icon-512.png",
  },
  icons: {
    apple: "/icon-192.png",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#dc2626",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="bg-background">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Toaster theme="dark" position="bottom-right" richColors closeButton />
        <PwaInstallPrompt />
        {process.env.NODE_ENV === "production" && <Analytics />}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('ServiceWorker registration successful');
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
