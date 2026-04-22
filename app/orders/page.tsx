'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, ChevronRight, Package, Truck, Utensils, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });

      return () => unsubscribe();
    }
    
    if (!authLoading && !user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  }, [user, authLoading]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div className="p-20 text-center">Please login to view your orders.</div>;

  const getStatusConfig = (status: string) => {
    const configs: any = {
      'pending': { icon: <Clock size={16} />, label: 'Awaiting Confirmation', color: 'text-yellow-600', bg: 'bg-yellow-100', pulse: false, step: 1 },
      'confirmed': { icon: <CheckCircle2 size={16} />, label: 'Order Confirmed', color: 'text-blue-600', bg: 'bg-blue-50', pulse: false, step: 2 },
      'preparing': { icon: <Utensils size={16} />, label: 'Kitchen is Cooking', color: 'text-orange-600', bg: 'bg-orange-50', pulse: true, step: 3 },
      'on-the-way': { icon: <Truck size={16} />, label: 'Driver is 4 mins away', color: 'text-blue-600', bg: 'bg-blue-50', pulse: true, step: 4 },
      'delivered': { icon: <Package size={16} />, label: 'Delivered', color: 'text-green-600', bg: 'bg-green-50', pulse: false, step: 5 },
      'cancelled': { icon: <XCircle size={16} />, label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50', pulse: false, step: 0 },
    };
    return configs[status] || configs.pending;
  };

  return (
    <main className="min-h-screen bg-[#F4F4F4] pb-20">
      <Navbar />
      <div className="container mx-auto px-4 py-12 lg:px-8">
        <div className="mb-12">
          <h1 className="brand-font text-5xl font-black uppercase tracking-tightest text-slate-900 md:text-6xl">Live Track</h1>
          <p className="mt-2 font-bold uppercase tracking-widest text-slate-400">Real-time connection to your kitchen.</p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {orders.length > 0 ? (
              orders.map((order) => {
                const status = getStatusConfig(order.status);
                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="overflow-hidden border-none p-8 rounded-[2rem] shadow-sm ring-1 ring-slate-100">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order #{order.id.slice(0, 8)}</div>
                          <div className="text-2xl font-black tracking-tightest">{order.restaurantName}</div>
                        </div>
                        {status.pulse && (
                          <div className="relative">
                            <div className="absolute -inset-1 rounded-full bg-green-500 opacity-20 blur-md animate-pulse" />
                            <div className="status-pulse" />
                          </div>
                        )}
                      </div>

                      {/* Map/Track Visualization */}
                      <div className={`relative h-40 ${status.bg} rounded-3xl overflow-hidden mb-8 border border-slate-100/50`}>
                        <div className="absolute inset-0 pattern-dots" /> 
                        <div className="absolute bottom-4 left-6 flex items-center gap-2">
                           <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                              {status.icon}
                           </div>
                           <span className={`text-xs font-black uppercase tracking-widest ${status.color}`}>
                             {status.label}
                           </span>
                        </div>
                        
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <div className="absolute top-1/2 left-6 right-6 h-1.5 bg-white/50 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-orange-500 origin-left" 
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: status.step * 0.2 }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Your Selection</div>
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-slate-900">{item.quantity}x</span>
                              <span className="text-sm font-bold text-slate-600">{item.name}</span>
                            </div>
                            <span className="text-sm font-black text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 flex items-center justify-between border-t border-dashed border-slate-200 pt-6">
                         <div className="text-sm font-black uppercase tracking-widest text-slate-900">
                           Total
                         </div>
                         <div className="text-3xl font-black tracking-tightest text-orange-600">
                           ${order.totalAmount.toFixed(2)}
                         </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center">
                <Utensils size={64} className="mx-auto mb-6 text-slate-200" />
                <h3 className="brand-font text-3xl font-black uppercase text-slate-300">Nothing Tracked</h3>
                <p className="mt-2 text-slate-400 font-bold uppercase tracking-widest">Hungry? Order something first.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
