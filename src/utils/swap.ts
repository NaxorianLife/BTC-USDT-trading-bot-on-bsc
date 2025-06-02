import { ethers } from "ethers";
import { TOKENS, PANCAKESWAP_FEE, SLIPPAGE_TOLERANCE } from "./constants";
import axios from "axios";

interface SwapResult {
  success: boolean;
  txHash?: string;
  expectedOutput?: bigint;
  actualOutput?: bigint;
  fees?: bigint;
  txUrl?: string;
  error?: string;
}

// BSCScan base URL
const BSCSCAN_URL = "https://bscscan.com/tx/";

// ERC20 ABI for token interactions
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)"
];

async function checkAndApproveToken(
  tokenAddress: string,
  routerAddress: string,
  amount: bigint,
  wallet: ethers.Wallet
): Promise<boolean> {
  try {
    console.log("tokenAddress", tokenAddress);
    console.log("routerAddress", routerAddress);
    console.log("amount", amount);
    console.log("wallet", wallet);
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

    // Check current allowance
    const currentAllowance = await tokenContract.allowance(wallet.address, routerAddress);

    // If current allowance is less than amount, approve
    if (currentAllowance < amount) {
      console.log(`Approving ${ethers.formatEther(amount)} tokens for router...`);
      const approveTx = await tokenContract.approve(routerAddress, amount);
      const receipt = await approveTx.wait();
      console.log("Approval successful");
      console.log(`Approval TX: ${BSCSCAN_URL}${receipt.hash}`);
      return true;
    }

    return true;
  } catch (error) {
    console.error("Error in token approval:", error);
    return false;
  }
}

export async function calculateExpectedOutput(
  router: ethers.Contract,
  amountIn: bigint,
  path: string[]
): Promise<{ expectedOutput: bigint; minimumOutput: bigint }> {
  try {
    // Get the expected output amount from PancakeSwap
    const amountsOut = await router.getAmountsOut(amountIn, path);
    const expectedOutput = amountsOut[1];

    // Calculate fees
    const fees = (expectedOutput * BigInt(Math.floor(PANCAKESWAP_FEE * 10000))) / BigInt(10000);

    // Calculate minimum output with slippage tolerance
    const minimumOutput = (expectedOutput * BigInt(Math.floor((1 - SLIPPAGE_TOLERANCE) * 10000))) / BigInt(10000);

    return {
      expectedOutput: expectedOutput - fees, // Subtract fees from expected output
      minimumOutput
    };
  } catch (error) {
    console.error("Error calculating expected output:", error);
    throw error;
  }
}

export async function swapTokens(
  router: ethers.Contract,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  wallet: ethers.Wallet
): Promise<SwapResult> {
  try {

    // Check token balance before proceeding
    const tokenContract = new ethers.Contract(
      tokenIn,
      ["function balanceOf(address) view returns (uint256)"],
      wallet
    );

    const balance = await tokenContract.balanceOf(wallet.address);
    if (balance < amountIn) {
      console.error(`Insufficient balance. Required: ${ethers.formatEther(amountIn)}, Available: ${ethers.formatEther(balance)}`);
      return {
        success: false,
        error: `Insufficient balance. Required: ${ethers.formatEther(amountIn)}, Available: ${ethers.formatEther(balance)}`
      };
    }

    // First, check and approve token if needed
    const approvalSuccess = await checkAndApproveToken(
      tokenIn,
      router.target as string,
      amountIn,
      wallet
    );

    if (!approvalSuccess) {
      throw new Error("Token approval failed");
    }

    const path = [tokenIn, tokenOut];
    const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes

    // Calculate expected output and minimum output
    const { expectedOutput, minimumOutput } = await calculateExpectedOutput(
      router,
      amountIn,
      path
    );

    // Execute swap
    const tx = await router.swapExactTokensForTokens(
      amountIn,
      minimumOutput, // Use minimum output with slippage tolerance
      path,
      wallet.address,
      deadline
    );

    const receipt = await tx.wait();
    const txUrl = `${BSCSCAN_URL}${receipt.hash}`;

    // Get actual output from transaction receipt
    const actualOutput = await getActualOutputFromReceipt(receipt, tokenOut);

    return {
      success: true,
      txHash: tx.hash,
      expectedOutput,
      actualOutput,
      fees: expectedOutput - actualOutput,
      txUrl
    };
  } catch (error) {
    console.error("Error swapping tokens:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

async function getActualOutputFromReceipt(
  receipt: ethers.TransactionReceipt,
  tokenOut: string
): Promise<bigint> {
  // This is a simplified version. In production, you'd want to parse the actual transfer events
  // to get the exact amount received
  const transferEvent = receipt.logs.find(
    (log: any) => log.address.toLowerCase() === tokenOut.toLowerCase()
  );

  if (!transferEvent) {
    throw new Error("Could not find transfer event in receipt");
  }

  return BigInt(transferEvent.data);
}
