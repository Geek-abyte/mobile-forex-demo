import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, typography, spacing } from '../../theme';
import { MainTabParamList } from '../../navigation/MainNavigator';
import StandardHeader from '../../components/molecules/StandardHeader';
import TutorialHelpButton from '../../components/molecules/TutorialHelpButton';

const { width } = Dimensions.get('window');

interface ForexPair {
  symbol: string;
  name: string;
  bid: number;
  ask: number;
  spread: number;
  change24h: number;
  change24hPercent: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  category: 'major' | 'minor' | 'exotic';
}

interface ForexNews {
  id: string;
  title: string;
  summary: string;
  timestamp: Date;
  impact: 'low' | 'medium' | 'high';
  currency: string;
  category: string;
}

const MarketScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const [activeCategory, setActiveCategory] = useState<'major' | 'minor' | 'exotic'>('major');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [forexPairs, setForexPairs] = useState<ForexPair[]>([]);
  const [forexNews, setForexNews] = useState<ForexNews[]>([]);

  const categories = [
    { key: 'major' as const, label: 'Major Pairs', icon: 'trending-up' },
    { key: 'minor' as const, label: 'Minor Pairs', icon: 'swap-horizontal' },
    { key: 'exotic' as const, label: 'Exotic Pairs', icon: 'globe-outline' },
  ];

  useEffect(() => {
    generateForexData();
    generateForexNews();
  }, [activeCategory]);

  const generateForexData = () => {
    const majorPairs = [
      { symbol: 'EUR/USD', name: 'Euro / US Dollar' },
      { symbol: 'GBP/USD', name: 'British Pound / US Dollar' },
      { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen' },
      { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc' },
      { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar' },
      { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar' },
      { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar' },
    ];

    const minorPairs = [
      { symbol: 'EUR/GBP', name: 'Euro / British Pound' },
      { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen' },
      { symbol: 'EUR/CHF', name: 'Euro / Swiss Franc' },
      { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen' },
      { symbol: 'GBP/CHF', name: 'British Pound / Swiss Franc' },
      { symbol: 'AUD/JPY', name: 'Australian Dollar / Japanese Yen' },
      { symbol: 'CAD/JPY', name: 'Canadian Dollar / Japanese Yen' },
      { symbol: 'CHF/JPY', name: 'Swiss Franc / Japanese Yen' },
    ];

    const exoticPairs = [
      { symbol: 'USD/TRY', name: 'US Dollar / Turkish Lira' },
      { symbol: 'USD/ZAR', name: 'US Dollar / South African Rand' },
      { symbol: 'USD/MXN', name: 'US Dollar / Mexican Peso' },
      { symbol: 'EUR/TRY', name: 'Euro / Turkish Lira' },
      { symbol: 'GBP/ZAR', name: 'British Pound / South African Rand' },
      { symbol: 'USD/SEK', name: 'US Dollar / Swedish Krona' },
      { symbol: 'USD/NOK', name: 'US Dollar / Norwegian Krone' },
      { symbol: 'USD/SGD', name: 'US Dollar / Singapore Dollar' },
    ];

    let pairs;
    switch (activeCategory) {
      case 'minor':
        pairs = minorPairs;
        break;
      case 'exotic':
        pairs = exoticPairs;
        break;
      default:
        pairs = majorPairs;
    }

    const data: ForexPair[] = pairs.map((pair) => {
      // Generate realistic forex rates
      const baseRate = Math.random() * 2 + 0.5; // Between 0.5 and 2.5
      const spread = Math.random() * 0.0005 + 0.0001; // 0.1 to 0.6 pips
      const bid = baseRate;
      const ask = bid + spread;
      
      const change24hPercent = (Math.random() - 0.5) * 4; // -2% to +2% (more realistic for forex)
      const change24h = bid * (change24hPercent / 100);

      return {
        symbol: pair.symbol,
        name: pair.name,
        bid,
        ask,
        spread: spread * 10000, // Convert to pips
        change24h,
        change24hPercent,
        volume24h: Math.random() * 100000000, // Lower volume for forex
        high24h: bid * (1 + Math.random() * 0.02),
        low24h: bid * (1 - Math.random() * 0.02),
        category: activeCategory,
      };
    });

    setForexPairs(data);
  };

  const generateForexNews = () => {
    const newsItems: ForexNews[] = [
      {
        id: '1',
        title: 'Federal Reserve Signals Potential Rate Changes',
        summary: 'The Fed indicates possible monetary policy adjustments affecting USD pairs. Markets are closely watching for inflation data and employment figures.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        impact: 'high',
        currency: 'USD',
        category: 'Central Banking',
      },
      {
        id: '2',
        title: 'European Central Bank Maintains Current Policy',
        summary: 'ECB keeps interest rates unchanged while monitoring inflation trends across the Eurozone. EUR pairs show mixed reactions.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        impact: 'medium',
        currency: 'EUR',
        category: 'Monetary Policy',
      },
      {
        id: '3',
        title: 'Bank of Japan Intervention Speculation Grows',
        summary: 'USD/JPY approaches intervention levels as Japanese officials express concern over rapid yen weakness.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        impact: 'high',
        currency: 'JPY',
        category: 'Currency Intervention',
      },
      {
        id: '4',
        title: 'UK GDP Data Beats Expectations',
        summary: 'British economic growth surpasses forecasts, providing support for GBP pairs across the board.',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        impact: 'medium',
        currency: 'GBP',
        category: 'Economic Data',
      },
      {
        id: '5',
        title: 'Australian Employment Data Surprises Markets',
        summary: 'Strong jobs growth in Australia boosts AUD sentiment as RBA policy expectations shift.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        impact: 'medium',
        currency: 'AUD',
        category: 'Employment',
      },
    ];

    setForexNews(newsItems);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    generateForexData();
    generateForexNews();
    setRefreshing(false);
  };

  const filteredData = forexPairs.filter(item =>
    item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatRate = (rate: number, symbol: string) => {
    // Most forex pairs show 4-5 decimal places
    if (symbol.includes('JPY')) {
      return rate.toFixed(3); // JPY pairs typically show 3 decimals
    }
    return rate.toFixed(5);
  };

  const handleQuickTrade = (pair: ForexPair, type: 'buy' | 'sell') => {
    Alert.alert(
      'Quick Trade',
      `Do you want to ${type.toUpperCase()} ${pair.symbol}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Go to Trading',
          onPress: () => navigation.navigate('Trading', { 
            symbol: pair.symbol,
            type: type
          }),
        },
        {
          text: `${type.toUpperCase()} Now`,
          style: 'default',
          onPress: () => executeQuickTrade(pair, type),
        },
      ]
    );
  };

  const executeQuickTrade = (pair: ForexPair, type: 'buy' | 'sell') => {
    // This would execute a quick trade with default parameters
    Alert.alert(
      'Trade Executed',
      `Quick ${type.toUpperCase()} order for ${pair.symbol} has been placed!\n\nPrice: ${type === 'buy' ? formatRate(pair.ask, pair.symbol) : formatRate(pair.bid, pair.symbol)}\nSpread: ${pair.spread.toFixed(1)} pips`,
      [
        {
          text: 'View Trade',
          onPress: () => navigation.navigate('Trading', { symbol: pair.symbol }),
        },
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  };

  const ForexItem: React.FC<{ item: ForexPair }> = ({ item }) => (
    <View style={styles.marketItem}>
      <TouchableOpacity 
        style={styles.marketItemMain}
        onPress={() => navigation.navigate('Trading', { 
          symbol: item.symbol
        })}
      >
        <View style={styles.marketItemLeft}>
          <Text style={styles.marketSymbol}>{item.symbol}</Text>
          <Text style={styles.marketName}>{item.name}</Text>
          <Text style={styles.marketVolume}>
            Spread: {item.spread.toFixed(1)} pips
          </Text>
        </View>
        
        <View style={styles.marketItemCenter}>
          <View style={styles.bidAskContainer}>
            <Text style={styles.bidPrice}>Bid: {formatRate(item.bid, item.symbol)}</Text>
            <Text style={styles.askPrice}>Ask: {formatRate(item.ask, item.symbol)}</Text>
          </View>
          <View style={[
            styles.changeContainer,
            { backgroundColor: item.change24hPercent >= 0 ? colors.trading.profit + '20' : colors.trading.loss + '20' }
          ]}>
            <Ionicons 
              name={item.change24hPercent >= 0 ? 'trending-up' : 'trending-down'} 
              size={14} 
              color={item.change24hPercent >= 0 ? colors.trading.profit : colors.trading.loss} 
            />
            <Text style={[
              styles.changePercent,
              { color: item.change24hPercent >= 0 ? colors.trading.profit : colors.trading.loss }
            ]}>
              {item.change24hPercent >= 0 ? '+' : ''}{item.change24hPercent.toFixed(2)}%
            </Text>
          </View>
          <Text style={styles.priceRange}>
            H: {formatRate(item.high24h, item.symbol)} L: {formatRate(item.low24h, item.symbol)}
          </Text>
        </View>
      </TouchableOpacity>
      
      {/* Quick Trade Actions */}
      <View style={styles.marketItemActions}>
        <TouchableOpacity 
          style={[styles.quickTradeButton, styles.buyButton]}
          onPress={() => handleQuickTrade(item, 'buy')}
        >
          <Text style={styles.quickTradeButtonText}>BUY</Text>
          <Text style={styles.quickTradePrice}>{formatRate(item.ask, item.symbol)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickTradeButton, styles.sellButton]}
          onPress={() => handleQuickTrade(item, 'sell')}
        >
          <Text style={styles.quickTradeButtonText}>SELL</Text>
          <Text style={styles.quickTradePrice}>{formatRate(item.bid, item.symbol)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ForexNewsItem: React.FC<{ item: ForexNews }> = ({ item }) => (
    <TouchableOpacity style={styles.newsItem}>
      <View style={styles.newsHeader}>
        <View style={styles.newsCategory}>
          <Text style={styles.newsCategoryText}>{item.currency}</Text>
        </View>
        <View style={[
          styles.impactBadge,
          { backgroundColor: 
            item.impact === 'high' ? colors.trading.loss + '30' :
            item.impact === 'medium' ? colors.trading.warning + '30' :
            colors.primary[500] + '30'
          }
        ]}>
          <Text style={[
            styles.impactText,
            { color: 
              item.impact === 'high' ? colors.trading.loss :
              item.impact === 'medium' ? colors.trading.warning :
              colors.primary[500]
            }
          ]}>
            {item.impact.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.newsTitle}>{item.title}</Text>
      <Text style={styles.newsSummary}>{item.summary}</Text>
      <View style={styles.newsFooter}>
        <Text style={styles.newsTimestamp}>
          {Math.floor((Date.now() - item.timestamp.getTime()) / (60 * 60 * 1000))}h ago
        </Text>
        <Text style={styles.newsCategory}>
          {item.category}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StandardHeader title="Markets" />
      
      <View style={styles.content}>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search markets..."
            placeholderTextColor={colors.text.secondary}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Category Tabs */}
        <View style={styles.categoryContainer}>
          <View style={styles.categoryTabsRow}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryTab,
                  activeCategory === category.key && styles.activeCategoryTab
                ]}
                onPress={() => setActiveCategory(category.key)}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={16} 
                  color={activeCategory === category.key ? colors.text.primary : colors.text.secondary} 
                />
                <Text style={[
                  styles.categoryText,
                  activeCategory === category.key && styles.activeCategoryText
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Forex Pairs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Live Forex Rates</Text>
            <FlatList
              data={filteredData}
              renderItem={({ item }) => <ForexItem item={item} />}
              keyExtractor={(item) => item.symbol}
              scrollEnabled={false}
            />
          </View>

          {/* Forex News */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Forex News & Analysis</Text>
            {forexNews.map((item) => (
              <ForexNewsItem key={item.id} item={item} />
            ))}
          </View>
        </ScrollView>
      </View>
      
      {/* Tutorial Help Button */}
      <TutorialHelpButton screenName="Market" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    margin: spacing[4],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing[2],
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontFamily: typography.fonts.primary,
  },
  categoryContainer: {
    marginBottom: spacing[2],
    paddingHorizontal: spacing[4],
  },
  categoryTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  categoryContent: {
    paddingHorizontal: spacing[4],
  },
  categoryTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 8,
    height: 36,
  },
  activeCategoryTab: {
    backgroundColor: colors.primary[500],
  },
  categoryText: {
    marginLeft: spacing[1],
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  activeCategoryText: {
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  marketItem: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    marginBottom: spacing[2],
    overflow: 'hidden',
  },
  marketItemMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
  },
  marketItemLeft: {
    flex: 1,
  },
  marketItemCenter: {
    alignItems: 'flex-end',
  },
  marketItemRight: {
    alignItems: 'flex-end',
  },
  marketItemActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.background.secondary,
  },
  quickTradeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
  },
  buyButton: {
    backgroundColor: colors.trading.profit + '20',
    borderRightWidth: 0.5,
    borderRightColor: colors.background.secondary,
  },
  sellButton: {
    backgroundColor: colors.trading.loss + '20',
    borderLeftWidth: 0.5,
    borderLeftColor: colors.background.secondary,
  },
  quickTradeButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  quickTradePrice: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  marketSymbol: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  marketName: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  marketVolume: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  bidAskContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing[1],
  },
  bidPrice: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.trading.loss,
    marginBottom: 2,
  },
  askPrice: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.trading.profit,
  },
  marketPrice: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 6,
    marginBottom: spacing[1],
  },
  changePercent: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginLeft: spacing[1],
  },
  priceRange: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  newsItem: {
    backgroundColor: colors.background.tertiary,
    padding: spacing[4],
    borderRadius: 12,
    marginBottom: spacing[2],
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  newsCategory: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  newsCategoryText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  newsTitle: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  newsSummary: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeights.relaxed * typography.sizes.sm,
    marginBottom: spacing[2],
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[2],
  },
  newsTimestamp: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  impactBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  impactText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
});

export default MarketScreen;
