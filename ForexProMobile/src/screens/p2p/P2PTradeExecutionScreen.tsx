import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { addTransaction, updateBalance } from '../../store/slices/walletSlice';
import { colors, typography, spacing } from '../../theme';

const { width } = Dimensions.get('window');

interface P2POrder {
  id: string;
  userId: string;
  username: string;
  userRating: number;
  completedTrades: number;
  orderType: 'buy' | 'sell';
  currency: string;
  fiatCurrency: string;
  amount: number;
  price: number;
  minOrder: number;
  maxOrder: number;
  paymentMethods: string[];
  timeLimit: number;
  isOnline: boolean;
}

interface RouteParams {
  order: P2POrder;
  tradeType: 'buy' | 'sell';
}

const P2PTradeExecutionScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { order, tradeType } = route.params as RouteParams;
  
  const [tradeAmount, setTradeAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(order.paymentMethods[0]);
  const [loading, setLoading] = useState(false);
  const [tradeStep, setTradeStep] = useState<'setup' | 'payment' | 'confirmation' | 'completed'>('setup');

  const totalCost = parseFloat(tradeAmount || '0') * order.price;
  const isValidAmount = parseFloat(tradeAmount || '0') >= order.minOrder && parseFloat(tradeAmount || '0') <= order.maxOrder;

  const executeP2PTrade = async () => {
    if (!isValidAmount) {
      Alert.alert('Invalid Amount', `Please enter an amount between $${order.minOrder} and $${order.maxOrder}`);
      return;
    }

    setLoading(true);
    
    try {
      // Simulate trade execution with delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fee = totalCost * 0.001; // 0.1% fee
      const amount = parseFloat(tradeAmount);
      
      // Create transaction record
      const transaction = {
        id: `p2p_${Date.now()}`,
        type: 'p2p' as const,
        currency: order.currency,
        amount: tradeType === 'buy' ? amount : -amount,
        fee: fee,
        status: 'completed' as const,
        description: `P2P ${tradeType.toUpperCase()}: ${amount} ${order.currency} @ $${order.price}`,
        timestamp: new Date().toISOString(),
        relatedOrderId: order.id,
      };

      // Dispatch transaction to Redux store
      dispatch(addTransaction(transaction));
      
      // Update balance for the crypto currency
      dispatch(updateBalance({
        currency: order.currency,
        balance: 0, // This would be fetched from current balance + new amount
        availableBalance: 0, // This would be calculated properly
        lockedBalance: 0,
        displayName: order.currency,
        symbol: order.currency,
      }));

      // For fiat currency (USD), update that balance too
      const fiatTransaction = {
        id: `p2p_fiat_${Date.now()}`,
        type: 'p2p' as const,
        currency: order.fiatCurrency,
        amount: tradeType === 'buy' ? -(totalCost + fee) : totalCost - fee,
        fee: 0,
        status: 'completed' as const,
        description: `P2P ${tradeType.toUpperCase()} Payment: ${order.fiatCurrency} ${totalCost.toFixed(2)}`,
        timestamp: new Date().toISOString(),
        relatedOrderId: order.id,
      };

      dispatch(addTransaction(fiatTransaction));
      
      console.log('P2P Transactions executed:', [transaction, fiatTransaction]);
      
      setTradeStep('completed');
      
    } catch (error) {
      Alert.alert('Trade Failed', 'Unable to execute P2P trade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSetupStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Trade Setup</Text>
      
      {/* Order Summary */}
      <View style={styles.orderSummary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Trading with:</Text>
          <View style={styles.traderInfo}>
            <Text style={styles.traderName}>{order.username}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={colors.trading.warning} />
              <Text style={styles.rating}>{order.userRating.toFixed(1)}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Price:</Text>
          <Text style={styles.summaryValue}>{order.price.toFixed(4)} {order.fiatCurrency}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Limits:</Text>
          <Text style={styles.summaryValue}>${order.minOrder} - ${order.maxOrder}</Text>
        </View>
      </View>

      {/* Amount Input */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Amount ({order.currency})</Text>
        <TextInput
          style={[styles.input, !isValidAmount && tradeAmount && styles.inputError]}
          value={tradeAmount}
          onChangeText={setTradeAmount}
          placeholder={`Min: ${order.minOrder}, Max: ${order.maxOrder}`}
          placeholderTextColor={colors.text.tertiary}
          keyboardType="decimal-pad"
        />
        {!isValidAmount && tradeAmount && (
          <Text style={styles.errorText}>
            Amount must be between ${order.minOrder} and ${order.maxOrder}
          </Text>
        )}
      </View>

      {/* Payment Method */}
      <View style={styles.paymentSection}>
        <Text style={styles.inputLabel}>Payment Method</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paymentMethods}>
          {order.paymentMethods.map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.paymentMethod,
                selectedPaymentMethod === method && styles.selectedPaymentMethod
              ]}
              onPress={() => setSelectedPaymentMethod(method)}
            >
              <Text style={[
                styles.paymentMethodText,
                selectedPaymentMethod === method && styles.selectedPaymentMethodText
              ]}>
                {method}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Total Cost */}
      {tradeAmount && (
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>You will {tradeType}:</Text>
            <Text style={styles.totalValue}>{tradeAmount} {order.currency}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total cost:</Text>
            <Text style={styles.totalValue}>${totalCost.toFixed(2)} {order.fiatCurrency}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Fee (0.1%):</Text>
            <Text style={styles.totalValue}>${(totalCost * 0.001).toFixed(2)}</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderCompletedStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.successContainer}>
        <Ionicons name="checkmark-circle" size={64} color={colors.trading.profit} />
        <Text style={styles.successTitle}>Trade Completed!</Text>
        <Text style={styles.successMessage}>
          Your P2P trade has been executed successfully.
        </Text>
        
        <View style={styles.tradeDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>{tradeAmount} {order.currency}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.detailValue}>{order.price.toFixed(4)} {order.fiatCurrency}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total:</Text>
            <Text style={styles.detailValue}>${totalCost.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Counterparty:</Text>
            <Text style={styles.detailValue}>{order.username}</Text>
          </View>
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
          <Text style={styles.headerTitle}>
            {tradeType === 'buy' ? 'Buy' : 'Sell'} {order.currency}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {tradeStep === 'setup' && renderSetupStep()}
          {tradeStep === 'completed' && renderCompletedStep()}
        </ScrollView>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          {tradeStep === 'setup' && (
            <TouchableOpacity
              style={[styles.actionButton, (!isValidAmount || !tradeAmount) && styles.disabledButton]}
              onPress={executeP2PTrade}
              disabled={!isValidAmount || !tradeAmount || loading}
            >
              <LinearGradient
                colors={[colors.primary[500], colors.secondary[500]]}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <Text style={styles.buttonText}>Executing Trade...</Text>
                ) : (
                  <Text style={styles.buttonText}>
                    Confirm {tradeType === 'buy' ? 'Purchase' : 'Sale'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          {tradeStep === 'completed' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.goBack()}
            >
              <LinearGradient
                colors={[colors.primary[500], colors.secondary[500]]}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>View Wallet</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[6],
  },
  stepContainer: {
    paddingVertical: spacing[6],
  },
  stepTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[6],
  },
  orderSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  summaryLabel: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  traderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  traderName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginRight: spacing[2],
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing[1],
  },
  inputSection: {
    marginBottom: spacing[6],
  },
  inputLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputError: {
    borderColor: colors.trading.loss,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.trading.loss,
    marginTop: spacing[1],
  },
  paymentSection: {
    marginBottom: spacing[6],
  },
  paymentMethods: {
    marginTop: spacing[2],
  },
  paymentMethod: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    marginRight: spacing[3],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedPaymentMethod: {
    backgroundColor: colors.primary[500] + '30',
    borderColor: colors.primary[500],
  },
  paymentMethodText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  selectedPaymentMethodText: {
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
  },
  totalSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing[4],
    marginTop: spacing[4],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  totalLabel: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
  totalValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  successTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.trading.profit,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  successMessage: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  tradeDetails: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing[4],
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  detailLabel: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  actionContainer: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  buttonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
});

export default P2PTradeExecutionScreen;
