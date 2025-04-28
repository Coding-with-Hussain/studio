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
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("EUR");
  const [exchangeRateInfo, setExchangeRateInfo] = useState<ExchangeRate | null>(null);
  const [convertedAmount, setConvertedAmount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty input or positive numbers (including decimals)
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
       // Ensure only one decimal point
       if (value.split('.').length > 2) return;
       setAmount(value);
       setError(null); // Clear error on valid input
    } else if (parseFloat(value) < 0) {
      setError("Amount cannot be negative.");
    }
  };

  const fetchRate = useCallback(async () => {
    if (!fromCurrency || !toCurrency || !amount || parseFloat(amount) < 0) {
        // Don't fetch if input is invalid or currencies are not set
        setConvertedAmount(null); // Clear converted amount
        setExchangeRateInfo(null); // Clear rate info
        if (parseFloat(amount) < 0 && !error) {
            setError("Amount cannot be negative.");
        } else if (!amount && !error) {
            setError("Please enter an amount.");
        }
        return;
    }

    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      const rateInfo = await getExchangeRate(fromCurrency, toCurrency);
      setExchangeRateInfo(rateInfo);

      if (rateInfo && amount) {
        const numericAmount = parseFloat(amount);
        if (!isNaN(numericAmount)) {
            const result = numericAmount * rateInfo.rate;
            // Format to a reasonable number of decimal places, e.g., 4
            setConvertedAmount(result.toFixed(4));
        } else {
             setConvertedAmount(null); // Handle case where amount is '.' or similar invalid float
        }

      } else {
         setConvertedAmount(null);
         if (!rateInfo) {
            setError("Failed to fetch exchange rate. Please try again later.");
         }
      }
    } catch (err) {
      console.error("Failed to fetch exchange rate:", err);
      setError("Failed to fetch exchange rate. Please try again later.");
      setConvertedAmount(null);
      setExchangeRateInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [fromCurrency, toCurrency, amount, error]); // Add error dependency

  useEffect(() => {
    // Fetch rate initially and whenever currencies or amount change
    fetchRate();
  }, [fetchRate]); // Dependency array now only includes fetchRate


  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    // Amount remains the same, conversion will be recalculated by useEffect
  };

  const formattedLastUpdated = useMemo(() => {
    if (!exchangeRateInfo?.lastUpdated) return null;
    try {
        const date = parseISO(exchangeRateInfo.lastUpdated);
        return format(date, "PPP p"); // e.g., Jun 21, 2024 10:30:00 AM
    } catch (e) {
        console.error("Error parsing date:", e);
        return "Invalid date"; // Fallback
    }
  }, [exchangeRateInfo?.lastUpdated]);


  return (
    <Card className="w-full max-w-md mx-auto shadow-lg rounded-xl overflow-hidden">
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
            className={`text-base ${error && amount && parseFloat(amount) < 0 ? 'border-destructive ring-destructive focus-visible:ring-destructive' : ''}`}
            aria-invalid={!!error}
            aria-describedby={error ? "amount-error" : undefined}
          />
          {error && <p id="amount-error" className="text-sm text-destructive mt-1">{error}</p>}
        </div>

        <div className="flex items-center justify-between space-x-4">
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
            className="mt-6 text-primary hover:bg-primary/10 rounded-full"
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

        <div className="text-center pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Fetching latest rate...</span>
            </div>
          ) : convertedAmount !== null ? (
            <div className="space-y-1">
               <p className="text-sm text-muted-foreground">
                 {amount || 0} {fromCurrency} =
               </p>
               <p className="text-3xl font-bold text-primary">
                 {convertedAmount} {toCurrency}
               </p>

            </div>
          ) : !error ? (
             <p className="text-muted-foreground">Enter an amount to convert.</p>
          ): null}
        </div>

      </CardContent>
       {formattedLastUpdated && !isLoading && !error && (
         <CardFooter className="bg-secondary p-3 text-center justify-center">
             <p className="text-xs text-muted-foreground">
                 Exchange rate updated: {formattedLastUpdated}
             </p>
         </CardFooter>
       )}
    </Card>
  );
};

export default CurrencyConverter;
