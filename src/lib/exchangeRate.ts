/**
 * Exchange Rate Service
 * Fetches real-time MYR to EUR conversion rates
 */

interface ExchangeRateResponse {
  success: boolean;
  rate: number;
  timestamp: number;
}

// Cache exchange rate for 1 hour to avoid excessive API calls
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
let cachedRate: { rate: number; timestamp: number } | null = null;

/**
 * Fetch current MYR to EUR exchange rate
 * Uses exchangerate-api.com (free tier: 1500 requests/month)
 * Fallback to a reasonable default if API fails
 */
export async function getMYRtoEURRate(): Promise<number> {
  // Check cache first
  if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_DURATION) {
    return cachedRate.rate;
  }

  try {
    // Using exchangerate-api.com - Free tier, no auth required
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/MYR');
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }

    const data = await response.json();
    const rate = data.rates.EUR;

    if (!rate || typeof rate !== 'number') {
      throw new Error('Invalid exchange rate data');
    }

    // Update cache
    cachedRate = {
      rate,
      timestamp: Date.now(),
    };

    return rate;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    
    // Fallback to approximate rate: 1 MYR ≈ 0.20 EUR (as of 2024)
    // This ensures pricing still works even if API fails
    const fallbackRate = 0.20;
    
    // Cache the fallback rate too
    cachedRate = {
      rate: fallbackRate,
      timestamp: Date.now(),
    };
    
    return fallbackRate;
  }
}

/**
 * Convert MYR to EUR with current exchange rate
 */
export async function convertMYRtoEUR(myrAmount: number): Promise<number> {
  const rate = await getMYRtoEURRate();
  return Math.round(myrAmount * rate * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert EUR to MYR with current exchange rate
 */
export async function convertEURtoMYR(eurAmount: number): Promise<number> {
  const rate = await getMYRtoEURRate();
  return Math.round((eurAmount / rate) * 100) / 100; // Round to 2 decimal places
}

/**
 * Get formatted price in both currencies
 */
export async function getFormattedPrices(myrAmount: number): Promise<{
  myr: string;
  eur: string;
  eurRaw: number;
}> {
  const eurAmount = await convertMYRtoEUR(myrAmount);
  
  return {
    myr: `RM ${myrAmount.toLocaleString('en-MY')}`,
    eur: `€${eurAmount.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    eurRaw: eurAmount,
  };
}

/**
 * Clear the exchange rate cache (useful for testing)
 */
export function clearExchangeRateCache(): void {
  cachedRate = null;
}

