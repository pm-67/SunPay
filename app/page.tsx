"use client";

import { useState, useCallback, useEffect } from "react";
import { Header } from "@/components/header";
import { WalletDisplay } from "@/components/wallet-display";
import { EnergyStatus } from "@/components/energy-status";
import { PaymentSection } from "@/components/payment-section";
import { DeviceControl } from "@/components/device-control";
import { TransactionHistory } from "@/components/transaction-history";
import { AssetsDisplay } from "@/components/assets-display";
import { Alerts } from "@/components/alerts";
import { useFreighter } from "@/hooks/use-freighter";

interface Alert {
  id: string;
  type: "low-balance" | "expiring" | "success";
  message: string;
}

export default function HomePage() {
  const {
    isConnected: isWalletConnected,
    isInstalled,
    isLoading: isWalletLoading,
    address: walletAddress,
    balance: walletBalance,
    network,
    error: walletError,
    payments,
    assets,
    isLoadingPayments,
    connect: connectWallet,
    disconnect: disconnectWallet,
    refreshBalance,
    refreshPayments,
    refreshAll,
  } = useFreighter();

  const [isEnergyOn, setIsEnergyOn] = useState(true);
  const [remainingTime, setRemainingTime] = useState("2h 15m");
  const [usagePercent, setUsagePercent] = useState(35);
  const [isDeviceLocked, setIsDeviceLocked] = useState(false);
  const [lastPayment, setLastPayment] = useState("Today, 2:30 PM");

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      type: "expiring",
      message: "Energy expires in 2 hours",
    },
  ]);

  const handleConnectWallet = useCallback(async () => {
    const result = await connectWallet();
    if (result.success) {
      setAlerts((prev) => [
        {
          id: Date.now().toString(),
          type: "success",
          message: "Freighter wallet connected successfully!",
        },
        ...prev,
      ]);
    }
  }, [connectWallet]);

  const handleDisconnectWallet = useCallback(() => {
    disconnectWallet();
    setAlerts((prev) => [
      {
        id: Date.now().toString(),
        type: "success",
        message: "Wallet disconnected",
      },
      ...prev,
    ]);
  }, [disconnectWallet]);

  const handlePayment = useCallback(async (amount: number) => {
    // Simulate payment processing (in a real app, this would sign a Stellar transaction)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Refresh all data from the network
    await refreshAll();

    // Update energy status
    setIsEnergyOn(true);
    setIsDeviceLocked(false);
    setUsagePercent(10);
    setRemainingTime(`${Math.floor(amount * 2)}h ${Math.floor(Math.random() * 60)}m`);
    setLastPayment("Just now");

    // Add success alert
    setAlerts((prev) => [
      {
        id: Date.now().toString(),
        type: "success",
        message: `Payment successful – device unlocked!`,
      },
      ...prev.filter((a) => a.type !== "success").slice(0, 2),
    ]);
  }, [refreshAll]);

  const handleToggleDevice = useCallback(() => {
    if (usagePercent < 100) {
      setIsEnergyOn((prev) => !prev);
      setIsDeviceLocked((prev) => !prev);
    }
  }, [usagePercent]);

  const handleDismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header notificationCount={alerts.length} />

      <main className="mx-auto max-w-md px-4 py-6">
        <div className="space-y-4">
          {/* Alerts */}
          <Alerts alerts={alerts} onDismiss={handleDismissAlert} />

          {/* Wallet Display */}
          <WalletDisplay
            address={walletAddress}
            balance={walletBalance}
            isConnected={isWalletConnected}
            isLoading={isWalletLoading}
            isInstalled={isInstalled}
            error={walletError}
            network={network}
            onConnect={handleConnectWallet}
            onDisconnect={handleDisconnectWallet}
            onRefreshBalance={refreshBalance}
          />

          {/* Energy Status */}
          <EnergyStatus
            isOn={isEnergyOn}
            remainingTime={remainingTime}
            usagePercent={usagePercent}
          />

          {/* Payment Section */}
          <PaymentSection
            onPayment={handlePayment}
            isWalletConnected={isWalletConnected}
            walletBalance={walletBalance}
          />

          {/* Device Control */}
          <DeviceControl
            isLocked={isDeviceLocked}
            lastPayment={lastPayment}
            onToggle={handleToggleDevice}
            canToggle={isWalletConnected && usagePercent < 100}
          />

          {/* Assets Display */}
          <AssetsDisplay assets={assets} isLoading={isWalletLoading} />

          {/* Transaction History */}
          <TransactionHistory 
            payments={payments} 
            isLoading={isLoadingPayments} 
            walletAddress={walletAddress}
            onRefresh={refreshPayments}
          />
        </div>

        {/* Footer */}
        <footer className="mt-8 pb-8 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by Stellar Soroban
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            © 2026 SunPay • Clean Energy for Everyone
          </p>
        </footer>
      </main>
    </div>
  );
}
