import { supabase } from '@/lib/supabase/client';

interface TradeExecutionParams {
  marketId: string;
  outcomeId: string;
  amount: number;
  side: 'buy' | 'sell';
}

export async function transmitTrade({ marketId, outcomeId, amount, side }: TradeExecutionParams) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) throw new Error("Authentication session contextual state token missing.");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/execute-trade`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      },
      body: JSON.stringify({ marketId, outcomeId, amount, side }),
    }
  );

  const parsedOutput = await response.json();
  if (!response.ok) throw new Error(parsedOutput.error || "Execution gateway processing failure.");

  return parsedOutput;
}
