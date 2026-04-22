'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Truck, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

interface RestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    image: string;
    category: string;
    rating: number;
    deliveryTime: string;
    deliveryFee: number;
    featured?: boolean;
    discount?: string;
  };
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/restaurant/${restaurant.id}`}>
        <Card className="overflow-hidden border-none bg-white p-4 rounded-[2rem] shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-xl">
          <div className="relative h-40 w-full overflow-hidden rounded-2xl">
            <Image
              src={restaurant.image}
              alt={restaurant.name}
              fill
              className="object-cover transition-transform hover:scale-110 duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            
            {restaurant.featured && (
              <Badge className="absolute left-3 top-3 bg-orange-600 font-bold uppercase tracking-widest text-white border-none shadow-lg">
                Featured
              </Badge>
            )}
            
            {(restaurant.discount || "50% OFF") && (
              <Badge className="absolute right-3 top-3 bg-black font-black uppercase tracking-widest text-white border-none shadow-lg flex items-center gap-1">
                <Tag size={10} />
                {restaurant.discount || "50% OFF"}
              </Badge>
            )}
          </div>
          <CardContent className="px-1 py-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tightest leading-tight">{restaurant.name}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{restaurant.category}</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-600">
                <Star size={10} fill="currentColor" />
                {restaurant.rating}
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between border-t border-dashed pt-4">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-300" />
                <span className="font-black text-sm text-slate-900">{restaurant.deliveryTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-slate-300" />
                <span className="font-black text-sm text-slate-900">${restaurant.deliveryFee.toFixed(2)}</span>
              </div>
            </div>
            
            <Button className="mt-4 w-full rounded-2xl h-12 bg-slate-900 font-black uppercase tracking-widest text-white hover:bg-orange-600 transition-all">
              SELECT BITE
            </Button>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
