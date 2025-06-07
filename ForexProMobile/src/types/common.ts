// Common types used throughout the application

// Base API response structure
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Pagination interface
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Paginated response
export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: Pagination;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Generic async state
export interface AsyncState<T = unknown> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
  lastUpdated?: string;
}

// Currency codes
export type CurrencyCode = 
  | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF' | 'CAD' | 'AUD' | 'NZD'
  | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'CZK' | 'HUF' | 'RON' | 'BGN'
  | 'HRK' | 'RUB' | 'TRY' | 'BRL' | 'MXN' | 'ZAR' | 'KRW' | 'SGD'
  | 'HKD' | 'CNY' | 'INR' | 'THB' | 'MYR' | 'IDR' | 'PHP' | 'VND';

// Trading pair
export interface TradingPair {
  id: string;
  base: CurrencyCode;
  quote: CurrencyCode;
  symbol: string; // e.g., "EURUSD"
  displayName: string; // e.g., "EUR/USD"
  precision: number;
  minTradeSize: number;
  maxTradeSize: number;
  pipSize: number;
  isActive: boolean;
  category: 'major' | 'minor' | 'exotic' | 'crypto';
}

// Price data
export interface PriceData {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  timestamp: string;
}

// Chart data point
export interface ChartDataPoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Timeframe for charts
export type ChartTimeframe = 
  | '1m' | '5m' | '15m' | '30m' 
  | '1h' | '4h' | '1d' | '1w' | '1M';

// Chart type
export type ChartType = 'candlestick' | 'line' | 'area';

// Order side
export type OrderSide = 'buy' | 'sell';

// Order type
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';

// Order status
export type OrderStatus = 
  | 'pending' | 'open' | 'filled' | 'partial'
  | 'cancelled' | 'expired' | 'rejected';

// Position status
export type PositionStatus = 'open' | 'closed';

// Transaction type
export type TransactionType = 
  | 'deposit' | 'withdrawal' | 'trade' | 'fee'
  | 'bonus' | 'transfer' | 'p2p_buy' | 'p2p_sell';

// Transaction status
export type TransactionStatus = 
  | 'pending' | 'processing' | 'completed' 
  | 'failed' | 'cancelled' | 'rejected';

// KYC status
export type KYCStatus = 'none' | 'pending' | 'approved' | 'rejected';

// Account type
export type AccountType = 'demo' | 'live';

// Risk level
export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high';

// P2P ad type
export type P2PAdType = 'buy' | 'sell';

// P2P payment method
export type P2PPaymentMethod = 
  | 'bank_transfer' | 'paypal' | 'wise' | 'revolut'
  | 'cash' | 'crypto' | 'mobile_money' | 'other';

// P2P order status
export type P2POrderStatus = 
  | 'pending' | 'payment_pending' | 'payment_confirmed'
  | 'disputed' | 'completed' | 'cancelled' | 'expired';

// Notification type
export type NotificationType = 
  | 'trade' | 'price_alert' | 'order' | 'position'
  | 'p2p' | 'account' | 'system' | 'promotion';

// Notification priority
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

// Screen orientation
export type ScreenOrientation = 'portrait' | 'landscape';

// Theme mode
export type ThemeMode = 'light' | 'dark' | 'auto';

// Language codes
export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko';

// Country codes (ISO 3166-1 alpha-2)
export type CountryCode = string; // e.g., 'US', 'GB', 'DE', etc.

// User preferences
export interface UserPreferences {
  theme: ThemeMode;
  language: LanguageCode;
  currency: CurrencyCode;
  notifications: boolean;
  biometrics: boolean;
  autoLock: boolean;
  autoLockTimeout: number; // in minutes
  chartDefaultTimeframe: ChartTimeframe;
  chartDefaultType: ChartType;
  defaultLeverage: number;
  riskWarnings: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  stack?: string;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// File upload
export interface FileUpload {
  uri: string;
  type: string;
  name: string;
  size: number;
}

// Contact information
export interface ContactInfo {
  email?: string;
  phone?: string;
  telegram?: string;
  whatsapp?: string;
  discord?: string;
}

// Address information
export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: CountryCode;
}

// Document types for KYC
export type DocumentType = 
  | 'passport' | 'id_card' | 'drivers_license'
  | 'utility_bill' | 'bank_statement' | 'other';

// Sort direction
export type SortDirection = 'asc' | 'desc';

// Filter operators
export type FilterOperator = 
  | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'nin' | 'like' | 'between';

// Generic filter
export interface Filter {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

// Sort configuration
export interface Sort {
  field: string;
  direction: SortDirection;
}

// Search parameters
export interface SearchParams {
  query?: string;
  filters?: Filter[];
  sort?: Sort[];
  page?: number;
  limit?: number;
}

export default {};
