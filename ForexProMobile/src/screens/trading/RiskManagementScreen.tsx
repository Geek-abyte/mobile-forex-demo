import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../../theme';
import { tradingService } from '../../services/tradingService';
import { 
  riskManagementService, 
  RiskMetrics, 
  RiskAlert, 
  PositionRisk, 
  RiskSettings 
} from '../../services/riskManagementService';

const { width } = Dimensions.get('window');

const RiskManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [positions, setPositions] = useState<PositionRisk[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [riskSettings, setRiskSettings] = useState<RiskSettings | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [positionSizeCalculator, setPositionSizeCalculator] = useState({
    accountRisk: '2',
    stopLossDistance: '50',
    leverage: '100',
    symbol: 'EUR/USD',
    entryPrice: '1.0952',
    stopLoss: '1.0902',
  });

  useEffect(() => {
    loadRiskData();
    
    // Subscribe to real-time risk updates
    const unsubscribe = riskManagementService.subscribe((metrics: RiskMetrics) => {
      setRiskMetrics(metrics);
    });
    
    const interval = setInterval(() => {
      loadRiskData();
    }, 10000); // Update every 10 seconds
    
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const loadRiskData = async () => {
    try {
      setLoading(true);
      const [metrics, alerts, settings] = await Promise.all([
        riskManagementService.getRiskMetrics(),
        Promise.resolve(riskManagementService.getRiskAlerts()),
        Promise.resolve(riskManagementService.getRiskSettings()),
      ]);
      
      setRiskMetrics(metrics);
      setRiskAlerts(alerts);
      setRiskSettings(settings);
      
      // Load position risks
      const positions = await tradingService.getPositions();
      const positionRisks = await Promise.all(
        positions.map(position => riskManagementService.calculatePositionRisk(position))
      );
      setPositions(positionRisks);
      
    } catch (error) {
      console.error('Failed to load risk data:', error);
      Alert.alert('Error', 'Failed to load risk management data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRiskData();
    setRefreshing(false);
  };

  const calculatePositionSize = () => {
    const accountRisk = parseFloat(positionSizeCalculator.accountRisk);
    const stopLossDistance = parseFloat(positionSizeCalculator.stopLossDistance);
    const leverage = parseFloat(positionSizeCalculator.leverage);
    
    if (!accountRisk || !stopLossDistance || !leverage || !riskMetrics) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const riskAmount = (riskMetrics.accountBalance * accountRisk) / 100;
    const positionSize = riskAmount / stopLossDistance;
    const lotSize = positionSize / 100000; // Convert to standard lots
    
    Alert.alert(
      'Position Size Calculation',
      `Risk Amount: $${riskAmount.toFixed(2)}\nRecommended Position Size: ${lotSize.toFixed(4)} lots\nMargin Required: $${(lotSize * 100000 * parseFloat(positionSizeCalculator.entryPrice) / leverage).toFixed(2)}`,
      [{ text: 'OK' }]
    );
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 8) return colors.trading.loss;
    if (score >= 6) return colors.trading.warning;
    return colors.trading.profit;
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'danger': return colors.trading.loss;
      case 'warning': return colors.trading.warning;
      default: return colors.primary[500];
    }
  };

  const RiskCard: React.FC<{ title: string; value: string; subtitle?: string; color?: string; icon?: string }> = ({ 
    title, value, subtitle, color = colors.text.primary, icon 
  }) => (
    <View style={styles.riskCard}>
      <View style={styles.riskCardHeader}>
        {icon && <Ionicons name={icon as any} size={20} color={color} />}
        <Text style={styles.riskCardTitle}>{title}</Text>
      </View>
      <Text style={[styles.riskCardValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.riskCardSubtitle}>{subtitle}</Text>}
    </View>
  );

  const PositionCard: React.FC<{ position: PositionRisk }> = ({ position }) => (
    <View style={styles.positionCard}>
      <View style={styles.positionHeader}>
        <Text style={styles.positionSymbol}>{position.symbol}</Text>
        <View style={[
          styles.positionType,
          { backgroundColor: position.type === 'buy' ? colors.trading.profit + '20' : colors.trading.loss + '20' }
        ]}>
          <Text style={[
            styles.positionTypeText,
            { color: position.type === 'buy' ? colors.trading.profit : colors.trading.loss }
          ]}>
            {position.type.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.positionDetails}>
        <View style={styles.positionDetailRow}>
          <Text style={styles.positionDetailLabel}>Size:</Text>
          <Text style={styles.positionDetailValue}>{position.size}</Text>
        </View>
        <View style={styles.positionDetailRow}>
          <Text style={styles.positionDetailLabel}>Entry:</Text>
          <Text style={styles.positionDetailValue}>{position.entryPrice.toFixed(4)}</Text>
        </View>
        <View style={styles.positionDetailRow}>
          <Text style={styles.positionDetailLabel}>Current:</Text>
          <Text style={styles.positionDetailValue}>{position.currentPrice.toFixed(4)}</Text>
        </View>
        <View style={styles.positionDetailRow}>
          <Text style={styles.positionDetailLabel}>Risk:</Text>
          <Text style={[
            styles.positionDetailValue,
            { color: position.riskPercent > 2 ? colors.trading.loss : colors.trading.profit }
          ]}>
            ${position.riskAmount} ({position.riskPercent}%)
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Risk Management</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading risk data...</Text>
          </View>
        ) : !riskMetrics ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load risk data</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadRiskData}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Risk Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Risk Overview</Text>
            
            <View style={styles.riskOverview}>
              <View style={styles.riskScoreContainer}>
                <Text style={styles.riskScoreLabel}>Risk Score</Text>
                <Text style={[styles.riskScoreValue, { color: getRiskScoreColor(riskMetrics.riskScore) }]}>
                  {riskMetrics.riskScore}/10
                </Text>
                <Text style={styles.riskScoreDescription}>
                  {riskMetrics.riskScore >= 8 ? 'High Risk' : 
                   riskMetrics.riskScore >= 6 ? 'Moderate Risk' : 'Low Risk'}
                </Text>
              </View>
            </View>

            <View style={styles.riskCardsContainer}>
              <RiskCard
                title="Account Balance"
                value={`$${riskMetrics.accountBalance.toLocaleString()}`}
                icon="wallet-outline"
                color={colors.primary[500]}
              />
              <RiskCard
                title="Equity"
                value={`$${riskMetrics.equity.toLocaleString()}`}
                subtitle={`${((riskMetrics.equity / riskMetrics.accountBalance - 1) * 100).toFixed(2)}%`}
                icon="trending-up-outline"
                color={riskMetrics.equity >= riskMetrics.accountBalance ? colors.trading.profit : colors.trading.loss}
              />
              <RiskCard
                title="Margin Level"
                value={`${riskMetrics.marginLevel.toFixed(0)}%`}
                subtitle={riskMetrics.marginLevel > 200 ? 'Healthy' : 'Warning'}
                icon="speedometer-outline"
                color={riskMetrics.marginLevel > 200 ? colors.trading.profit : colors.trading.warning}
              />
              <RiskCard
                title="Drawdown"
                value={`$${riskMetrics.drawdown}`}
                subtitle={`${((riskMetrics.drawdown / riskMetrics.accountBalance) * 100).toFixed(2)}%`}
                icon="trending-down-outline"
                color={colors.trading.loss}
              />
            </View>
          </View>

          {/* Position Risk Analysis */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Position Risk Analysis</Text>
            
            {positions.map((position, index) => (
              <PositionCard key={index} position={position} />
            ))}
          </View>

          {/* Position Size Calculator */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Position Size Calculator</Text>
            
            <View style={styles.calculatorCard}>
              <View style={styles.calculatorInputRow}>
                <Text style={styles.calculatorLabel}>Account Risk %</Text>
                <TextInput
                  style={styles.calculatorInput}
                  value={positionSizeCalculator.accountRisk}
                  onChangeText={(text) => setPositionSizeCalculator(prev => ({ ...prev, accountRisk: text }))}
                  keyboardType="decimal-pad"
                  placeholder="2.0"
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>

              <View style={styles.calculatorInputRow}>
                <Text style={styles.calculatorLabel}>Stop Loss Distance (pips)</Text>
                <TextInput
                  style={styles.calculatorInput}
                  value={positionSizeCalculator.stopLossDistance}
                  onChangeText={(text) => setPositionSizeCalculator(prev => ({ ...prev, stopLossDistance: text }))}
                  keyboardType="decimal-pad"
                  placeholder="50"
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>

              <View style={styles.calculatorInputRow}>
                <Text style={styles.calculatorLabel}>Leverage</Text>
                <TextInput
                  style={styles.calculatorInput}
                  value={positionSizeCalculator.leverage}
                  onChangeText={(text) => setPositionSizeCalculator(prev => ({ ...prev, leverage: text }))}
                  keyboardType="decimal-pad"
                  placeholder="100"
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>

              <TouchableOpacity style={styles.calculateButton} onPress={calculatePositionSize}>
                <LinearGradient
                  colors={[colors.primary[500], colors.secondary[500]]}
                  style={styles.calculateButtonGradient}
                >
                  <Text style={styles.calculateButtonText}>Calculate Position Size</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Risk Alerts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Risk Alerts</Text>
            
            {riskAlerts.map((alert) => (
              <View key={alert.id} style={[styles.alertCard, { borderLeftColor: getAlertColor(alert.type) }]}>
                <View style={styles.alertHeader}>
                  <MaterialIcons 
                    name={alert.type === 'danger' ? 'error' : alert.type === 'warning' ? 'warning' : 'info'} 
                    size={20} 
                    color={getAlertColor(alert.type)} 
                  />
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertTime}>
                    {Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)}m ago
                  </Text>
                </View>
                <Text style={styles.alertMessage}>{alert.message}</Text>
              </View>
            ))}
          </View>

          {/* Risk Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Risk Settings</Text>
            
            <View style={styles.settingsCard}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Max Risk Per Trade</Text>
                <Text style={styles.settingValue}>{riskSettings?.maxRiskPerTrade}%</Text>
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Max Daily Loss</Text>
                <Text style={styles.settingValue}>{riskSettings?.maxDailyLoss}%</Text>
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Margin Call Level</Text>
                <Text style={styles.settingValue}>{riskSettings?.marginCallLevel}%</Text>
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Stop Out Level</Text>
                <Text style={styles.settingValue}>{riskSettings?.stopOutLevel}%</Text>
              </View>

              <TouchableOpacity style={styles.editSettingsButton}>
                <Text style={styles.editSettingsButtonText}>Edit Risk Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[6],
  },
  section: {
    marginVertical: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  riskOverview: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  riskScoreContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: spacing[6],
    width: width * 0.5,
  },
  riskScoreLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  riskScoreValue: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    marginBottom: spacing[1],
  },
  riskScoreDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  riskCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  riskCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing[4],
    width: (width - spacing[6] * 2 - spacing[3]) / 2,
    marginBottom: spacing[3],
  },
  riskCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  riskCardTitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing[2],
  },
  riskCardValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing[1],
  },
  riskCardSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
  positionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  positionSymbol: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  positionType: {
    borderRadius: 8,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  positionTypeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  positionDetails: {
    gap: spacing[2],
  },
  positionDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  positionDetailLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  positionDetailValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  calculatorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing[6],
  },
  calculatorInputRow: {
    marginBottom: spacing[4],
  },
  calculatorLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  calculatorInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  calculateButton: {
    marginTop: spacing[4],
    borderRadius: 12,
    overflow: 'hidden',
  },
  calculateButtonGradient: {
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  calculateButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  alertCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderLeftWidth: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  alertTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginLeft: spacing[2],
    flex: 1,
  },
  alertTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
  alertMessage: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  settingsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing[6],
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingLabel: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  settingValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.primary[500],
  },
  editSettingsButton: {
    marginTop: spacing[4],
    backgroundColor: colors.primary[500],
    borderRadius: 8,
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  editSettingsButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.sizes.lg,
    color: colors.trading.loss,
  },
  retryButton: {
    marginTop: spacing[4],
    backgroundColor: colors.primary[500],
    borderRadius: 8,
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  retryText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
});

export default RiskManagementScreen;
