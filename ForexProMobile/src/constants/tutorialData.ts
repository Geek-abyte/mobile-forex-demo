import { TutorialSection, AppOverview, FeatureHighlight } from '../types/tutorial';

export const APP_OVERVIEW: AppOverview = {
  title: "Welcome to Fusion Markets",
  description: "🎯 Your forex trading simulator with $10,000 virtual money. Learn to trade without any financial risk!",
  keyFeatures: [
    {
      id: 'dashboard',
      title: 'Portfolio Dashboard',
      description: '💰 Track your balance, profits, and trading performance',
      icon: 'dashboard',
      targetScreen: 'Dashboard',
      importance: 'high'
    },
    {
      id: 'trading',
      title: 'Live Trading Terminal',
      description: '📈 Place BUY/SELL orders with real-time charts',
      icon: 'trending-up',
      targetScreen: 'Trading',
      importance: 'high'
    },
    {
      id: 'markets',
      title: 'Live Market Prices',
      description: '📊 Browse forex pairs and watch price movements',
      icon: 'show-chart',
      targetScreen: 'Market',
      importance: 'high'
    }
  ],
  gettingStartedSteps: [
    "Check your $10,000 virtual balance in Dashboard",
    "Browse live forex prices in Markets",
    "Place your first trade in Trading section",
    "Always use Stop Loss to limit risk"
  ],
  safetyNote: "🛡️ Demo Mode: 100% virtual money - perfect for learning!"
};

export const TUTORIAL_SECTIONS: TutorialSection[] = [
  {
    id: 'quick_start',
    title: 'Quick Start Guide',
    description: 'Essential basics to get you trading',
    icon: 'rocket',
    color: '#00D4AA',
    estimatedTime: '2 min',
    isRequired: true,
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Fusion Markets',
        description: '🎯 This is a forex trading simulator with $10,000 virtual money. Perfect for learning without risk!',
        position: 'center',
        icon: 'rocket',
        action: 'none'
      },
      {
        id: 'navigation_basics',
        title: 'Main Navigation',
        description: '� Use the bottom tabs to navigate: Dashboard (portfolio), Trading (place orders), Markets (live prices)',
        position: 'bottom',
        targetElement: 'bottom_tab_bar',
        icon: 'compass',
        action: 'tap',
        actionDescription: 'Try tapping different sections'
      }
    ]
  },
  {
    id: 'key_features',
    title: 'Key Features',
    description: 'Learn the essential trading features',
    icon: 'trending-up',
    color: '#4F46E5',
    estimatedTime: '2 min',
    isRequired: true,
    steps: [
      {
        id: 'dashboard_balance',
        title: 'Check Your Balance',
        description: '💰 Your Dashboard shows portfolio value and today\'s profit/loss. Start here to see your $10,000 virtual balance.',
        position: 'top',
        targetScreen: 'Dashboard',
        targetElement: 'balance_card',
        icon: 'wallet',
        action: 'tap',
        actionDescription: 'Go to Dashboard to see your balance'
      },
      {
        id: 'markets_live_prices',
        title: 'Live Market Prices',
        description: '📈 Markets tab shows live forex prices with color coding: Green = price up, Red = price down',
        position: 'center',
        targetScreen: 'Market',
        targetElement: 'price_display',
        icon: 'show-chart',
        action: 'tap',
        actionDescription: 'Visit Markets to see live prices'
      },
      {
        id: 'trading_orders',
        title: 'Place Your First Trade',
        description: '🎯 Trading screen: Choose BUY if you think price goes UP, SELL if you think price goes DOWN',
        position: 'center',
        targetScreen: 'Trading',
        targetElement: 'trade_buttons',
        icon: 'add-circle',
        action: 'tap',
        actionDescription: 'Go to Trading to place orders'
      }
    ]
  },
  {
    id: 'risk_essentials',
    title: 'Risk Management',
    description: 'Essential safety tips for trading',
    icon: 'shield-checkmark',
    color: '#DC2626',
    estimatedTime: '1 min',
    isRequired: true,
    steps: [
      {
        id: 'position_sizing_simple',
        title: 'Start Small',
        description: '⚠️ Risk only 1-2% per trade. Even in demo mode, practice good habits!',
        position: 'center',
        icon: 'warning',
        action: 'none'
      },
      {
        id: 'stop_loss_simple',
        title: 'Use Stop Loss',
        description: '🛡️ Always set Stop Loss to limit losses. Better safe than sorry!',
        position: 'center',
        icon: 'stop-circle',
        action: 'none'
      }
    ]
  }
];

export const QUICK_TIPS = [
  {
    id: 'start_simple',
    title: 'Start with EUR/USD',
    description: 'Most liquid pair with tight spreads - perfect for beginners.',
    icon: 'star'
  },
  {
    id: 'practice_demo',
    title: 'Master Demo Mode First',
    description: 'Perfect your strategy with virtual money before risking real funds.',
    icon: 'school'
  },
  {
    id: 'risk_small',
    title: 'Risk Only 1-2% Per Trade',
    description: 'Protect your capital - never risk more than you can afford to lose.',
    icon: 'shield'
  },
  {
    id: 'use_stop_loss',
    title: 'Always Use Stop Loss',
    description: 'Limit your losses automatically - your safety net in volatile markets.',
    icon: 'stop-circle'
  }
];
