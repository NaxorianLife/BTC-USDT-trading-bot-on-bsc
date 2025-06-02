import { RiskLimits } from "@utils/risk";

export const DEFAULT_RISK_LIMITS: RiskLimits = {
  maxPositions: 4,           // Maximum number of concurrent positions
  maxLeverage: 5,            // Maximum allowed leverage
  maxDrawdown: 0.1,          // Maximum drawdown (10%)
  maxDailyLoss: 0.05,        // Maximum daily loss (5%)
  stopLossPercentage: 0.03,  // Stop loss at 3% loss
  takeProfitPercentage: 0.02, // Take profit at 2% gain
  maxGasPrice: 50,           // Maximum gas price in Gwei
  minLiquidity: 100000,      // Minimum required liquidity in USDT
}; 