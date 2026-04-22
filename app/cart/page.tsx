'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, total, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  // Financial Calculations
  const deliveryFee = items.length > 0 ? 3.99 : 0; 
  const serviceFee = items.length > 0 ? 1.50 : 0;
  const taxRate = 0.08; // 8% Tax
  const taxAmount = total * taxRate;
  const grandTotal = total + deliveryFee + serviceFee + taxAmount;

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please login to proceed");
      return;
    }

    if (!address || address.length < 5) {
      toast.error("Please enter a valid delivery address");
      return;
    }

    setCheckingOut(true);
    try {
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        restaurantId: items[0].restaurantId,
        restaurantName: items[0].restaurantName,
        items: items,
        totalAmount: grandTotal,
        status: 'pending',
        deliveryAddress: address,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success("Fuel is on the way! Order placed.");
      clearCart();
      router.push('/orders');
    } catch (error) {
      console.error(error);
      toast.error("The logistics failed. Try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24 text-slate-900">
      <Navbar />

      <div className="container mx-auto px-4 py-16 lg:px-12 max-w-7xl">
        <header className="mb-16 border-b-8 border-black pb-8">
          <h1 className="brand-font text-6xl font-black uppercase tracking-tightest md:text-8xl flex items-center gap-4">
            CHECKOUT <span className="text-orange-600">BAG</span>
          </h1>
          <p className="mt-4 text-sm font-bold uppercase tracking-[0.3em] text-slate-400">
            Precision fueling for high-output lifestyles.
          </p>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center rounded-[3rem] bg-white border-4 border-dashed border-slate-200">
            <div className="mb-10 flex h-40 w-40 items-center justify-center rounded-full bg-slate-50 text-slate-200">
               <ShoppingBag size={80} strokeWidth={3} />
            </div>
            <h2 className="brand-font text-5xl font-black uppercase tracking-tighter">System Offline</h2>
            <p className="mt-4 max-w-md font-bold uppercase tracking-widest text-slate-400">Your metabolic stack is currently empty. Initialize selection.</p>
            <Button 
              onClick={() => router.push('/')} 
              className="mt-12 h-20 rounded-3xl bg-black px-12 font-black uppercase tracking-widest text-white ring-offset-4 ring-orange-500 hover:bg-orange-600 hover:ring-4 transition-all"
            >
              FIND FUEL SOURCES
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
            {/* Logic Block: Items & Address */}
            <div className="lg:col-span-8 flex flex-col gap-12">
              
              {/* Restaurant Header */}
              <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Active Supply</span>
                  <h3 className="brand-font text-3xl font-black tracking-tightest uppercase">{items[0].restaurantName}</h3>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={clearCart} 
                  className="rounded-xl h-12 font-black uppercase tracking-widest text-red-500 hover:bg-red-50"
                >
                  ABORT MISSION
                </Button>
              </div>

              {/* Items List */}
              <div className="space-y-6">
                {items.map(item => (
                  <Card key={item.id} className="group border-4 border-black bg-white p-6 rounded-[2.5rem] shadow-[12px_12px_0px_#000000] hover:translate-x-1 hover:-translate-y-1 transition-all">
                    <CardContent className="p-0 flex flex-col sm:flex-row items-center gap-8">
                      {/* Image Container */}
                      <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border-2 border-black rotate-2 group-hover:rotate-0 transition-transform">
                        <Image 
                          src={item.image || `https://picsum.photos/seed/${item.id}/400`} 
                          alt={item.name} 
                          fill
                          className="object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="text-2xl font-black uppercase tracking-tightest leading-none mb-2">{item.name}</h4>
                        <div className="flex items-center justify-center sm:justify-start gap-4">
                          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Unit Price</span>
                          <span className="text-lg font-black text-slate-900 tracking-tighter">${item.price.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="flex items-center border-4 border-black rounded-2xl p-1 bg-slate-50">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-12 w-12 rounded-xl text-black hover:bg-white active:scale-95"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus size={20} strokeWidth={3} />
                          </Button>
                          <span className="w-12 text-center text-xl font-black tabular-nums">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-12 w-12 rounded-xl text-black hover:bg-white active:scale-95"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus size={20} strokeWidth={3} />
                          </Button>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Subtotal</div>
                          <div className="text-2xl font-black text-orange-600 tracking-tightest">${(item.price * item.quantity).toFixed(2)}</div>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeFromCart(item.id)}
                          className="h-14 w-14 rounded-full text-slate-200 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={24} strokeWidth={2.5} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Delivery Hub */}
              <div className="space-y-6 pt-4">
                 <div className="flex items-center gap-4 px-2">
                    <div className="h-4 w-4 rounded-full bg-orange-600 animate-pulse" />
                    <h3 className="brand-font text-3xl font-black uppercase tracking-tightest">Logistics Hub</h3>
                 </div>
                 <div className="relative group">
                    <div className="absolute -inset-2 rounded-[2rem] bg-orange-600 opacity-0 group-focus-within:opacity-10 transition-opacity" />
                    <Input 
                      placeholder="ENTER DESTINATION COORDINATES (ADDRESS)..." 
                      className="h-24 rounded-[2rem] border-4 border-black bg-white px-8 text-lg font-black uppercase tracking-widest text-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,0.05)] placeholder:text-slate-200 focus:outline-none focus:ring-0 focus:border-orange-600 transition-all"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      suppressHydrationWarning
                    />
                 </div>
              </div>
            </div>

            {/* Tactical Summary Block */}
            <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
              <div className="relative">
                {/* Background Shadow Effect */}
                <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[3.5rem] bg-black opacity-10" />
                
                <Card className="relative border-none bg-slate-900 p-10 text-white rounded-[3.5rem] overflow-hidden">
                  {/* Design Accent */}
                  <div className="absolute top-0 right-0 h-40 w-40 -mr-16 -mt-16 rounded-full bg-orange-600 opacity-20 blur-3xl" />
                  
                  <CardContent className="p-0 relative z-10">
                    <div className="mb-12 border-b-2 border-white/10 pb-6">
                      <h3 className="brand-font text-4xl font-black italic tracking-widest uppercase text-white">Summary</h3>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Operation: Checkout_Final</p>
                    </div>

                    <div className="space-y-5">
                      <div className="flex justify-between items-center group">
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-300">Merchandise</span>
                        <span className="font-bold tracking-tight text-lg">${total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center group">
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-300">Logistics</span>
                        <span className="font-bold tracking-tight text-lg underline decoration-orange-600 decoration-2 underline-offset-4">${deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center group">
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-300">Platform Surcharge</span>
                        <span className="font-bold tracking-tight text-lg">${serviceFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center group">
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-300">Tax Protocol (8%)</span>
                        <span className="font-bold tracking-tight text-lg">${taxAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="my-10 h-[4px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <div className="mb-12 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">Grand Total</span>
                        <div className="brand-font text-5xl font-black tracking-tightest leading-none">${grandTotal.toFixed(2)}</div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleCheckout}
                      disabled={checkingOut}
                      className="h-24 w-full rounded-2xl bg-orange-600 text-2xl font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-orange-900/40 hover:bg-white hover:text-black hover:-rotate-1 active:scale-95 transition-all disabled:grayscale disabled:opacity-50"
                    >
                      {checkingOut ? 'SYNCHRONIZING...' : 'AUTHORIZE ORDER'}
                      {!checkingOut && <ArrowRight size={28} strokeWidth={3} className="ml-4" />}
                    </Button>

                    <div className="mt-10 flex flex-col items-center gap-4 border-t border-white/5 pt-8">
                       <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22C55E]" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          AES-256 Bit Tactical Encryption
                        </span>
                       </div>
                       <p className="text-[9px] font-medium text-slate-600 uppercase text-center leading-relaxed">
                         By authorizing, you confirm the acquisition and dispatch of these perishable assets.
                       </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
