
export interface Currency {
  code: string;
  name: string;
}

// Keep the list sorted alphabetically by code for easier maintenance
export const currencies: Currency[] = [
  { code: "AUD", name: "Australian Dollar" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound Sterling" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "INR", name: "Indian Rupee" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "KRW", name: "South Korean Won" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "PKR", name: "Pakistani Rupee" }, // Added PKR
  { code: "RUB", name: "Russian Ruble" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "USD", name: "United States Dollar" },
  { code: "ZAR", name: "South African Rand" },
];
