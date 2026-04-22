'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogOut, LayoutDashboard, History } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { items } = useCart();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="brand-font text-3xl italic font-black text-orange-600">
              QUICK<span className="text-black">BITE</span>
            </div>
          </Link>
          <div className="h-10 w-24 animate-pulse rounded-full bg-slate-100" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="brand-font text-3xl italic font-black text-orange-600">
            QUICK<span className="text-black">BITE</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors focus:outline-none">
              <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-slate-100 bg-slate-50 flex items-center justify-center">
                {user?.photoURL ? (
                  <Image 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <User className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-2xl">
              <DropdownMenuLabel className="p-4">
                <div className="flex flex-col">
                  <span className="text-sm font-black uppercase tracking-tight">{user?.displayName || 'Guest User'}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.email || 'demo@quickbite.com'}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => router.push('/orders')}
                className="flex items-center gap-3 font-bold uppercase tracking-widest text-xs rounded-xl p-3 focus:bg-slate-100 cursor-pointer"
              >
                <History className="h-4 w-4" /> My Orders
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem 
                  onClick={() => router.push('/admin')}
                  className="flex items-center gap-3 font-bold uppercase tracking-widest text-xs rounded-xl p-3 focus:bg-slate-100 cursor-pointer"
                >
                  <LayoutDashboard className="h-4 w-4" /> Admin Panel
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
