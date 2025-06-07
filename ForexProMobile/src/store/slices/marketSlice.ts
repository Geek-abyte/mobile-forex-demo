import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MarketNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'forex' | 'economic' | 'central-bank' | 'geopolitical' | 'market-analysis';
  impact: 'low' | 'medium' | 'high';
  affectedCurrencies: string[];
  publishedAt: string;
  source: string;
  imageUrl?: string;
  isBreaking: boolean;
  tags: string[];
}

export interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  currency: string;
  impact: 'low' | 'medium' | 'high';
  actual?: number;
  forecast?: number;
  previous?: number;
  unit: string;
  scheduledAt: string;
  category: 'inflation' | 'employment' | 'gdp' | 'interest-rate' | 'trade' | 'manufacturing' | 'other';
  description: string;
}

export interface MarketAlert {
  id: string;
  type: 'price' | 'news' | 'economic' | 'technical';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  symbol?: string;
  triggeredAt: string;
  isRead: boolean;
  actionRequired: boolean;
}

export interface MarketSentiment {
  symbol: string;
  bullish: number;
  bearish: number;
  neutral: number;
  totalVotes: number;
  trend: 'up' | 'down' | 'sideways';
  lastUpdated: string;
}

export interface MarketStatistics {
  totalVolume24h: number;
  totalTrades24h: number;
  mostActiveSymbol: string;
  topGainer: {
    symbol: string;
    change: number;
  };
  topLoser: {
    symbol: string;
    change: number;
  };
  volatilityIndex: number;
  fearAndGreedIndex: number;
  lastUpdated: string;
}

interface MarketState {
  news: MarketNews[];
  economicEvents: EconomicEvent[];
  alerts: MarketAlert[];
  sentiment: { [symbol: string]: MarketSentiment };
  statistics: MarketStatistics | null;
  selectedNewsCategory: string;
  selectedCountry: string;
  selectedImpact: string;
  isLoadingNews: boolean;
  isLoadingEvents: boolean;
  isLoadingSentiment: boolean;
  marketError: string | null;
  newsRefreshTime: string | null;
  eventsRefreshTime: string | null;
  unreadAlertsCount: number;
  pushNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
}

const initialState: MarketState = {
  news: [],
  economicEvents: [],
  alerts: [],
  sentiment: {},
  statistics: null,
  selectedNewsCategory: 'all',
  selectedCountry: 'all',
  selectedImpact: 'all',
  isLoadingNews: false,
  isLoadingEvents: false,
  isLoadingSentiment: false,
  marketError: null,
  newsRefreshTime: null,
  eventsRefreshTime: null,
  unreadAlertsCount: 0,
  pushNotificationsEnabled: true,
  emailNotificationsEnabled: false,
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setNews: (state, action: PayloadAction<MarketNews[]>) => {
      state.news = action.payload;
      state.newsRefreshTime = new Date().toISOString();
    },
    addNews: (state, action: PayloadAction<MarketNews>) => {
      state.news.unshift(action.payload);
    },
    updateNews: (state, action: PayloadAction<MarketNews>) => {
      const index = state.news.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.news[index] = action.payload;
      }
    },
    setEconomicEvents: (state, action: PayloadAction<EconomicEvent[]>) => {
      state.economicEvents = action.payload;
      state.eventsRefreshTime = new Date().toISOString();
    },
    addEconomicEvent: (state, action: PayloadAction<EconomicEvent>) => {
      const existingIndex = state.economicEvents.findIndex(event => event.id === action.payload.id);
      if (existingIndex !== -1) {
        state.economicEvents[existingIndex] = action.payload;
      } else {
        state.economicEvents.push(action.payload);
        state.economicEvents.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
      }
    },
    addAlert: (state, action: PayloadAction<MarketAlert>) => {
      state.alerts.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadAlertsCount += 1;
      }
    },
    markAlertAsRead: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(alert => alert.id === action.payload);
      if (alert && !alert.isRead) {
        alert.isRead = true;
        state.unreadAlertsCount = Math.max(0, state.unreadAlertsCount - 1);
      }
    },
    markAllAlertsAsRead: (state) => {
      state.alerts.forEach(alert => {
        alert.isRead = true;
      });
      state.unreadAlertsCount = 0;
    },
    removeAlert: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(alert => alert.id === action.payload);
      if (alert && !alert.isRead) {
        state.unreadAlertsCount = Math.max(0, state.unreadAlertsCount - 1);
      }
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },
    setSentiment: (state, action: PayloadAction<{ [symbol: string]: MarketSentiment }>) => {
      state.sentiment = action.payload;
    },
    updateSentiment: (state, action: PayloadAction<MarketSentiment>) => {
      state.sentiment[action.payload.symbol] = action.payload;
    },
    setStatistics: (state, action: PayloadAction<MarketStatistics>) => {
      state.statistics = action.payload;
    },
    setSelectedNewsCategory: (state, action: PayloadAction<string>) => {
      state.selectedNewsCategory = action.payload;
    },
    setSelectedCountry: (state, action: PayloadAction<string>) => {
      state.selectedCountry = action.payload;
    },
    setSelectedImpact: (state, action: PayloadAction<string>) => {
      state.selectedImpact = action.payload;
    },
    setLoadingNews: (state, action: PayloadAction<boolean>) => {
      state.isLoadingNews = action.payload;
    },
    setLoadingEvents: (state, action: PayloadAction<boolean>) => {
      state.isLoadingEvents = action.payload;
    },
    setLoadingSentiment: (state, action: PayloadAction<boolean>) => {
      state.isLoadingSentiment = action.payload;
    },
    setMarketError: (state, action: PayloadAction<string | null>) => {
      state.marketError = action.payload;
    },
    setPushNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.pushNotificationsEnabled = action.payload;
    },
    setEmailNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.emailNotificationsEnabled = action.payload;
    },
  },
});

export const {
  setNews,
  addNews,
  updateNews,
  setEconomicEvents,
  addEconomicEvent,
  addAlert,
  markAlertAsRead,
  markAllAlertsAsRead,
  removeAlert,
  setSentiment,
  updateSentiment,
  setStatistics,
  setSelectedNewsCategory,
  setSelectedCountry,
  setSelectedImpact,
  setLoadingNews,
  setLoadingEvents,
  setLoadingSentiment,
  setMarketError,
  setPushNotificationsEnabled,
  setEmailNotificationsEnabled,
} = marketSlice.actions;

export default marketSlice.reducer;
