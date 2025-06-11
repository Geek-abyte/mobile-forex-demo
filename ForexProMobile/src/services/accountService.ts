interface AccountBalance {
  currency: string;
  available: number;
  locked: number;
  total: number;
}

interface AccountSummary {
  balance: number;
  equity: number;
  freeMargin: number;
  todayProfit: number;
  totalProfit: number;
  openPositions: number;
}

interface RecentTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'trade';
  amount: number;
  currency: string;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
}

class AccountService {
  private balances: AccountBalance[] = [
    {
      currency: 'USD',
      available: 45250.50,
      locked: 4749.50,
      total: 50000.00, // Main account balance
    },
    {
      currency: 'EUR',
      available: 450.25,
      locked: 49.75,
      total: 500.00,
    },
    {
      currency: 'GBP',
      available: 195.80,
      locked: 4.20,
      total: 200.00,
    },
  ];

  private accountSummary: AccountSummary = {
    balance: 50000, // This should match the USD total above
    equity: 52150,
    freeMargin: 48200,
    todayProfit: 1250,
    totalProfit: 2150,
    openPositions: 3,
  };

  private recentTransactions: RecentTransaction[] = [
    {
      id: '1',
      type: 'deposit',
      amount: 1000,
      currency: 'USD',
      timestamp: Date.now() - 3600000,
      status: 'completed',
    },
    {
      id: '2',
      type: 'trade',
      amount: -150.50,
      currency: 'USD',
      timestamp: Date.now() - 7200000,
      status: 'completed',
    },
    {
      id: '3',
      type: 'withdrawal',
      amount: -500,
      currency: 'USD',
      timestamp: Date.now() - 10800000,
      status: 'pending',
    },
  ];

  private profitUpdateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startProfitSimulation();
  }

  private startProfitSimulation(): void {
    // Simulate realistic profit/loss updates
    this.profitUpdateInterval = setInterval(() => {
      const change = (Math.random() - 0.5) * 100; // -$50 to +$50 random change
      this.accountSummary.todayProfit += change;
      this.accountSummary.balance = 50000 + this.accountSummary.todayProfit; // Base balance + today's P&L
      this.accountSummary.equity = this.accountSummary.balance + (Math.random() * 200 - 100); // Slight variation for equity
      
      // Update USD balance to match
      const usdBalance = this.balances.find(b => b.currency === 'USD');
      if (usdBalance) {
        usdBalance.total = this.accountSummary.balance;
        usdBalance.available = usdBalance.total - usdBalance.locked;
      }
    }, 10000); // Update every 10 seconds
  }

  getAccountSummary(): AccountSummary {
    return { ...this.accountSummary };
  }

  getBalances(): AccountBalance[] {
    return [...this.balances];
  }

  getRecentTransactions(): RecentTransaction[] {
    return [...this.recentTransactions];
  }

  getTotalPortfolioValue(): number {
    // Calculate total portfolio value in USD equivalent
    // For now, treating all currencies as their USD equivalent (simplified)
    return this.balances.reduce((total, balance) => {
      if (balance.currency === 'USD') {
        return total + balance.total;
      } else if (balance.currency === 'EUR') {
        return total + balance.total * 1.08; // Mock EUR/USD rate
      } else if (balance.currency === 'GBP') {
        return total + balance.total * 1.27; // Mock GBP/USD rate
      }
      return total + balance.total; // Default 1:1 for other currencies
    }, 0);
  }

  updateBalance(currency: string, amount: number, type: 'deposit' | 'withdrawal'): void {
    const balance = this.balances.find(b => b.currency === currency);
    if (balance) {
      if (type === 'deposit') {
        balance.available += amount;
        balance.total += amount;
      } else {
        balance.available -= amount;
        balance.total -= amount;
      }

      // If it's USD, update account summary
      if (currency === 'USD') {
        this.accountSummary.balance = balance.total;
      }
    }

    // Add transaction record
    const transaction: RecentTransaction = {
      id: Date.now().toString(),
      type,
      amount: type === 'withdrawal' ? -amount : amount,
      currency,
      timestamp: Date.now(),
      status: 'completed',
    };

    this.recentTransactions.unshift(transaction);
    // Keep only last 10 transactions
    this.recentTransactions = this.recentTransactions.slice(0, 10);
  }

  dispose(): void {
    if (this.profitUpdateInterval) {
      clearInterval(this.profitUpdateInterval);
      this.profitUpdateInterval = null;
    }
  }
}

export const accountService = new AccountService();
export type { AccountBalance, AccountSummary, RecentTransaction };
