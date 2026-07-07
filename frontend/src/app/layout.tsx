import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayStream | Stellar Soroban Token Vesting Protocol",
  description: "Immersive real-time linear token vesting streams on the Stellar blockchain, powered by Soroban smart contracts. Direct Freighter wallet integration, automated linear withdrawals, and telemetry tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
