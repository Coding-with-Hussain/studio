/**
 * Represents the exchange rate between two currencies.
 */
export interface ExchangeRate {
  /**
   * The exchange rate from the base currency to the target currency.
   */
  rate: number;
  /**
   * The date string (YYYY-MM-DD) of when the exchange rate data was published by the API.
   */
  lastUpdated: string; // Keep as date string from API
}

/**
 * Represents the structure of the response from the exchangerate.host API.
 */
interface ExchangeRateApiResponse {
  motd: {
    msg: string;
    url: string;
  };
  success: boolean;
  base: string;
  date: string; // Date string like "YYYY-MM-DD"
  rates: {
    [currencyCode: string]: number;
  };
}

/**
 * Asynchronously retrieves the exchange rate between two currencies using exchangerate.host.
 *
 * @param fromCurrency The currency code to convert from (e.g., 'USD').
 * @param toCurrency The currency code to convert to (e.g., 'EUR').
 * @returns A promise that resolves to an ExchangeRate object or null if an error occurs or currencies are invalid/same.
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<ExchangeRate | null> {
  // Basic validation
  if (!fromCurrency || !toCurrency) {
    console.warn("Attempted to fetch rate with missing currency codes.");
    return null; // Indicate invalid input rather than default rate
  }

  // If currencies are the same, the rate is 1
  if (fromCurrency === toCurrency) {
    return {
      rate: 1,
      // Use today's date in YYYY-MM-DD format for consistency
      lastUpdated: new Date().toISOString().split('T')[0],
    };
  }

  const apiUrl = `https://api.exchangerate.host/latest?base=${fromCurrency}&symbols=${toCurrency}`;

  try {
    const response = await fetch(apiUrl, { cache: 'no-store' }); // Prevent caching if rates need to be fresh

    if (!response.ok) {
      console.error(
        `API request failed: ${response.status} ${response.statusText}. URL: ${apiUrl}`
      );
       // Try to get error details from the response body if possible
       try {
         const errorBody = await response.json();
         console.error("API Error Body:", errorBody);
       } catch (parseError) {
         // Ignore if response body isn't JSON or empty
       }
      return null; // Indicate error
    }

    const data: ExchangeRateApiResponse = await response.json();

    if (!data.success || !data.rates || !(toCurrency in data.rates)) {
      console.error("API response error or missing rate:", data);
      return null; // Indicate error
    }

    // Use the date provided by the API as the last updated date
    const lastUpdatedDate = data.date; // e.g., "2024-07-26"

    return {
      rate: data.rates[toCurrency],
      lastUpdated: lastUpdatedDate, // Return the date string from the API
    };
  } catch (error) {
     if (error instanceof Error) {
        console.error(`Network or other error fetching exchange rate from ${apiUrl}:`, error.message);
     } else {
        console.error(`An unknown error occurred fetching exchange rate from ${apiUrl}:`, error);
     }
    return null; // Indicate error
  }
}
