export interface Position {
  id: string;
  entryPrice: number;
  amount: number;
  btcAmount: number;
  usdtValue: number;
  exitUsdtValue?: number;
  leverage: number;
  timestamp: number;
  status: 'open' | 'closed';
  exitPrice?: number;
  exitFees?: number;
  profit?: number;
  fees?: number;
}

export interface TokenBalance {
  token: string;
  amount: number;
  valueInUsdt: number;
} 