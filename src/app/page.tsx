import CurrencyConverter from "@/components/currency-converter";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-secondary">
        <CurrencyConverter />
    </main>
  );
}
