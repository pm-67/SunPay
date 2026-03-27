"use client";

import { useState } from "react";
import { Zap, Loader2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaymentSectionProps {
  onPayment: (amount: number) => Promise<void>;
  isWalletConnected: boolean;
  walletBalance: number | null;
}

type TransactionStatus = "idle" | "pending" | "success" | "failed";

export function PaymentSection({ onPayment, isWalletConnected, walletBalance }: PaymentSectionProps) {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<TransactionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const quickAmounts = [1, 5, 10];

  const parsedAmount = parseFloat(amount);
  const hasInsufficientBalance = !isNaN(parsedAmount) && walletBalance !== null && parsedAmount > walletBalance;

  const handlePayment = async () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) return;

    if (hasInsufficientBalance) {
      setErrorMessage("Insufficient balance");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setStatus("pending");
    setErrorMessage(null);
    try {
      await onPayment(value);
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setAmount("");
      }, 3000);
    } catch (error) {
      setStatus("failed");
      setErrorMessage(error instanceof Error ? error.message : "Payment failed");
      setTimeout(() => {
        setStatus("idle");
        setErrorMessage(null);
      }, 3000);
    }
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Add Energy</h2>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            Amount (XLM)
          </label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="h-14 text-lg font-semibold"
            disabled={status === "pending"}
          />
        </div>

        <div className="flex gap-2">
          {quickAmounts.map((value) => (
            <button
              key={value}
              onClick={() => handleQuickAmount(value)}
              disabled={status === "pending"}
              className={cn(
                "flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all duration-200",
                amount === value.toString()
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              {value} XLM
            </button>
          ))}
        </div>

        <Button
          onClick={handlePayment}
          disabled={!isWalletConnected || status === "pending" || !amount || hasInsufficientBalance}
          className={cn(
            "h-14 w-full gap-2 text-lg font-semibold transition-all duration-300",
            status === "success" && "bg-primary hover:bg-primary",
            status === "failed" && "bg-destructive hover:bg-destructive",
            hasInsufficientBalance && "bg-destructive/50 hover:bg-destructive/50"
          )}
        >
          {status === "pending" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : status === "success" ? (
            <>
              <Check className="h-5 w-5" />
              Payment Successful!
            </>
          ) : status === "failed" ? (
            <>
              <X className="h-5 w-5" />
              Payment Failed
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              Pay & Unlock Energy
            </>
          )}
        </Button>

        {!isWalletConnected && (
          <p className="text-center text-sm text-muted-foreground">
            Connect your wallet to make a payment
          </p>
        )}
        
        {hasInsufficientBalance && (
          <p className="text-center text-sm text-destructive">
            Insufficient balance. You have {walletBalance?.toFixed(2)} XLM.
          </p>
        )}
        
        {errorMessage && (
          <p className="text-center text-sm text-destructive">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
