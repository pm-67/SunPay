"use client";

import { useState, useCallback, useEffect } from "react";

export interface StellarPayment {
  id: string;
  type: string;
  amount: number;
  asset: string;
  from: string;
  to: string;
  timestamp: string;
  transactionHash: string;
  isIncoming: boolean;
}

export interface StellarAsset {
  assetType: string;
  assetCode: string;
  assetIssuer: string;
  balance: number;
}

export interface AccountDetails {
  accountId: string;
  sequence: string;
  subentryCount: number;
  inflationDestination: string | null;
  homeDomain: string | null;
  lastModifiedLedger: number;
  thresholds: {
    lowThreshold: number;
    medThreshold: number;
    highThreshold: number;
  };
  signers: Array<{
    key: string;
    weight: number;
    type: string;
  }>;
}

interface FreighterState {
  isInstalled: boolean;
  isConnected: boolean;
  address: string | null;
  balance: number | null;
  network: string | null;
  isLoading: boolean;
  error: string | null;
  payments: StellarPayment[];
  assets: StellarAsset[];
  accountDetails: AccountDetails | null;
  isLoadingPayments: boolean;
  isLoadingAssets: boolean;
}

interface FreighterAPI {
  isConnected: () => Promise<{ isConnected: boolean }>;
  requestAccess: () => Promise<{ address?: string; error?: string }>;
  getAddress: () => Promise<{ address?: string; error?: string }>;
  getNetwork: () => Promise<{ network?: string; error?: string }>;
}

declare global {
  interface Window {
    freighterApi?: FreighterAPI;
  }
}

const HORIZON_MAINNET = "https://horizon.stellar.org";
const HORIZON_TESTNET = "https://horizon-testnet.stellar.org";

function getHorizonUrl(network: string | null): string {
  return network === "TESTNET" ? HORIZON_TESTNET : HORIZON_MAINNET;
}

interface HorizonAccountResponse {
  id: string;
  account_id: string;
  sequence: string;
  subentry_count: number;
  inflation_destination?: string;
  home_domain?: string;
  last_modified_ledger: number;
  thresholds: {
    low_threshold: number;
    med_threshold: number;
    high_threshold: number;
  };
  signers: Array<{
    key: string;
    weight: number;
    type: string;
  }>;
  balances: Array<{
    asset_type: string;
    asset_code?: string;
    asset_issuer?: string;
    balance: string;
  }>;
}

interface HorizonPaymentResponse {
  _embedded: {
    records: Array<{
      id: string;
      type: string;
      amount?: string;
      asset_type?: string;
      asset_code?: string;
      from?: string;
      to?: string;
      source_account?: string;
      created_at: string;
      transaction_hash: string;
      starting_balance?: string;
    }>;
  };
}

async function fetchAccountData(address: string, network: string | null): Promise<{
  balance: number;
  assets: StellarAsset[];
  accountDetails: AccountDetails | null;
}> {
  const horizonUrl = getHorizonUrl(network);
  try {
    const response = await fetch(`${horizonUrl}/accounts/${address}`);
    if (!response.ok) {
      if (response.status === 404) {
        return { balance: 0, assets: [], accountDetails: null };
      }
      throw new Error("Failed to fetch account data");
    }
    
    const data: HorizonAccountResponse = await response.json();
    
    // Parse balances
    const assets: StellarAsset[] = data.balances.map((b) => ({
      assetType: b.asset_type,
      assetCode: b.asset_type === "native" ? "XLM" : (b.asset_code || "Unknown"),
      assetIssuer: b.asset_issuer || "",
      balance: parseFloat(b.balance),
    }));
    
    const nativeBalance = assets.find((a) => a.assetType === "native")?.balance || 0;
    
    // Parse account details
    const accountDetails: AccountDetails = {
      accountId: data.account_id,
      sequence: data.sequence,
      subentryCount: data.subentry_count,
      inflationDestination: data.inflation_destination || null,
      homeDomain: data.home_domain || null,
      lastModifiedLedger: data.last_modified_ledger,
      thresholds: {
        lowThreshold: data.thresholds.low_threshold,
        medThreshold: data.thresholds.med_threshold,
        highThreshold: data.thresholds.high_threshold,
      },
      signers: data.signers.map((s) => ({
        key: s.key,
        weight: s.weight,
        type: s.type,
      })),
    };
    
    return { balance: nativeBalance, assets, accountDetails };
  } catch (error) {
    console.error("Error fetching account data:", error);
    return { balance: 0, assets: [], accountDetails: null };
  }
}

async function fetchPayments(address: string, network: string | null, limit = 10): Promise<StellarPayment[]> {
  const horizonUrl = getHorizonUrl(network);
  try {
    const response = await fetch(
      `${horizonUrl}/accounts/${address}/payments?order=desc&limit=${limit}`
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error("Failed to fetch payments");
    }
    
    const data: HorizonPaymentResponse = await response.json();
    
    const payments: StellarPayment[] = data._embedded.records
      .filter((record) => record.type === "payment" || record.type === "create_account")
      .map((record) => {
        const isIncoming = record.to === address || record.type === "create_account";
        let amount = 0;
        
        if (record.type === "payment" && record.amount) {
          amount = parseFloat(record.amount);
        } else if (record.type === "create_account" && record.starting_balance) {
          amount = parseFloat(record.starting_balance);
        }
        
        return {
          id: record.id,
          type: record.type,
          amount,
          asset: record.asset_type === "native" || record.type === "create_account" 
            ? "XLM" 
            : (record.asset_code || "Unknown"),
          from: record.from || record.source_account || "",
          to: record.to || address,
          timestamp: record.created_at,
          transactionHash: record.transaction_hash,
          isIncoming,
        };
      });
    
    return payments;
  } catch (error) {
    console.error("Error fetching payments:", error);
    return [];
  }
}

