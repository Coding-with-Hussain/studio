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
 * Represents the structure of the response from the frankfurter.app API.
 */
interface FrankfurterApiResponse {
  amount?: number; // Amount converted (usually 1 when fetching rate)
  base?: string;   // Base currency code
  date?: string;   // Date string like "YYYY-MM-DD"
  rates?: {       // Target currency rates relative to the base
    [currencyCode: string]: number;
  };
  // Frankfurter typically doesn't have a 'success' or 'error' field in the same way,
  // relies on HTTP status codes for errors. We handle non-ok responses.
}

/**
 * Asynchronously retrieves the exchange rate between two currencies using frankfurter.app.
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

  // Use frankfurter.app API endpoint
  const apiUrl = `https://api.frankfurter.app/latest?from=${encodeURIComponent(fromCurrency)}&to=${encodeURIComponent(toCurrency)}`;
  let response: Response | null = null; // Define response outside try block

  try {
     response = await fetch(apiUrl, { cache: 'no-store' }); // Prevent caching if rates need to be fresh

    // Get raw text first in case JSON parsing fails on error messages
    const responseText = await response.text();

    if (!response.ok) {
      // Frankfurter might return specific error messages in JSON format even on failure
      let errorInfo = responseText; // Default to raw text
      try {
          const errorData = JSON.parse(responseText);
          if (errorData && errorData.message) {
              errorInfo = errorData.message;
          }
      } catch (e) {
          // Ignore parsing error, stick with raw text
      }
      console.error(
        `API request failed: ${response.status} ${response.statusText}. URL: ${apiUrl}. Info: ${errorInfo}`
      );
      return null; // Indicate error
    }

    // Attempt to parse the text as JSON
    let data: FrankfurterApiResponse;
    try {
        data = JSON.parse(responseText);
    } catch (parseError) {
        console.error("Failed to parse API response as JSON. URL:", apiUrl);
        console.error("API Raw Response Body:", responseText);
        console.error("Parsing Error:", parseError);
        return null;
    }


    // Check if data itself is null or empty, which shouldn't happen on success
    if (!data || Object.keys(data).length === 0) {
        console.error("API response was successful but returned empty or null data. URL:", apiUrl, "Parsed Data:", data);
        return null;
    }

    // Detailed checks for expected frankfurter.app success structure
    if (!data.rates) {
        console.error("API response missing 'rates' object. URL:", apiUrl, "Response:", data);
        return null;
    }
     if (typeof data.rates !== 'object' || data.rates === null) {
        console.error("API response 'rates' is not a valid object. URL:", apiUrl, "Response:", data);
        return null;
    }
    if (!(toCurrency in data.rates)) {
        console.error(`API response missing target currency '${toCurrency}' in 'rates'. URL:`, apiUrl, "Response:", data);
        return null;
    }
    if (!data.date) {
        console.warn("API response missing 'date'. Using current date as fallback. URL:", apiUrl, "Response:", data);
        // Provide a fallback date, but ideally the API should return it
        data.date = new Date().toISOString().split('T')[0];
    }


    // Use the date provided by the API as the last updated date
    const lastUpdatedDate = data.date; // e.g., "2024-07-26"

    return {
      rate: data.rates[toCurrency],
      lastUpdated: lastUpdatedDate, // Return the date string from the API
    };
  } catch (error) {
     // Log URL and response status if available
     const status = response ? response.status : 'N/A';
     const statusText = response ? response.statusText : 'N/A';
     console.error(`Network or other error fetching exchange rate from ${apiUrl}. Status: ${status} ${statusText}`);
     if (error instanceof Error) {
        console.error("Error Details:", error.message, error.stack);
     } else {
        console.error("An unknown error occurred:", error);
     }
    return null; // Indicate error
  }
}
