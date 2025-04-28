import CurrencyConverter from "@/components/currency-converter";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-secondary relative">
       <div className="absolute top-4 right-4">
         <ThemeToggle />
       </div>
        <CurrencyConverter />
    </main>
  );
}
