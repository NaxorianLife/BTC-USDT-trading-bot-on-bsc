import { ethers } from "ethers";

export const TOKENS = {
  BTCB: {
    address: ethers.getAddress(("0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c").toLowerCase()),
    decimals: 18,
    symbol: "BTCB"
  },
  USDT: {
    address: ethers.getAddress(("0x55d398326f99059fF775485246999027B3197955").toLowerCase()),
    decimals: 18,
    symbol: "USDT"
  }
};

// PancakeSwap fee is 0.25%
export const PANCAKESWAP_FEE = 0.0025; // 0.25%
// Slippage tolerance (0.5%)
export const SLIPPAGE_TOLERANCE = 0.005; // 0.5%

export const PANCAKESWAP_ROUTER = {
  address: ethers.getAddress(("0x10ED43C718714eb63d5aA57B78B54704e256024E").toLowerCase()),
  abi: [
    "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"
  ]
}; 