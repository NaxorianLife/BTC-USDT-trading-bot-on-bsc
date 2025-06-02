import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import { Position } from "@utils/types";
import { getBTCPrice } from "@utils/price";
import { swapTokens } from "@utils/swap";
import { TOKENS, PANCAKESWAP_ROUTER, PANCAKESWAP_FEE, SLIPPAGE_TOLERANCE } from "@utils/constants";

class TradingBot {
  private positions: Position[] = [];
  private readonly entryAmount: number;
  private readonly baseLeverage: number = 2;
  private readonly profitTarget: number = 0.01;
  private readonly minimumProfitThreshold: number = this.profitTarget + PANCAKESWAP_FEE + SLIPPAGE_TOLERANCE;

  // Price drop thresholds for each step
  private readonly DROP_THRESHOLDS = {
    STEP2: 
    STEP3: 
    STEP4: 
    RECOVERY: 
  };

  private calculateAverageEntryPrice(): number {
    const openPositions = this.positions.filter(p => p.status === 'open');
    if (openPositions.length === 0) return 0;

    const totalValue = openPositions.reduce((sum, pos) => sum + (pos.entryPrice * pos.amount), 0);
    const totalAmount = openPositions.reduce((sum, pos) => sum + pos.amount, 0);
    return totalValue / totalAmount;
  }

  private calculateTotalProfit(currentPrice: number): number {
    const openPositions = this.positions.filter(p => p.status === 'open');
    if (openPositions.length === 0) return 0;

    const totalEntryValue = openPositions.reduce((sum, pos) => sum + pos.usdtValue, 0);
    const totalCurrentValue = openPositions.reduce((sum, pos) => sum + (currentPrice * pos.btcAmount), 0);

    // Calculate total fees for all positions
    const totalFees = openPositions.reduce((sum, pos) => sum + pos.fees, 0);

    // Calculate net profit after fees and slippage
    const grossProfit = totalCurrentValue - totalEntryValue;
    const totalFeesAndSlippage = totalEntryValue * (PANCAKESWAP_FEE + SLIPPAGE_TOLERANCE) + totalFees;
    const netProfit = grossProfit - totalFeesAndSlippage;

    return netProfit / totalEntryValue;
  }

  async enterPosition(currentPrice: number, leverage: number = this.baseLeverage): Promise<void> {
    try {
      const leveragedAmount = this.entryAmount * leverage;
      const amountInWei = ethers.parseEther(leveragedAmount.toString());

      const swapResult = await swapTokens(
        this.router,
        TOKENS.USDT.address,
        TOKENS.BTCB.address,
        amountInWei,
        this.wallet
      );

      if (!swapResult.success) {
        console.error(`Failed to enter position: ${swapResult.error}`);
        return;
      }

      if (swapResult.actualOutput) {
        const actualEntryPrice = (Number(amountInWei) / Number(swapResult.actualOutput)) * currentPrice;
        const btcAmount = Number(swapResult.actualOutput) / 1e18;

        const position: Position = {
          id: Date.now().toString(),
          entryPrice: actualEntryPrice,
          amount: leveragedAmount,
          btcAmount: btcAmount,
          usdtValue: leveragedAmount,
          leverage: leverage,
          timestamp: Date.now(),
          status: 'open',
          fees: Number(swapResult.fees)
        };

        this.positions.push(position);
        if (swapResult.txUrl) {
          console.log(`Transaction: ${swapResult.txUrl}`);
        }
      }
    } catch (error) {
      console.error('Error entering position:', error);
      throw error;
    }
  }

  constructor(
    private readonly wallet: ethers.Wallet,
    private readonly router: ethers.Contract,
    entryAmount: number
  ) {
    this.entryAmount = entryAmount;
    this.baseLeverage = 2;
    this.profitTarget = 0.01;
    this.minimumProfitThreshold = this.profitTarget + PANCAKESWAP_FEE + SLIPPAGE_TOLERANCE;
  }

  async exitAllPositions(currentPrice: number): Promise<void> {
    const openPositions = this.positions.filter(p => p.status === 'open');

    for (const position of openPositions) {
      try {
        // Swap all Tokens to USDT
      } catch (error) {
        console.error('Error exiting position:', error);
      }
    }
  }

  async executeStrategy(): Promise<void> {
    try {
      const currentPrice = await getBTCPrice();

      if (openPositions.length > 0) {
      }

      if (openPositions.length === 0) {
        await this.enterPosition(currentPrice);
        return;
      }

      const priceDrop = lastPosition ? (lastPosition.entryPrice - currentPrice) / lastPosition.entryPrice / 100 : 0;
      const totalProfit = this.calculateTotalProfit(currentPrice);

      Main Strategies here!!!
    } catch (error) {
      console.error('Error executing strategy:', error);
    }
  }
}

export async function startBot() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const router = new ethers.Contract(
    PANCAKESWAP_ROUTER.address,
    PANCAKESWAP_ROUTER.abi,
    wallet
  );

  const entryAmount = Number(process.env.ENTRY_AMOUNT as string);

  const bot = new TradingBot(wallet, router, entryAmount);

  console.log("========== BTC Trading Bot Started ==========");
  console.log(`Entry Amount: ${entryAmount} USDT, PANCAKESWAP_FEE ${PANCAKESWAP_FEE}, SLIPPAGE_TOLERANCE ${SLIPPAGE_TOLERANCE}`);
  await bot.executeStrategy();

  setInterval(() => bot.executeStrategy(), 10000);
}

startBot();