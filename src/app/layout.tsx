import type { Metadata } from 'next';
import { Inter } from 'next/font/google' // Use Inter font
import './globals.css';
import { ThemeProvider } from "@/components/theme-provider"; // Import ThemeProvider
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RateShift Currency Converter',
  description: 'Convert currencies with real-time exchange rates.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light" // Default to light theme
          // enableSystem // Remove system theme support
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}