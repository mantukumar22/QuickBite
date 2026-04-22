import type { Metadata } from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from '@/components/ui/sonner';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'QuickBite | Fast & Fresh Food Delivery',
  description: 'Order your favorite food from local restaurants with real-time tracking.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body suppressHydrationWarning className="min-h-screen bg-slate-50 antialiased">
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster richColors position="top-center" />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
