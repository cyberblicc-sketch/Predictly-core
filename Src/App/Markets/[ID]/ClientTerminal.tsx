'use client';

import { useState, useEffect } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { supabase } from '@/lib/supabase/client';
import { transmitTrade } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShieldAlert, Zap } from 'lucide-react';

interface Outcome { id: string; name: string; current_price: number; color_hex: string; }
interface Market { id: string; title: string; ai_summary: string; ai_confidence_score: number; outcomes: Outcome[]; }

export default function ClientTerminal({ initialMarket }: { initialMarket: Market }) {
  const [market, setMarket] = useState<Market>(initialMarket);
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome>(market.outcomes[0]);
  const [tradeAmount, setTradeAmount] = useState<number>(10);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-market-${market.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'outcomes' }, (payload: any) => {
        if (payload.new.market_id === market.id) {
          setMarket((prev) => ({
            ...prev,
            outcomes: prev.outcomes.map(o => o.id === payload.new.id ? { ...o, current_price: payload.new.current_price } : o)
          }));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [market.id]);

  const runExecutionPipeline = async () => {
    setExecuting(true);
    try {
      await transmitTrade({ marketId: market.id, outcomeId: selectedOutcome.id, amount: tradeAmount, side: orderType });
      alert("Order executed atomically against the database ledger.");
    } catch (err: any) {
      alert(`Execution error: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto bg-zinc-950 text-zinc-50 min-h-screen">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{market.title}</h1>
          <div className="flex items-center gap-3 text-sm text-zinc-400 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
            <Zap className="w-4 h-4 text-yellow-500" />
            <p><span className="font-semibold text-zinc-200">AI Context Analysis:</span> {market.ai_summary}</p>
          </div>
        </div>
        <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xs text-zinc-400 uppercase tracking-wider">Implied Volatility Tracking Matrix</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[{ time: '00:00', price: 0.5 }, { time: '12:00', price: selectedOutcome.current_price }]}>
                <XAxis dataKey="time" stroke="#52525b" />
                <YAxis domain={[0, 1]} stroke="#52525b" />
                <Tooltip />
                <Area type="monotone" dataKey="price" stroke={selectedOutcome.color_hex} fillOpacity={0.1} fill={selectedOutcome.color_hex} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {market.outcomes.map(o => (
                <Button key={o.id} variant={selectedOutcome.id === o.id ? 'default' : 'outline'} onClick={() => setSelectedOutcome(o)}>
                  {o.name} ({(o.current_price * 100).toFixed(0)}¢)
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button className="w-full" variant={orderType === 'buy' ? 'default' : 'outline'} onClick={() => setOrderType('buy')}>Buy</Button>
              <Button className="w-full" variant={orderType === 'sell' ? 'default' : 'outline'} onClick={() => setOrderType('sell')}>Sell</Button>
            </div>
            <Input type="number" value={tradeAmount} onChange={(e) => setTradeAmount(Number(e.target.value))} />
            <Button disabled={executing} onClick={runExecutionPipeline} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12">
              {executing ? "Processing Transaction..." : "Transmit Order"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
