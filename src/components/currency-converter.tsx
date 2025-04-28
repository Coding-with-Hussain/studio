
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import CurrencySelector from "@/components/currency-selector";
import { currencies, type Currency } from "@/lib/currencies";
import { getExchangeRate, type ExchangeRate } from "@/services/exchange-rate";
import { Loader2, ArrowRightLeft } from "lucide-react";
import { format, parseISO } from 'date-fns';

const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState<string>("USD"); // Default From: USD
  const [toCurrency, setToCurrency] = useState<string>("INR");   // Default To: INR (Changed from EUR)
  const [exchangeRateInfo, setExchangeRateInfo] = useState<ExchangeRate | null>(null);
  const [convertedAmount, setConvertedAmount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty input or positive numbers (including decimals)
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
       // Ensure only one decimal point
       if (value.split('.').length > 2) return;
       setAmount(value);
       // Clear error related to negativity or emptiness when input becomes valid or potentially valid
       if (error === "Amount cannot be negative." || error === "Please enter an amount.") {
         setError(null);
       }
    } else if (parseFloat(value) < 0) {
      setAmount(value); // Still set the amount to show the invalid input
      setError("Amount cannot be negative.");
    }
     // If input becomes empty after being invalid, clear negativity error
     if (value === "" && error === "Amount cannot be negative.") {
        setError(null);
    }
  };

  const fetchRate = useCallback(async () => {
    // Reset state before fetch/validation
    setIsLoading(true);
    setError(null);
    setConvertedAmount(null);
    setLastUpdatedTime(null); // Clear last updated time initially

    const numericAmount = parseFloat(amount);

    // Validation checks
    if (!fromCurrency || !toCurrency) {
       setError("Please select both currencies.");
       setIsLoading(false);
       return;
    }
    if (amount === "") {
        // setError("Please enter an amount."); // Optional: Show error for empty input, or just show no result
        setIsLoading(false);
        return; // Don't fetch if amount is empty
    }
     if (isNaN(numericAmount)) {
        setError("Invalid amount entered."); // Handle cases like "." or "-"
        setIsLoading(false);
        return;
    }
    if (numericAmount < 0) {
      setError("Amount cannot be negative.");
      setIsLoading(false);
      return;
    }


    try {
      const rateInfo = await getExchangeRate(fromCurrency, toCurrency);

      if (rateInfo) {
        setExchangeRateInfo(rateInfo); // Keep the raw rate info if needed elsewhere
        const result = numericAmount * rateInfo.rate;
        // Format to a reasonable number of decimal places, e.g., 4
        setConvertedAmount(result.toFixed(4));
        setLastUpdatedTime(rateInfo.lastUpdated); // Set the last updated time from API response
      } else {
         setError("Failed to fetch exchange rate. Please try again later.");
      }
    } catch (err) {
      console.error("Failed to fetch exchange rate:", err);
      setError("Failed to fetch exchange rate. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [fromCurrency, toCurrency, amount]); // Only depend on inputs needed for fetching

  useEffect(() => {
    // Fetch rate initially and whenever relevant inputs change
     // Debounce or delay fetching slightly to avoid rapid calls while typing
    const handler = setTimeout(() => {
        // Fetch only if both currencies are selected
        if (fromCurrency && toCurrency) {
           fetchRate();
        } else {
            // If currencies are not selected yet, reset relevant state
            setIsLoading(false);
            setError(null);
            setConvertedAmount(null);
            setLastUpdatedTime(null);
        }
    }, 300); // Adjust delay as needed (e.g., 300ms)

    return () => {
        clearTimeout(handler); // Cleanup timeout on unmount or dependency change
    };
  // Trigger fetchRate directly when currencies change, but debounce for amount
  }, [fromCurrency, toCurrency, amount, fetchRate]);


  const swapCurrencies = () => {
    const tempAmount = amount; // Store current amount if needed, though swapping usually recalculates
    const tempFrom = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(tempFrom);
    // Optional: Swap the amounts if you want the *result* to become the new input
    // if (convertedAmount) {
    //   setAmount(convertedAmount);
    // }
    // Recalculation will be triggered by the useEffect watching currency changes
  };

  const formattedLastUpdated = useMemo(() => {
    if (!lastUpdatedTime) return null;
    try {
        // The date string from the API might just be 'YYYY-MM-DD'.
        // Append a default time to make it a full ISO string parseable by date-fns.
        const isoString = lastUpdatedTime.includes('T') ? lastUpdatedTime : `${lastUpdatedTime}T00:00:00Z`;
        const date = parseISO(isoString);
        return format(date, "PPP p"); // e.g., Jun 21, 2024 12:00:00 AM (or actual time if provided)
    } catch (e) {
        console.error("Error parsing date:", e, "Input was:", lastUpdatedTime);
        return "Invalid date"; // Fallback
    }
  }, [lastUpdatedTime]);


  return (
    <Card className="w-full max-w-md mx-auto shadow-lg rounded-xl overflow-hidden transition-all duration-300 ease-in-out">
      <CardHeader className="bg-primary text-primary-foreground p-6">
        <CardTitle className="text-2xl font-bold text-center">RateShift Currency Converter</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6 bg-background">
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-medium">Amount</Label>
          <Input
            id="amount"
            type="text" // Use text to allow gradual decimal input
            inputMode="decimal" // Hint for mobile keyboards
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter amount"
            className={`text-base transition-colors duration-200 ${error && (amount === "" || parseFloat(amount) < 0 || isNaN(parseFloat(amount))) ? 'border-destructive ring-destructive focus-visible:ring-destructive' : ''}`}
            aria-invalid={!!error}
            aria-describedby={error ? "amount-error" : undefined}
          />
          {error && <p id="amount-error" className="text-sm text-destructive mt-1 transition-opacity duration-200 ease-in-out opacity-100">{error}</p>}
           {!error && <p className="text-sm text-destructive mt-1 h-[1.25rem] opacity-0"> </p>} {/* Placeholder for spacing */}
        </div>

        <div className="flex items-end justify-between space-x-2 sm:space-x-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="from-currency" className="text-sm font-medium">From</Label>
            <CurrencySelector
              id="from-currency"
              aria-label="Select source currency"
              currencies={currencies}
              value={fromCurrency}
              onChange={setFromCurrency}
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={swapCurrencies}
            className="mb-1 text-primary hover:bg-primary/10 rounded-full transition-transform duration-200 hover:scale-110 active:scale-95"
            aria-label="Swap currencies"
          >
            <ArrowRightLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 space-y-2">
            <Label htmlFor="to-currency" className="text-sm font-medium">To</Label>
            <CurrencySelector
              id="to-currency"
               aria-label="Select target currency"
              currencies={currencies}
              value={toCurrency}
              onChange={setToCurrency}
            />
          </div>
        </div>

        <div className="text-center pt-4 min-h-[70px] flex flex-col justify-center items-center"> {/* Min height for consistent layout */}
          {isLoading ? (
            <div className="flex items-center justify-center text-muted-foreground animate-pulse">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Fetching latest rate...</span>
            </div>
          ) : convertedAmount !== null && !error ? (
             // Ensure amount is valid number > 0 before showing result
             amount && parseFloat(amount) >= 0 && !isNaN(parseFloat(amount)) ? (
                <div className="space-y-1 animate-fade-in">
                   <p className="text-sm text-muted-foreground">
                     {parseFloat(amount).toLocaleString()} {fromCurrency} =
                   </p>
                   <p className="text-3xl font-bold text-primary">
                     {convertedAmount} {toCurrency}
                   </p>
                </div>
             ) : !error ? ( // Show prompt only if no error and no valid result
                <p className="text-muted-foreground">Enter a valid amount to convert.</p>
             ): null
          ) : !error ? ( // If not loading, no result, and no specific error, prompt user
             <p className="text-muted-foreground">Enter an amount to convert.</p>
          ): null /* If there's an error, it's shown under the input */ }
        </div>

      </CardContent>
       {formattedLastUpdated && !isLoading && !error && convertedAmount !== null && (
         <CardFooter className="bg-secondary p-3 text-center justify-center border-t">
             <p className="text-xs text-muted-foreground">
                 Rate from {formattedLastUpdated}
             </p>
         </CardFooter>
       )}
        {/* Placeholder footer for consistent height when no rate is shown */}
       {(!formattedLastUpdated || isLoading || error || convertedAmount === null) && (
            <CardFooter className="bg-secondary p-3 text-center justify-center border-t h-[37px]">
                <p className="text-xs text-muted-foreground opacity-0">Placeholder</p>
            </CardFooter>
       )}
    </Card>
  );
};

export default CurrencyConverter;

