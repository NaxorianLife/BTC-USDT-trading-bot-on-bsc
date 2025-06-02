import axios from 'axios';

export async function getBTCPrice(): Promise<number> {
  try {
    const response = await axios.get(
      "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
    );
    return parseFloat(response.data.price);
  } catch (error) {
    console.error("Error fetching BTC price:", error);
    throw error;
  }
} 