import { create } from 'zustand';

interface TradeSlipState {
  isOpen: boolean;
  marketId: string | null;
  outcomeId: string | null;
  amount: number;
  openSlip: (marketId: string, outcomeId: string) => void;
  closeSlip: () => void;
  setAmount: (amount: number) => void;
}

export const useTradeSlip = create<TradeSlipState>((set) => ({
  isOpen: false,
  marketId: null,
  outcomeId: null,
  amount: 10,
  openSlip: (marketId, outcomeId) => set({ isOpen: true, marketId, outcomeId }),
  closeSlip: () => set({ isOpen: false, marketId: null, outcomeId: null, amount: 10 }),
  setAmount: (amount) => set({ amount }),
}));
