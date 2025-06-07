import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WalletBalance {
  currency: string;
  balance: number;
  availableBalance: number;
  lockedBalance: number;
  displayName: string;
  symbol: string;
  icon?: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'trade' | 'transfer' | 'p2p';
  currency: string;
  amount: number;
  fee: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  timestamp: string;
  txHash?: string;
  fromAddress?: string;
  toAddress?: string;
  relatedOrderId?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  routingNumber?: string;
  swiftCode?: string;
  isVerified: boolean;
  isDefault: boolean;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'bank' | 'card' | 'paypal' | 'crypto';
  name: string;
  last4?: string;
  bankName?: string;
  isVerified: boolean;
  isDefault: boolean;
  createdAt: string;
}

interface WalletState {
  balances: WalletBalance[];
  transactions: Transaction[];
  bankAccounts: BankAccount[];
  paymentMethods: PaymentMethod[];
  isLoadingBalances: boolean;
  isLoadingTransactions: boolean;
  isProcessingTransaction: boolean;
  selectedCurrency: string;
  walletError: string | null;
  hideSmallBalances: boolean;
  totalPortfolioValue: number;
  totalPnl: number;
  totalPnlPercent: number;
}

const initialState: WalletState = {
  balances: [
    {
      currency: 'USD',
      balance: 10000,
      availableBalance: 8500,
      lockedBalance: 1500,
      displayName: 'US Dollar',
      symbol: '$',
    },
    {
      currency: 'EUR',
      balance: 5000,
      availableBalance: 5000,
      lockedBalance: 0,
      displayName: 'Euro',
      symbol: '€',
    },
    {
      currency: 'GBP',
      balance: 3000,
      availableBalance: 2800,
      lockedBalance: 200,
      displayName: 'British Pound',
      symbol: '£',
    },
  ],
  transactions: [],
  bankAccounts: [],
  paymentMethods: [],
  isLoadingBalances: false,
  isLoadingTransactions: false,
  isProcessingTransaction: false,
  selectedCurrency: 'USD',
  walletError: null,
  hideSmallBalances: false,
  totalPortfolioValue: 18000,
  totalPnl: 1200,
  totalPnlPercent: 7.14,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setBalances: (state, action: PayloadAction<WalletBalance[]>) => {
      state.balances = action.payload;
    },
    updateBalance: (state, action: PayloadAction<WalletBalance>) => {
      const index = state.balances.findIndex(balance => balance.currency === action.payload.currency);
      if (index !== -1) {
        state.balances[index] = action.payload;
      } else {
        state.balances.push(action.payload);
      }
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.transactions.findIndex(tx => tx.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    addBankAccount: (state, action: PayloadAction<BankAccount>) => {
      state.bankAccounts.push(action.payload);
    },
    updateBankAccount: (state, action: PayloadAction<BankAccount>) => {
      const index = state.bankAccounts.findIndex(account => account.id === action.payload.id);
      if (index !== -1) {
        state.bankAccounts[index] = action.payload;
      }
    },
    removeBankAccount: (state, action: PayloadAction<string>) => {
      state.bankAccounts = state.bankAccounts.filter(account => account.id !== action.payload);
    },
    setDefaultBankAccount: (state, action: PayloadAction<string>) => {
      state.bankAccounts.forEach(account => {
        account.isDefault = account.id === action.payload;
      });
    },
    addPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.paymentMethods.push(action.payload);
    },
    updatePaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      const index = state.paymentMethods.findIndex(method => method.id === action.payload.id);
      if (index !== -1) {
        state.paymentMethods[index] = action.payload;
      }
    },
    removePaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethods = state.paymentMethods.filter(method => method.id !== action.payload);
    },
    setDefaultPaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethods.forEach(method => {
        method.isDefault = method.id === action.payload;
      });
    },
    setSelectedCurrency: (state, action: PayloadAction<string>) => {
      state.selectedCurrency = action.payload;
    },
    setLoadingBalances: (state, action: PayloadAction<boolean>) => {
      state.isLoadingBalances = action.payload;
    },
    setLoadingTransactions: (state, action: PayloadAction<boolean>) => {
      state.isLoadingTransactions = action.payload;
    },
    setProcessingTransaction: (state, action: PayloadAction<boolean>) => {
      state.isProcessingTransaction = action.payload;
    },
    setWalletError: (state, action: PayloadAction<string | null>) => {
      state.walletError = action.payload;
    },
    setHideSmallBalances: (state, action: PayloadAction<boolean>) => {
      state.hideSmallBalances = action.payload;
    },
    updatePortfolioStats: (state, action: PayloadAction<{ totalValue: number; pnl: number; pnlPercent: number }>) => {
      state.totalPortfolioValue = action.payload.totalValue;
      state.totalPnl = action.payload.pnl;
      state.totalPnlPercent = action.payload.pnlPercent;
    },
  },
});

export const {
  setBalances,
  updateBalance,
  addTransaction,
  updateTransaction,
  setTransactions,
  addBankAccount,
  updateBankAccount,
  removeBankAccount,
  setDefaultBankAccount,
  addPaymentMethod,
  updatePaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  setSelectedCurrency,
  setLoadingBalances,
  setLoadingTransactions,
  setProcessingTransaction,
  setWalletError,
  setHideSmallBalances,
  updatePortfolioStats,
} = walletSlice.actions;

export default walletSlice.reducer;
