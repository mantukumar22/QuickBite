'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });
      return () => unsubscribe();
    }
    
    if (!authLoading && !isAdmin) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  }, [isAdmin, authLoading]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      toast.success(`Order ${orderId.slice(0, 5)} updated successfully`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return (
    <div className="flex min-h-screen flex-col bg-[#F4F4F4]">
      <Navbar />
      <div className="container mx-auto px-4 py-20 text-center font-black uppercase tracking-widest text-slate-300">
        Syncing Command Center...
      </div>
    </div>
  );

  if (!isAdmin) return (
    <div className="flex min-h-screen flex-col bg-[#F4F4F4]">
      <Navbar />
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="brand-font text-5xl font-black uppercase text-slate-900 tracking-tightest">Access Denied</h2>
        <p className="mt-4 font-bold uppercase tracking-widest text-slate-400">This area is restricted to high-clearance administrators.</p>
        <Button onClick={() => window.location.href = '/'} className="mt-12 rounded-2xl bg-black px-10 py-6 font-black uppercase tracking-widest text-white shadow-xl hover:bg-orange-600 transition-all">
          RETREAT TO BASE
        </Button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F4F4F4] pb-20 text-slate-900">
      <Navbar />
      <div className="container mx-auto px-4 py-12 lg:px-8">
        <div className="mb-12 border-b-8 border-black pb-8">
          <h1 className="brand-font text-6xl font-black uppercase tracking-tightest text-slate-900 md:text-8xl">Command Center</h1>
          <p className="mt-2 font-bold uppercase tracking-widest text-slate-400">Managing global logistics and culinary delivery flow.</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden border-none bg-white p-8 rounded-[2.5rem] shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-xl">
              <div className="flex flex-col gap-8 md:flex-row md:items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 rounded-full text-slate-500">#{order.id.slice(0, 8)}</span>
                    <Badge className="bg-orange-50 text-orange-600 font-black uppercase tracking-widest border-none px-3">{order.status}</Badge>
                  </div>
                  <h2 className="text-3xl font-black tracking-tightest leading-none">{order.restaurantName}</h2>
                  <div className="flex flex-col gap-2">
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-widest">
                        <span className="text-slate-900">{item.quantity}x</span> {item.name}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-6 md:items-end">
                  <div className="text-right">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">Revenue</div>
                    <div className="text-4xl font-black text-slate-900 tracking-tightest">${order.totalAmount.toFixed(2)}</div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">Update Flow</div>
                    <Select 
                      defaultValue={order.status} 
                      onValueChange={(val) => updateStatus(order.id, val)}
                    >
                      <SelectTrigger className="h-14 w-[240px] rounded-2xl border-4 border-slate-900 bg-white px-6 font-black uppercase tracking-widest text-slate-900 focus:ring-0">
                        <SelectValue placeholder="STATUS" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-4 border-slate-900 p-2 shadow-2xl">
                        <SelectItem value="pending" className="rounded-xl font-bold uppercase tracking-widest">Pending</SelectItem>
                        <SelectItem value="confirmed" className="rounded-xl font-bold uppercase tracking-widest">Confirmed</SelectItem>
                        <SelectItem value="preparing" className="rounded-xl font-bold uppercase tracking-widest">Preparing</SelectItem>
                        <SelectItem value="on-the-way" className="rounded-xl font-bold uppercase tracking-widest">On the Way</SelectItem>
                        <SelectItem value="delivered" className="rounded-xl font-bold uppercase tracking-widest">Delivered</SelectItem>
                        <SelectItem value="cancelled" className="rounded-xl font-bold uppercase tracking-widest text-red-600">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {orders.length === 0 && (
            <div className="py-40 text-center opacity-20">
              <h3 className="brand-font text-6xl font-black uppercase tracking-tightest">Zero Traffic</h3>
              <p className="mt-4 font-bold uppercase tracking-widest">No active logistics signals detected.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
