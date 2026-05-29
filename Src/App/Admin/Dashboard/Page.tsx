'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal } from 'lucide-react';

interface MarketAdminRow { id: string; title: string; status: string; category: string; outcomes: { id: string; name: string }[]; }

export default function AdminConsole() {
  const [markets, setMarkets] = useState<MarketAdminRow[]>([]);

  useEffect(() => {
    async function loadAdminData() {
      const { data } = await supabase.from('markets').select('id, title, status, category, outcomes(id, name)');
      if (data) setMarkets(data as any);
    }
    loadAdminData();
  }, []);

  const handleResolve = async (marketId: string, outcomeId: string) => {
    const { data, error } = await supabase.rpc('resolve_and_settle_market', { p_market_id: marketId, p_winning_outcome_id: outcomeId });
    if (error) alert(`Error processing settlement payload: ${error.message}`);
    else {
      alert("Ledger finalized. Winning share distributions paid out.");
      setMarkets(prev => prev.map(m => m.id === marketId ? { ...m, status: 'resolved' } : m));
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 p-8 font-mono">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-xl font-bold flex items-center gap-2"><Terminal className="text-emerald-500" /> PREDICTLY // ADMIN OPS CORE</h1>
        <div className="grid grid-cols-1 gap-4">
          {markets.map(m => (
            <Card key={m.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{m.title}</h3>
                  <p className="text-xs text-zinc-500">Status Vector: {m.status}</p>
                </div>
                <div className="flex gap-2">
                  {m.status === 'active' && m.outcomes.map(o => (
                    <Button key={o.id} size="sm" onClick={() => handleResolve(m.id, o.id)}>Settle [{o.name}]</Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
