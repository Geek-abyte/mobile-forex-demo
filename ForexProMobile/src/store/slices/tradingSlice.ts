import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ForexPair {
  id: string;
  symbol: string;
  baseSymbol: string;
  quoteSymbol: string;
  displayName: string;
  currentPrice: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  spread: number;
  isActive: boolean;
  lastUpdated: string;
}

export interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Position {
  id: string;
  symbol: string;
  type: 'long' | 'short';
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  stopLoss?: number;
  takeProfit?: number;
  openTime: string;
  status: 'open' | 'closed';
}

export interface Order {
  id: string;
  symbol: string;
  type: 'market' | 'limit' | 'stop';
  side: 'buy' | 'sell';
  amount: number;
  price?: number;
  stopPrice?: number;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  createdAt: string;
  filledAt?: string;
  filledPrice?: number;
}

export interface MarketData {
  [key: string]: CandlestickData[];
}

interface TradingState {
  forexPairs: ForexPair[];
  watchlist: string[];
  positions: Position[];
  orders: Order[];
  marketData: MarketData;
  selectedPair: ForexPair | null;
  selectedTimeframe: string;
  isLoadingPairs: boolean;
  isLoadingChart: boolean;
  tradingError: string | null;
  autoRefresh: boolean;
  chartFullscreen: boolean;
}

const initialState: TradingState = {
  forexPairs: [],
  watchlist: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'],
  positions: [],
  orders: [],
  marketData: {},
  selectedPair: null,
  selectedTimeframe: '1h',
  isLoadingPairs: false,
  isLoadingChart: false,
  tradingError: null,
  autoRefresh: true,
  chartFullscreen: false,
};

const tradingSlice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    setForexPairs: (state, action: PayloadAction<ForexPair[]>) => {
      state.forexPairs = action.payload;
    },
    updateForexPair: (state, action: PayloadAction<ForexPair>) => {
      const index = state.forexPairs.findIndex(pair => pair.id === action.payload.id);
      if (index !== -1) {
        state.forexPairs[index] = action.payload;
      }
    },
    setSelectedPair: (state, action: PayloadAction<ForexPair | null>) => {
      state.selectedPair = action.payload;
    },
    setSelectedTimeframe: (state, action: PayloadAction<string>) => {
      state.selectedTimeframe = action.payload;
    },
    addToWatchlist: (state, action: PayloadAction<string>) => {
      if (!state.watchlist.includes(action.payload)) {
        state.watchlist.push(action.payload);
      }
    },
    removeFromWatchlist: (state, action: PayloadAction<string>) => {
      state.watchlist = state.watchlist.filter(symbol => symbol !== action.payload);
    },
    setMarketData: (state, action: PayloadAction<{ symbol: string; data: CandlestickData[] }>) => {
      state.marketData[action.payload.symbol] = action.payload.data;
    },
    addPosition: (state, action: PayloadAction<Position>) => {
      state.positions.push(action.payload);
    },
    updatePosition: (state, action: PayloadAction<Position>) => {
      const index = state.positions.findIndex(pos => pos.id === action.payload.id);
      if (index !== -1) {
        state.positions[index] = action.payload;
      }
    },
    closePosition: (state, action: PayloadAction<string>) => {
      const position = state.positions.find(pos => pos.id === action.payload);
      if (position) {
        position.status = 'closed';
      }
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.push(action.payload);
    },
    updateOrder: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex(order => order.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    cancelOrder: (state, action: PayloadAction<string>) => {
      const order = state.orders.find(order => order.id === action.payload);
      if (order) {
        order.status = 'cancelled';
      }
    },
    setLoadingPairs: (state, action: PayloadAction<boolean>) => {
      state.isLoadingPairs = action.payload;
    },
    setLoadingChart: (state, action: PayloadAction<boolean>) => {
      state.isLoadingChart = action.payload;
    },
    setTradingError: (state, action: PayloadAction<string | null>) => {
      state.tradingError = action.payload;
    },
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.autoRefresh = action.payload;
    },
    setChartFullscreen: (state, action: PayloadAction<boolean>) => {
      state.chartFullscreen = action.payload;
    },
  },
});

export const {
  setForexPairs,
  updateForexPair,
  setSelectedPair,
  setSelectedTimeframe,
  addToWatchlist,
  removeFromWatchlist,
  setMarketData,
  addPosition,
  updatePosition,
  closePosition,
  addOrder,
  updateOrder,
  cancelOrder,
  setLoadingPairs,
  setLoadingChart,
  setTradingError,
  setAutoRefresh,
  setChartFullscreen,
} = tradingSlice.actions;

export default tradingSlice.reducer;
