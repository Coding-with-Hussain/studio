
import { conversion_rates } from '@/lib/currencies';

/**
 * Represents the exchange rate between two currencies.
 */
export interface ExchangeRate {
  /**
   * The exchange rate from the base currency to the target currency.
   */
  rate: number;
  /**
   * The date string (YYYY-MM-DD) indicating when the static rate data was last updated.
   */
  lastUpdated: string; // Keep as date string
}

// Date when the static rates were last updated (adjust if needed)
const STATIC_RATES_DATE = "2024-07-26"; // Or use a dynamic way to track updates

/**
 * Retrieves the exchange rate between two currencies using static data.
 *
 * @param fromCurrency The currency code to convert from (e.g., 'USD').
 * @param toCurrency The currency code to convert to (e.g., 'EUR').
 * @returns A promise that resolves to an ExchangeRate object or null if currencies are invalid/not found in static data.
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<ExchangeRate | null> {
  // Basic validation
  if (!fromCurrency || !toCurrency) {
    console.warn("Attempted to fetch rate with missing currency codes.");
    return null;
  }

  // If currencies are the same, the rate is 1
  if (fromCurrency === toCurrency) {
    return {
      rate: 1,
      lastUpdated: STATIC_RATES_DATE,
    };
  }

  // Check if both currencies exist in our static rates data
  if (!(fromCurrency in conversion_rates) || !(toCurrency in conversion_rates)) {
    console.error(`One or both currencies not found in static data: ${fromCurrency}, ${toCurrency}`);
    // Instead of returning null immediately, maybe try fetching from API as a fallback?
    // For now, returning null as the static data is the primary source.
    return null;
  }

  try {
    const fromRateUSD = conversion_rates[fromCurrency]; // Rate of 1 USD to fromCurrency
    const toRateUSD = conversion_rates[toCurrency];     // Rate of 1 USD to toCurrency

    if (!fromRateUSD || !toRateUSD) {
        // This case should ideally not happen if the check above passed, but good for safety.
         console.error(`Static rate data missing for: ${fromCurrency} or ${toCurrency}`);
         return null;
    }

    // Calculate the rate: (amount in USD) / (rate of fromCurrency to USD) * (rate of toCurrency to USD)
    // Since our rates are USD based (1 USD = X OTHER), we calculate:
    // 1 unit of fromCurrency = (1 / fromRateUSD) USD
    // (1 / fromRateUSD) USD = (1 / fromRateUSD) * toRateUSD units of toCurrency
    const calculatedRate = (1 / fromRateUSD) * toRateUSD;


    return {
      rate: calculatedRate,
      lastUpdated: STATIC_RATES_DATE,
    };

  } catch (error) {
     console.error(`Error calculating exchange rate between ${fromCurrency} and ${toCurrency} using static data.`);
     if (error instanceof Error) {
        console.error("Error Details:", error.message, error.stack);
     } else {
        console.error("An unknown error occurred:", error);
     }
    return null; // Indicate error
  }
}
