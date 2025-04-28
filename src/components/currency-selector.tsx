"use client";

import type { FC } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Currency } from "@/lib/currencies";

interface CurrencySelectorProps {
  currencies: Currency[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  'aria-label'?: string;
}

const CurrencySelector: FC<CurrencySelectorProps> = ({
  currencies,
  value,
  onChange,
  placeholder = "Select currency",
  id,
  'aria-label': ariaLabel,
}) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full text-base md:text-sm" id={id} aria-label={ariaLabel}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <ScrollArea className="h-[200px]">
          {currencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <span className="font-medium">{currency.code}</span> - {currency.name}
            </SelectItem>
          ))}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
};

export default CurrencySelector;
