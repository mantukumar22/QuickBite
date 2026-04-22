'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Truck, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function RestaurantPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, items } = useCart();

  useEffect(() => {
    async function fetchData() {
      const resDoc = await getDoc(doc(db, 'restaurants', id as string));
      if (resDoc.exists()) {
        const resData = { id: resDoc.id, ...resDoc.data() };
        setRestaurant(resData);
        
        const q = query(collection(db, 'menuItems'), where('restaurantId', '==', id));
        const menuSnap = await getDocs(q);
        setMenuItems(menuSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!restaurant) return <div>Restaurant not found</div>;

  const handleAdd = (item: any) => {
    addToCart(item, restaurant);
    toast.success(`${item.name} added to cart`);
  };

  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Banner */}
      <div className="relative h-72 w-full md:h-96">
        <Image 
          src={restaurant.image} 
          alt={restaurant.name} 
          fill
          className="object-cover"
          priority
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
        <div className="container absolute bottom-0 left-1/2 mx-auto -translate-x-1/2 px-4 pb-12 lg:px-8">
           <div className="max-w-4xl space-y-4">
              <Badge className="bg-orange-600 font-black uppercase tracking-widest px-4 py-1.5 border-none shadow-lg">{restaurant.category}</Badge>
              <h1 className="brand-font text-5xl font-black text-white md:text-7xl lg:text-8xl tracking-tightest leading-[0.85]">{restaurant.name}</h1>
              <div className="flex flex-wrap items-center gap-8 text-xs font-black uppercase tracking-widest text-slate-100 mt-4">
                <div className="flex items-center gap-2">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-white">{restaurant.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-orange-500" />
                  {restaurant.deliveryTime}
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-orange-500" />
                  ${restaurant.deliveryFee.toFixed(2)} delivery
                </div>
              </div>
           </div>
        </div>
      </div>

      <div className="container mx-auto grid grid-cols-1 gap-12 px-4 py-16 lg:grid-cols-4 lg:px-8">
        {/* Sidebar Nav */}
        <div className="hidden lg:block border-r border-slate-200 pr-8">
          <div className="sticky top-24 space-y-4">
            <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-slate-400">Categories</h3>
            {categories.map(cat => (
              <button 
                key={cat} 
                className="w-full rounded-xl px-4 py-3 text-left text-sm font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-900 hover:text-white"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="lg:col-span-3">
          {categories.map(cat => (
            <div key={cat} className="mb-16">
              <h2 className="brand-font mb-8 border-b-4 border-slate-900 pb-4 text-3xl font-black uppercase tracking-tight text-slate-900">{cat}</h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {menuItems.filter(i => i.category === cat).map(item => {
                  const inCart = items.find(ci => ci.id === item.id);
                  return (
                    <div key={item.id} className="group relative flex gap-6 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-xl">
                      <div className="flex-1 space-y-2">
                        <h4 className="text-xl font-black text-slate-900 tracking-tightest leading-tight">{item.name}</h4>
                        <p className="text-sm font-bold text-slate-400 line-clamp-2 uppercase tracking-wide leading-relaxed">{item.description}</p>
                        <p className="mt-4 text-2xl font-black text-slate-900">${item.price.toFixed(2)}</p>
                        
                        <Button 
                          onClick={() => handleAdd(item)}
                          size="lg" 
                          className={`mt-6 rounded-2xl h-12 px-6 font-black uppercase tracking-widest transition-all ${inCart ? 'bg-green-600 hover:bg-green-700' : 'bg-black hover:bg-orange-600'}`}
                        >
                          {inCart ? <Check size={18} /> : <Plus size={18} />}
                          {inCart ? 'ADDED' : 'ADD'}
                        </Button>
                      </div>
                      <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-[1.5rem]">
                        <Image 
                          src={item.image || `https://picsum.photos/seed/${item.id}/200`} 
                          alt={item.name} 
                          fill
                          className="object-cover transition-transform group-hover:scale-110 duration-500" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
