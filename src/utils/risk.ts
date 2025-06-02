import { ethers } from "ethers";
import { Position } from "@utils/types";
import { getBTCPrice } from "@utils/price";
import { TOKENS } from "@utils/constants";

export interface RiskLimits {
  maxPositions: number;
  maxLeverage: number;
  maxDrawdown: number;
  maxDailyLoss: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  maxGasPrice: number;
  minLiquidity: number;
}

export interface RiskMetrics {
  totalExposure: number;
  currentDrawdown: number;
  dailyPnL: number;
  openPositions: number;
  averageLeverage: number;
  gasPrice: number;
  liquidity: number;
}

export class RiskManager {
  private readonly limits: RiskLimits;
  private dailyStartBalance: number;
  private lastUpdateTime: number;

  constructor(limits: RiskLimits) {
    this.limits = limits;
    this.dailyStartBalance = 0;
    this.lastUpdateTime = Date.now();
  }

  /**
   * Check if a new position can be opened
   */
  async canOpenPosition(
    positions: Position[],
    leverage: number,
    amount: number,
    currentPrice: number
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Check number of positions
    if (positions.length >= this.limits.maxPositions) {
      return { allowed: false, reason: 'Maximum number of positions reached' };
    }

    // Check leverage
    if (leverage > this.limits.maxLeverage) {
      return { allowed: false, reason: 'Leverage exceeds maximum allowed' };
    }

    // Check total exposure
    const totalExposure = this.calculateTotalExposure(positions, amount, leverage);
    if (totalExposure > this.limits.maxDrawdown * this.dailyStartBalance) {
      return { allowed: false, reason: 'Total exposure exceeds maximum allowed' };
    }

    // Check gas price
    const gasPrice = await this.getGasPrice();
    if (gasPrice > this.limits.maxGasPrice) {
      return { allowed: false, reason: 'Gas price too high' };
    }

    // Check liquidity
    const liquidity = await this.checkLiquidity(currentPrice);
    if (liquidity < this.limits.minLiquidity) {
      return { allowed: false, reason: 'Insufficient liquidity' };
    }

    return { allowed: true };
  }

  /**
   * Check if positions should be closed due to risk limits
   */
  async shouldClosePositions(
    positions: Position[],
    currentPrice: number
  ): Promise<{ shouldClose: boolean; reason?: string }> {
    const metrics = await this.calculateRiskMetrics(positions, currentPrice);

    // Check stop loss
    if (metrics.currentDrawdown <= -this.limits.stopLossPercentage) {
      return { shouldClose: true, reason: 'Stop loss triggered' };
    }

    // Check take profit
    if (metrics.currentDrawdown >= this.limits.takeProfitPercentage) {
      return { shouldClose: true, reason: 'Take profit reached' };
    }

    // Check daily loss limit
    if (metrics.dailyPnL <= -this.limits.maxDailyLoss) {
      return { shouldClose: true, reason: 'Daily loss limit reached' };
    }

    return { shouldClose: false };
  }

  /**
   * Calculate total exposure including new position
   */
  private calculateTotalExposure(
    positions: Position[],
    newAmount: number,
    newLeverage: number
  ): number {
    const existingExposure = positions.reduce(
      (sum, pos) => sum + pos.usdtValue * pos.leverage,
      0
    );
    return existingExposure + newAmount * newLeverage;
  }

  /**
   * Calculate current risk metrics
   */
  private async calculateRiskMetrics(
    positions: Position[],
    currentPrice: number
  ): Promise<RiskMetrics> {
    const totalExposure = positions.reduce(
      (sum, pos) => sum + pos.usdtValue * pos.leverage,
      0
    );

    const totalEntryValue = positions.reduce(
      (sum, pos) => sum + pos.usdtValue,
      0
    );
    const totalCurrentValue = positions.reduce(
      (sum, pos) => sum + currentPrice * pos.btcAmount,
      0
    );

    const currentDrawdown = (totalCurrentValue - totalEntryValue) / totalEntryValue;
    const averageLeverage =
      positions.reduce((sum, pos) => sum + pos.leverage, 0) / positions.length || 0;

    const gasPrice = await this.getGasPrice();
    const liquidity = await this.checkLiquidity(currentPrice);

    return {
      totalExposure,
      currentDrawdown,
      dailyPnL: this.calculateDailyPnL(totalCurrentValue),
      openPositions: positions.length,
      averageLeverage,
      gasPrice,
      liquidity,
    };
  }

  private async getGasPrice(): Promise<number> {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const gasPrice = await provider.getFeeData();
    return Number(gasPrice.gasPrice) / 1e9; // Convert to Gwei
  }

  private async checkLiquidity(currentPrice: number): Promise<number> {
    return 1000000; // Example value
  }

  private calculateDailyPnL(currentValue: number): number {
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    if (now - this.lastUpdateTime > dayInMs) {
      this.dailyStartBalance = currentValue;
      this.lastUpdateTime = now;
    }

    return (currentValue - this.dailyStartBalance) / this.dailyStartBalance;
  }

  updateDailyStartBalance(balance: number): void {
    this.dailyStartBalance = balance;
    this.lastUpdateTime = Date.now();
  }
} 