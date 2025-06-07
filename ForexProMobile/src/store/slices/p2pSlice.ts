import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface P2PUser {
  id: string;
  username: string;
  avatar?: string;
  rating: number;
  completedTrades: number;
  isVerified: boolean;
  lastSeen: string;
  responseTime: string;
  successRate: number;
}

export interface P2POffer {
  id: string;
  userId: string;
  user: P2PUser;
  type: 'buy' | 'sell';
  currency: string;
  fiatCurrency: string;
  amount: number;
  minLimit: number;
  maxLimit: number;
  price: number;
  priceType: 'fixed' | 'floating';
  priceMargin?: number;
  paymentMethods: string[];
  terms: string;
  status: 'active' | 'inactive' | 'paused';
  autoReply: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface P2PTrade {
  id: string;
  offerId: string;
  offer: P2POffer;
  buyerId: string;
  sellerId: string;
  buyer: P2PUser;
  seller: P2PUser;
  amount: number;
  fiatAmount: number;
  price: number;
  status: 'pending' | 'paid' | 'cancelled' | 'completed' | 'disputed';
  paymentMethod: string;
  timeLimit: number; // in minutes
  createdAt: string;
  paidAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  messages: P2PMessage[];
  escrowReleased: boolean;
  disputeReason?: string;
}

export interface P2PMessage {
  id: string;
  tradeId: string;
  senderId: string;
  message: string;
  timestamp: string;
  isSystemMessage: boolean;
}

export interface EscrowDetails {
  tradeId: string;
  amount: number;
  currency: string;
  status: 'locked' | 'released' | 'disputed';
  lockedAt: string;
  releasedAt?: string;
  releaseConditions: string[];
}

interface P2PState {
  offers: P2POffer[];
  myOffers: P2POffer[];
  activeTrades: P2PTrade[];
  tradeHistory: P2PTrade[];
  selectedOffer: P2POffer | null;
  selectedTrade: P2PTrade | null;
  escrowDetails: EscrowDetails[];
  filters: {
    currency: string;
    fiatCurrency: string;
    paymentMethod: string;
    type: 'buy' | 'sell' | 'all';
    priceRange: { min: number; max: number };
    amountRange: { min: number; max: number };
  };
  isLoadingOffers: boolean;
  isLoadingTrades: boolean;
  isCreatingOffer: boolean;
  isProcessingTrade: boolean;
  p2pError: string | null;
  chatMessages: { [tradeId: string]: P2PMessage[] };
  unreadMessages: { [tradeId: string]: number };
}

const initialState: P2PState = {
  offers: [],
  myOffers: [],
  activeTrades: [],
  tradeHistory: [],
  selectedOffer: null,
  selectedTrade: null,
  escrowDetails: [],
  filters: {
    currency: 'USDT',
    fiatCurrency: 'USD',
    paymentMethod: 'all',
    type: 'all',
    priceRange: { min: 0, max: 999999 },
    amountRange: { min: 0, max: 999999 },
  },
  isLoadingOffers: false,
  isLoadingTrades: false,
  isCreatingOffer: false,
  isProcessingTrade: false,
  p2pError: null,
  chatMessages: {},
  unreadMessages: {},
};

const p2pSlice = createSlice({
  name: 'p2p',
  initialState,
  reducers: {
    setOffers: (state, action: PayloadAction<P2POffer[]>) => {
      state.offers = action.payload;
    },
    addOffer: (state, action: PayloadAction<P2POffer>) => {
      state.offers.unshift(action.payload);
    },
    updateOffer: (state, action: PayloadAction<P2POffer>) => {
      const index = state.offers.findIndex(offer => offer.id === action.payload.id);
      if (index !== -1) {
        state.offers[index] = action.payload;
      }
      
      const myOfferIndex = state.myOffers.findIndex(offer => offer.id === action.payload.id);
      if (myOfferIndex !== -1) {
        state.myOffers[myOfferIndex] = action.payload;
      }
    },
    removeOffer: (state, action: PayloadAction<string>) => {
      state.offers = state.offers.filter(offer => offer.id !== action.payload);
      state.myOffers = state.myOffers.filter(offer => offer.id !== action.payload);
    },
    setMyOffers: (state, action: PayloadAction<P2POffer[]>) => {
      state.myOffers = action.payload;
    },
    setSelectedOffer: (state, action: PayloadAction<P2POffer | null>) => {
      state.selectedOffer = action.payload;
    },
    setActiveTrades: (state, action: PayloadAction<P2PTrade[]>) => {
      state.activeTrades = action.payload;
    },
    addTrade: (state, action: PayloadAction<P2PTrade>) => {
      state.activeTrades.unshift(action.payload);
    },
    updateTrade: (state, action: PayloadAction<P2PTrade>) => {
      const activeIndex = state.activeTrades.findIndex(trade => trade.id === action.payload.id);
      if (activeIndex !== -1) {
        state.activeTrades[activeIndex] = action.payload;
      }
      
      const historyIndex = state.tradeHistory.findIndex(trade => trade.id === action.payload.id);
      if (historyIndex !== -1) {
        state.tradeHistory[historyIndex] = action.payload;
      }
      
      if (state.selectedTrade?.id === action.payload.id) {
        state.selectedTrade = action.payload;
      }
    },
    setSelectedTrade: (state, action: PayloadAction<P2PTrade | null>) => {
      state.selectedTrade = action.payload;
    },
    setTradeHistory: (state, action: PayloadAction<P2PTrade[]>) => {
      state.tradeHistory = action.payload;
    },
    addEscrowDetails: (state, action: PayloadAction<EscrowDetails>) => {
      const existingIndex = state.escrowDetails.findIndex(
        escrow => escrow.tradeId === action.payload.tradeId
      );
      if (existingIndex !== -1) {
        state.escrowDetails[existingIndex] = action.payload;
      } else {
        state.escrowDetails.push(action.payload);
      }
    },
    updateFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    addChatMessage: (state, action: PayloadAction<P2PMessage>) => {
      const { tradeId } = action.payload;
      if (!state.chatMessages[tradeId]) {
        state.chatMessages[tradeId] = [];
      }
      state.chatMessages[tradeId].push(action.payload);
      
      // Update unread count if not from current user
      if (!action.payload.isSystemMessage) {
        state.unreadMessages[tradeId] = (state.unreadMessages[tradeId] || 0) + 1;
      }
    },
    setChatMessages: (state, action: PayloadAction<{ tradeId: string; messages: P2PMessage[] }>) => {
      state.chatMessages[action.payload.tradeId] = action.payload.messages;
    },
    markMessagesAsRead: (state, action: PayloadAction<string>) => {
      state.unreadMessages[action.payload] = 0;
    },
    setLoadingOffers: (state, action: PayloadAction<boolean>) => {
      state.isLoadingOffers = action.payload;
    },
    setLoadingTrades: (state, action: PayloadAction<boolean>) => {
      state.isLoadingTrades = action.payload;
    },
    setCreatingOffer: (state, action: PayloadAction<boolean>) => {
      state.isCreatingOffer = action.payload;
    },
    setProcessingTrade: (state, action: PayloadAction<boolean>) => {
      state.isProcessingTrade = action.payload;
    },
    setP2PError: (state, action: PayloadAction<string | null>) => {
      state.p2pError = action.payload;
    },
  },
});

export const {
  setOffers,
  addOffer,
  updateOffer,
  removeOffer,
  setMyOffers,
  setSelectedOffer,
  setActiveTrades,
  addTrade,
  updateTrade,
  setSelectedTrade,
  setTradeHistory,
  addEscrowDetails,
  updateFilters,
  addChatMessage,
  setChatMessages,
  markMessagesAsRead,
  setLoadingOffers,
  setLoadingTrades,
  setCreatingOffer,
  setProcessingTrade,
  setP2PError,
} = p2pSlice.actions;

export default p2pSlice.reducer;
