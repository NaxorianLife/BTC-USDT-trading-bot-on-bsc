# BTC Trading Bot

A sophisticated automated trading bot for BTCB/USDT pairs on PancakeSwap, implementing a multi-step DCA (Dollar Cost Averaging) strategy with leverage.

### Important thing: You need BNB for fee and USDT in your wallet!!!

## Features

- Automated BTCB/USDT trading on PancakeSwap
- Multi-step DCA strategy with leverage
- Dynamic position management
- Real-time profit calculation
- Automatic fee and slippage handling
- Recovery cycle implementation

## Prerequisites

- Node.js (v20.18.0 or higher)
- yarn
- A BSC (Binance Smart Chain) wallet with USDT and BNB for gas
- Access to a BSC RPC endpoint

## Installation

1. Clone the repository:
```bash
git clone git@github.com:cashblaze127/BTCB-USDT-trading-bot-on-bsc.git
cd BTCB-USDT-trading-bot-on-bsc
```

2. Install dependencies:
```bash
yarn install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# This is Quicknode BSC RPC URL
RPC_URL="https://newest-few-sheet.bsc.quiknode.pro/<RPC ID>/"

# This is the private key of the wallet that will be used to trade
PRIVATE_KEY="..."

# PancakeSwap Router Address
PANCAKE_ROUTER_ADDRESS="0x10ED43C718714eb63d5aA57B78B54704E256024E"

# BTC Price getting URL
BTC_PRICE_URL="https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"

# USDT Entry Amount to swap BTC
ENTRY_AMOUNT = 100
```

## Configuration

The bot can be configured by modifying the following parameters in `src/bot.ts`:

```
Strategy is private, 100% profitable Strategy
```

## Trading Strategy

### 1~5 strategies

## Usage

1. Start the bot:
```bash
yarn dev
```

2. Monitor the console output for:
   - Position entries and exits
   - Current profit/loss
   - Transaction URLs
   - Error messages

## Safety Features

- Automatic slippage protection
- Fee calculation and management
- Position size limits
- Recovery cycle implementation

## Important Notes

- Always test with small amounts first
- Ensure sufficient BNB for gas fees
- Monitor the bot regularly
- Keep your private key secure
- The bot runs on a 10-second interval
