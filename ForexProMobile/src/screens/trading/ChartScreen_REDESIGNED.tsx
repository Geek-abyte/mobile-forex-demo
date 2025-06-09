import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Modal,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing, shadows } from '../../theme';
import ProfessionalTradingChart from '../../components/organisms/ProfessionalTradingChart';
import { enhancedTradingService } from '../../services/enhancedTradingService';
import { realisticMarketSimulation } from '../../services/realisticMarketSimulation';
import type { CandleData } from '../../components/organisms/ProfessionalTradingChart';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FloatingActionButtonProps {
  icon: string;
  onPress: () => void;
  backgroundColor?: string;
  size?: number;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  backgroundColor = colors.primary[500],
  size = 56,
}) => (
  <TouchableOpacity
    style={[
      styles.fab,
      {
        backgroundColor,
        width: size,
        height: size,
        borderRadius: size / 2,
      },
    ]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Ionicons name={icon as any} size={24} color="white" />
  </TouchableOpacity>
);

interface CollapsiblePanelProps {
  title: string;
  children: React.ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
  height?: number;
}

const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title,
  children,
  isCollapsed,
  onToggle,
  height = 200,
}) => {
  const animatedHeight = useRef(new Animated.Value(isCollapsed ? 0 : height)).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isCollapsed ? 0 : height,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isCollapsed, height]);

  return (
    <View style={styles.collapsiblePanel}>
      <TouchableOpacity
        style={styles.panelHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.panelTitle}>{title}</Text>
        <Ionicons
          name={isCollapsed ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.text.primary}
        />
      </TouchableOpacity>
      <Animated.View style={[styles.panelContent, { height: animatedHeight }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const ChartScreenRedesigned: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showPositionsPanel, setShowPositionsPanel] = useState(false);
  const [showOrdersPanel, setShowOrdersPanel] = useState(false);
  const [showIndicatorsModal, setShowIndicatorsModal] = useState(false);
  const [isWatchlistCollapsed, setIsWatchlistCollapsed] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(1.0952);
  const [chartData, setChartData] = useState<CandleData[]>([]);

  // Sidebar animation
  const sidebarTranslateX = useRef(new Animated.Value(-screenWidth * 0.8)).current;
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  useEffect(() => {
    // Initialize chart data
    const data = realisticMarketSimulation.generateHistoricalData(selectedSymbol, selectedTimeframe, 100);
    setChartData(data);
    
    // Start real-time price updates
    const interval = setInterval(() => {
      const newPrice = realisticMarketSimulation.getCurrentPrice(selectedSymbol);
      setCurrentPrice(newPrice);
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedSymbol, selectedTimeframe]);

  const toggleSidebar = () => {
    const toValue = isSidebarVisible ? -screenWidth * 0.8 : 0;
    Animated.timing(sidebarTranslateX, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsSidebarVisible(!isSidebarVisible);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (Platform.OS === 'android') {
      StatusBar.setHidden(!isFullscreen);
    }
  };

  const watchlistData = [
    { symbol: 'EURUSD', price: 1.0952, change: 0.0012, changePercent: 0.11 },
    { symbol: 'GBPUSD', price: 1.2634, change: -0.0023, changePercent: -0.18 },
    { symbol: 'USDJPY', price: 150.45, change: 0.34, changePercent: 0.23 },
    { symbol: 'USDCHF', price: 0.8923, change: 0.0008, changePercent: 0.09 },
  ];

  const timeframes = ['1M', '5M', '15M', '30M', '1H', '4H', '1D', '1W'];

  const renderWatchlistItem = (item: any) => (
    <TouchableOpacity
      key={item.symbol}
      style={[
        styles.watchlistItem,
        selectedSymbol === item.symbol && styles.selectedWatchlistItem,
      ]}
      onPress={() => setSelectedSymbol(item.symbol)}
    >
      <Text style={styles.watchlistSymbol}>{item.symbol}</Text>
      <View style={styles.watchlistPriceContainer}>
        <Text style={styles.watchlistPrice}>{item.price.toFixed(5)}</Text>
        <Text
          style={[
            styles.watchlistChange,
            { color: item.change >= 0 ? colors.trading.profit : colors.trading.loss },
          ]}
        >
          {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderTimeframeButton = (timeframe: string) => (
    <TouchableOpacity
      key={timeframe}
      style={[
        styles.timeframeButton,
        selectedTimeframe === timeframe && styles.selectedTimeframeButton,
      ]}
      onPress={() => setSelectedTimeframe(timeframe)}
    >
      <Text
        style={[
          styles.timeframeButtonText,
          selectedTimeframe === timeframe && styles.selectedTimeframeButtonText,
        ]}
      >
        {timeframe}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <SafeAreaView style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
        {/* Header */}
        {!isFullscreen && (
          <View style={styles.header}>
            <TouchableOpacity onPress={toggleSidebar} style={styles.headerButton}>
              <Ionicons name="menu" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={styles.headerSymbol}>{selectedSymbol}</Text>
              <Text style={[
                styles.headerPrice,
                { color: colors.trading.profit }, // Dynamic color based on trend
              ]}>
                {currentPrice.toFixed(5)}
              </Text>
            </View>

            <TouchableOpacity onPress={toggleFullscreen} style={styles.headerButton}>
              <Ionicons name="expand" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Chart Container */}
        <View style={[styles.chartContainer, isFullscreen && styles.fullscreenChart]}>
          <ProfessionalTradingChart
            symbol={selectedSymbol}
            data={chartData}
            currentPrice={currentPrice}
            onTimeframeChange={setSelectedTimeframe}
            selectedTimeframe={selectedTimeframe}
            isFullscreen={isFullscreen}
            onFullscreenToggle={toggleFullscreen}
          />

          {/* Floating Controls */}
          {isFullscreen && (
            <View style={styles.fullscreenControls}>
              <TouchableOpacity
                style={styles.fullscreenBackButton}
                onPress={toggleFullscreen}
              >
                <Ionicons name="contract" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Timeframe Selector */}
        {!isFullscreen && (
          <View style={styles.timeframeContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.timeframeScrollContainer}
            >
              {timeframes.map(renderTimeframeButton)}
            </ScrollView>
          </View>
        )}

        {/* Watchlist Panel */}
        {!isFullscreen && (
          <CollapsiblePanel
            title="Watchlist"
            isCollapsed={isWatchlistCollapsed}
            onToggle={() => setIsWatchlistCollapsed(!isWatchlistCollapsed)}
            height={160}
          >
            {watchlistData.map(renderWatchlistItem)}
          </CollapsiblePanel>
        )}

        {/* Floating Action Buttons */}
        {!isFullscreen && (
          <View style={styles.fabContainer}>
            <FloatingActionButton
              icon="trending-up"
              onPress={() => setShowTradeModal(true)}
              backgroundColor={colors.trading.profit}
            />
            <FloatingActionButton
              icon="list"
              onPress={() => setShowPositionsPanel(true)}
              backgroundColor={colors.primary[500]}
            />
            <FloatingActionButton
              icon="analytics"
              onPress={() => setShowIndicatorsModal(true)}
              backgroundColor={colors.secondary[500]}
            />
          </View>
        )}
      </SafeAreaView>

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          { transform: [{ translateX: sidebarTranslateX }] },
        ]}
      >
        <View style={styles.sidebarBlur}>
          <View style={styles.sidebarContent}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Trading Hub</Text>
              <TouchableOpacity onPress={toggleSidebar}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.sidebarItem}>
              <Ionicons name="wallet" size={24} color={colors.primary[500]} />
              <Text style={styles.sidebarItemText}>Wallet</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarItem}>
              <Ionicons name="bar-chart" size={24} color={colors.primary[500]} />
              <Text style={styles.sidebarItemText}>Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarItem}>
              <Ionicons name="settings" size={24} color={colors.primary[500]} />
              <Text style={styles.sidebarItemText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Trade Modal */}
      <Modal
        visible={showTradeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTradeModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Place Order</Text>
            <TouchableOpacity onPress={() => setShowTradeModal(false)}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Trade execution interface will be implemented here</Text>
            {/* Trade form components will go here */}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Backdrop for sidebar */}
      {isSidebarVisible && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={toggleSidebar}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  fullscreenContainer: {
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    backgroundColor: colors.background.primary,
  },
  headerButton: {
    padding: spacing[2],
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerSymbol: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  headerPrice: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  chartContainer: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  fullscreenChart: {
    backgroundColor: '#000',
  },
  fullscreenControls: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
    zIndex: 1000,
  },
  fullscreenBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeframeContainer: {
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  timeframeScrollContainer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  timeframeButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    marginRight: spacing[2],
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
  },
  selectedTimeframeButton: {
    backgroundColor: colors.primary[500],
  },
  timeframeButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  selectedTimeframeButtonText: {
    color: 'white',
  },
  collapsiblePanel: {
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.background.secondary,
  },
  panelTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  panelContent: {
    overflow: 'hidden',
  },
  watchlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  selectedWatchlistItem: {
    backgroundColor: colors.primary[100],
  },
  watchlistSymbol: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  watchlistPriceContainer: {
    alignItems: 'flex-end',
  },
  watchlistPrice: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  watchlistChange: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  fabContainer: {
    position: 'absolute',
    right: spacing[4],
    bottom: spacing[6],
    alignItems: 'center',
  },
  fab: {
    marginBottom: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth * 0.8,
    height: screenHeight,
    zIndex: 1000,
  },
  sidebarBlur: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 23, 0.95)', // Semi-transparent background
  },
  sidebarContent: {
    flex: 1,
    paddingTop: spacing[12],
    paddingHorizontal: spacing[4],
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  sidebarTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    marginBottom: spacing[2],
  },
  sidebarItemText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginLeft: spacing[4],
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  modalContent: {
    flex: 1,
    padding: spacing[4],
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default ChartScreenRedesigned;
