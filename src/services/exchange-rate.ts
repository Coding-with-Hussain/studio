/**
 * Represents the exchange rate between two currencies.
 */
export interface ExchangeRate {
  /**
   * The exchange rate from the base currency to the target currency.
   */
  rate: number;
  /**
   * The timestamp of when the exchange rate was last updated (ISO string format).
   */
  lastUpdated: string; // Keep as string from API
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
 * @param fromCurrency The currency to convert from (e.g., 'USD').
 * @param toCurrency The currency to convert to (e.g., 'EUR').
 * @returns A promise that resolves to an ExchangeRate object or null if an error occurs.
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<ExchangeRate | null> {
  if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) {
    // Return a default rate if currencies are the same or invalid
    return {
      rate: 1,
      lastUpdated: new Date().toISOString(),
    };
  }

  const apiUrl = `https://api.exchangerate.host/latest?base=${fromCurrency}&symbols=${toCurrency}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error(
        `API request failed with status ${response.status}: ${response.statusText}`
      );
      // You might want to throw an error or return a specific error object
      return null; // Indicate error
    }

    const data: ExchangeRateApiResponse = await response.json();

    if (!data.success || !data.rates || !(toCurrency in data.rates)) {
      console.error("API response indicates failure or missing rate:", data);
      return null; // Indicate error
    }

    // Use the current date/time for last updated as the API provides the date of the rates, not the exact fetch time
    const lastUpdatedTimestamp = new Date().toISOString();

    return {
      rate: data.rates[toCurrency],
      lastUpdated: lastUpdatedTimestamp,
    };
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return null; // Indicate error
  }
}
