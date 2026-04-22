'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import RestaurantCard from '@/components/RestaurantCard';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { seedData } from '@/lib/seed';
import { Button } from '@/components/ui/button';
import { Utensils, Search, Sparkles, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { GoogleGenAI, Type } from "@google/genai";

const FALLBACK_RESTAURANTS = [
  { id: 'fb1', name: "Burger King", image: "https://picsum.photos/seed/fb1/800/600", category: "Burgers", rating: 4.5, deliveryTime: "15-20 min", deliveryFee: 2.0, featured: true, discount: "20% OFF" },
  { id: 'fb2', name: "Sushi Zen", image: "https://picsum.photos/seed/fb2/800/600", category: "Sushi", rating: 4.8, deliveryTime: "30-40 min", deliveryFee: 4.5, featured: true, discount: "BOGO" },
  { id: 'fb3', name: "Pizza Roma", image: "https://picsum.photos/seed/fb3/800/600", category: "Pizza", rating: 4.2, deliveryTime: "20-30 min", deliveryFee: 1.99, featured: false, discount: "FREE ITEM" },
  { id: 'fb4', name: "Taco Loco", image: "https://picsum.photos/seed/fb4/800/600", category: "Mexican", rating: 4.6, deliveryTime: "10-20 min", deliveryFee: 0.0, featured: true, discount: "50% OFF" },
];

export default function Home() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [mood, setMood] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);

  useEffect(() => {
    seedData();
    const q = query(collection(db, 'restaurants'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (data.length > 0) {
          setRestaurants(data);
          localStorage.setItem('quickbite_cache', JSON.stringify(data));
        } else {
          const cached = localStorage.getItem('quickbite_cache');
          setRestaurants(cached ? JSON.parse(cached) : FALLBACK_RESTAURANTS);
        }
        setLoading(false);
      } catch (err) {
        setRestaurants(FALLBACK_RESTAURANTS);
        setLoading(false);
      }
    }, () => {
      const cached = localStorage.getItem('quickbite_cache');
      setRestaurants(cached ? JSON.parse(cached) : FALLBACK_RESTAURANTS);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleMoodSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood.trim()) return;

    setIsAiLoading(true);
    setAiTip(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string });
      const availableCategories = ['Burgers', 'Sushi', 'Pizza', 'Mexican', 'Desserts', 'Healthy', 'Indian', 'Chinese'];
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `I'm in the mood for: "${mood}". Based on these categories: ${availableCategories.join(', ')}, select the best one and give a 1-sentence catchy recommendation.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: "The single best category from the list." },
              recommendation: { type: Type.STRING, description: "A catchy 1-sentence recommendation." }
            },
            required: ["category", "recommendation"]
          }
        }
      });

      const resultData = response.text;
      if (!resultData) throw new Error("No AI response");

      const result = JSON.parse(resultData);
      if (result.category && availableCategories.includes(result.category)) {
        setActiveCategory(result.category);
        setAiTip(result.recommendation);
      }
    } catch (error) {
      console.error("AI Mood Error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const filtered = restaurants.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || 
                         r.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || r.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen pb-20 bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#F4F4F4] py-16 text-slate-900 md:py-24">
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-12 lg:flex-row lg:items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <h1 className="brand-font text-6xl font-black leading-[0.9] tracking-tightest md:text-8xl">
                EAT BETTER<br/>LIVE <span className="text-orange-600">FAST</span>
              </h1>
              <p className="mt-8 max-w-lg text-lg font-bold text-slate-500 uppercase tracking-widest">
                Premium fuel for your high-speed life. <br className="hidden md:block" /> 
                Delivered in under 30 mins or it&apos;s on us.
              </p>
              
              <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <Input 
                    placeholder="Search tacos, sushi, pizza..." 
                    className="h-16 rounded-full border-none bg-white py-5 pl-14 pr-6 text-lg font-bold text-slate-900 shadow-xl shadow-slate-200/50 outline-none ring-0 placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-orange-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    suppressHydrationWarning
                  />
                </div>
                <Button className="h-16 rounded-full bg-orange-600 px-10 text-lg font-black uppercase tracking-widest text-white shadow-lg shadow-orange-200 hover:bg-black transition-all">
                  FIND FOOD
                </Button>
              </div>

              {/* AI Mood Section */}
              <div className="mt-12 w-full max-w-xl rounded-[2rem] bg-white p-2 shadow-2xl ring-4 ring-orange-500/10">
                <form onSubmit={handleMoodSearch} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-600" size={18} />
                    <Input 
                      placeholder="What are you in the mood for? (e.g. something spicy & quick)" 
                      className="h-14 rounded-full border-none bg-slate-50 py-4 pl-14 pr-4 font-bold text-slate-900 placeholder:text-slate-300 focus-visible:ring-0"
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                    />
                  </div>
                  <Button 
                    type="submit"
                    disabled={isAiLoading}
                    className="h-14 rounded-full bg-slate-900 px-6 font-black uppercase tracking-widest text-white hover:bg-orange-600 transition-all disabled:opacity-50"
                  >
                    {isAiLoading ? <Loader2 className="animate-spin" /> : 'ASK AI'}
                  </Button>
                </form>
                
                <AnimatePresence>
                  {aiTip && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden px-6 pt-4 pb-2"
                    >
                      <div className="rounded-2xl bg-orange-50 p-4 border border-orange-100">
                        <p className="text-sm font-black text-orange-900 uppercase tracking-tight">AI Recommendation:</p>
                        <p className="mt-1 text-sm font-bold text-orange-700 italic">"{aiTip}"</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden h-[400px] w-full max-w-md items-center justify-center lg:flex"
            >
              <div className="absolute h-96 w-96 rounded-full bg-orange-100/50 blur-3xl" />
              <div className="relative z-10 h-full w-full overflow-hidden rounded-[3rem] shadow-2xl skew-x-3">
                <Image 
                  src="https://picsum.photos/seed/food-main/800/800" 
                  alt="Delicious Food"
                  fill
                  className="object-cover"
                  priority
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Category Strip */}
      <section className="container mx-auto mt-12 px-4 lg:px-8">
        <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
          {['All', 'Burgers', 'Sushi', 'Pizza', 'Mexican', 'Desserts', 'Healthy', 'Indian', 'Chinese'].map(cat => (
            <Button 
              key={cat} 
              variant={activeCategory === cat ? 'default' : 'outline'} 
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-2xl border-2 px-8 py-6 font-black uppercase tracking-widest transition-all ${
                activeCategory === cat 
                ? 'bg-orange-600 border-orange-600 text-white hover:bg-orange-700' 
                : 'border-slate-200 text-slate-500 hover:border-orange-600 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </section>

      {/* Popular Bites Section */}
      <section className="container mx-auto mt-12 px-4 lg:px-8">
        <div className="flex items-end justify-between border-b-4 border-slate-900 pb-4">
          <h2 className="brand-font text-3xl font-black uppercase tracking-tight text-slate-900">
            {activeCategory === 'All' ? 'Popular Bites' : `${activeCategory} Spots`}
          </h2>
          <Link href="/all" className="text-sm font-black uppercase tracking-widest text-orange-600 hover:underline">
            See All →
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-80 animate-pulse rounded-[2rem] bg-slate-200" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.length > 0 ? (
              filtered.map((res) => (
                <RestaurantCard key={res.id} restaurant={res} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <Utensils className="mx-auto mb-4 text-slate-200" size={64} />
                <p className="brand-font text-2xl font-black uppercase text-slate-300">Nothing Found</p>
              </div>
            )}
          </div>
        )}

        {/* Promo Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 flex flex-col items-center justify-between gap-8 rounded-[3rem] bg-orange-600 p-10 text-white md:flex-row lg:p-16"
        >
          <div className="max-w-xl text-center md:text-left">
            <span className="text-xs font-black uppercase tracking-widest opacity-80">Flash Deal</span>
            <h3 className="mt-2 text-4xl font-black leading-tight tracking-tightest md:text-6xl">
              Get 50% OFF your next order
            </h3>
            <p className="mt-6 text-lg font-bold opacity-90 uppercase tracking-widest">
              Use code <span className="rounded bg-white px-2 py-1 text-orange-600">QUICK50</span> at checkout.
            </p>
          </div>
          <div className="brand-font pointer-events-none select-none text-8xl font-black opacity-20 md:text-9xl">
            50%
          </div>
        </motion.div>
      </section>
    </main>
  );
}
