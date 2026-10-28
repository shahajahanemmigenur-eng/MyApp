
import type { Metadata, Viewport } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

const APP_NAME = "G Post";
const APP_DEFAULT_TITLE = "G Post";
const APP_TITLE_TEMPLATE = "%s - G Post";
const APP_DESCRIPTION = "A modern social media app inspired by Instagram and Facebook.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
        <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-rounded/css/uicons-regular-rounded.css' />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="font-body antialiased bg-background h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