export function useFreighter() {
  const [state, setState] = useState<FreighterState>({
    isInstalled: false,
    isConnected: false,
    address: null,
    balance: null,
    network: null,
    isLoading: true,
    error: null,
    payments: [],
    assets: [],
    accountDetails: null,
    isLoadingPayments: false,
    isLoadingAssets: false,
  });

  // Dynamically import the freighter-api module
  const getFreighterApi = useCallback(async () => {
    try {
      const freighterApi = await import("@stellar/freighter-api");
      return freighterApi;
    } catch {
      return null;
    }
  }, []);

  // Check if Freighter is installed and connected on mount
  useEffect(() => {
    const checkFreighter = async () => {
      const api = await getFreighterApi();
      
      if (!api) {
        setState((prev) => ({
          ...prev,
          isInstalled: false,
          isLoading: false,
        }));
        return;
      }

      try {
        const connectedResult = await api.isConnected();
        const isInstalled = connectedResult.isConnected;

        if (!isInstalled) {
          setState((prev) => ({
            ...prev,
            isInstalled: false,
            isLoading: false,
          }));
          return;
        }

        // Check if we already have access
        const addressResult = await api.getAddress();
        
        if (addressResult.address) {
          const networkResult = await api.getNetwork();
          const networkValue = networkResult.network || "PUBLIC";
          
          // Fetch all account data
          const { balance, assets, accountDetails } = await fetchAccountData(
            addressResult.address, 
            networkValue
          );
          const payments = await fetchPayments(addressResult.address, networkValue);
          
          setState({
            isInstalled: true,
            isConnected: true,
            address: addressResult.address,
            balance,
            network: networkValue,
            isLoading: false,
            error: null,
            payments,
            assets,
            accountDetails,
            isLoadingPayments: false,
            isLoadingAssets: false,
          });
        } else {
          setState((prev) => ({
            ...prev,
            isInstalled: true,
            isConnected: false,
            isLoading: false,
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isInstalled: false,
          isLoading: false,
          error: error instanceof Error ? error.message : "Failed to check Freighter",
        }));
      }
    };

    // Small delay to ensure extension is loaded
    const timeout = setTimeout(checkFreighter, 100);
    return () => clearTimeout(timeout);
  }, [getFreighterApi]);

  // Connect wallet
  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const api = await getFreighterApi();

    if (!api) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Freighter wallet not detected. Please install the Freighter browser extension.",
      }));
      return { success: false, error: "Freighter not installed" };
    }

    try {
      // Check if extension is connected
      const connectedResult = await api.isConnected();
      
      if (!connectedResult.isConnected) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Freighter wallet not detected. Please install the Freighter browser extension.",
        }));
        return { success: false, error: "Freighter not installed" };
      }

      // Request access to the wallet
      const accessResult = await api.requestAccess();

      if (accessResult.error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: accessResult.error,
        }));
        return { success: false, error: accessResult.error };
      }

      if (accessResult.address) {
        const networkResult = await api.getNetwork();
        const networkValue = networkResult.network || "PUBLIC";
        
        // Fetch all account data
        const { balance, assets, accountDetails } = await fetchAccountData(
          accessResult.address,
          networkValue
        );
        const payments = await fetchPayments(accessResult.address, networkValue);

        setState({
          isInstalled: true,
          isConnected: true,
          address: accessResult.address,
          balance,
          network: networkValue,
          isLoading: false,
          error: null,
          payments,
          assets,
          accountDetails,
          isLoadingPayments: false,
          isLoadingAssets: false,
        });

        return { success: true, address: accessResult.address };
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to get wallet address",
      }));
      return { success: false, error: "No address returned" };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, [getFreighterApi]);

  // Refresh all account data
  const refreshBalance = useCallback(async () => {
    if (!state.address) return;
    
    const { balance, assets, accountDetails } = await fetchAccountData(state.address, state.network);
    setState((prev) => ({ ...prev, balance, assets, accountDetails }));
  }, [state.address, state.network]);

  // Refresh payments
  const refreshPayments = useCallback(async () => {
    if (!state.address) return;
    
    setState((prev) => ({ ...prev, isLoadingPayments: true }));
    const payments = await fetchPayments(state.address, state.network);
    setState((prev) => ({ ...prev, payments, isLoadingPayments: false }));
  }, [state.address, state.network]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    if (!state.address) return;
    
    setState((prev) => ({ ...prev, isLoadingPayments: true, isLoadingAssets: true }));
    
    const [accountData, payments] = await Promise.all([
      fetchAccountData(state.address, state.network),
      fetchPayments(state.address, state.network),
    ]);
    
    setState((prev) => ({
      ...prev,
      balance: accountData.balance,
      assets: accountData.assets,
      accountDetails: accountData.accountDetails,
      payments,
      isLoadingPayments: false,
      isLoadingAssets: false,
    }));
  }, [state.address, state.network]);

  // Disconnect (clear local state - Freighter doesn't have a disconnect method)
  const disconnect = useCallback(() => {
    setState({
      isInstalled: true,
      isConnected: false,
      address: null,
      balance: null,
      network: null,
      isLoading: false,
      error: null,
      payments: [],
      assets: [],
      accountDetails: null,
      isLoadingPayments: false,
      isLoadingAssets: false,
    });
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    refreshBalance,
    refreshPayments,
    refreshAll,
  };
}
